import { db, storage } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import NotificationService from '../NotificationService';

class BackupService {
  static BACKUP_TYPES = {
    FULL: 'full_backup',
    INCREMENTAL: 'incremental_backup',
    DIFFERENTIAL: 'differential_backup'
  };

  static BACKUP_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed',
    VERIFIED: 'verified'
  };

  static async initialize() {
    try {
      // Initialize backup system
      await Promise.all([
        this.initializeBackupStorage(),
        this.initializeBackupScheduler(),
        this.initializeRetentionPolicy(),
        this.initializeVerification()
      ]);

      // Start backup scheduler
      this.startBackupScheduler();

      return { success: true, message: 'Backup service initialized' };
    } catch (error) {
      console.error('Error initializing backup service:', error);
      throw error;
    }
  }

  static async createBackup(type = this.BACKUP_TYPES.FULL) {
    try {
      // Create backup metadata
      const backupId = `backup_${Date.now()}`;
      const metadata = {
        id: backupId,
        type,
        status: this.BACKUP_STATUS.IN_PROGRESS,
        startTime: Timestamp.now()
      };

      // Store backup metadata
      await this.storeBackupMetadata(metadata);

      // Collect data to backup
      const data = await this.collectBackupData(type);

      // Encrypt data
      const encryptedData = await this.encryptBackupData(data);

      // Upload to storage
      const storageRef = ref(storage, `backups/${backupId}`);
      await uploadBytes(storageRef, encryptedData);

      // Update metadata
      metadata.status = this.BACKUP_STATUS.COMPLETED;
      metadata.endTime = Timestamp.now();
      metadata.size = encryptedData.length;
      await this.storeBackupMetadata(metadata);

      // Verify backup
      const verified = await this.verifyBackup(backupId);
      if (verified) {
        metadata.status = this.BACKUP_STATUS.VERIFIED;
        await this.storeBackupMetadata(metadata);
      }

      return {
        backupId,
        status: metadata.status,
        size: metadata.size
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      await this.handleBackupFailure(backupId, error);
      throw error;
    }
  }

  static async restoreBackup(backupId) {
    try {
      // Get backup metadata
      const metadata = await this.getBackupMetadata(backupId);
      if (!metadata) {
        throw new Error('Backup not found');
      }

      // Verify backup before restore
      const verified = await this.verifyBackup(backupId);
      if (!verified) {
        throw new Error('Backup verification failed');
      }

      // Download backup data
      const storageRef = ref(storage, `backups/${backupId}`);
      const url = await getDownloadURL(storageRef);
      const response = await fetch(url);
      const encryptedData = await response.arrayBuffer();

      // Decrypt data
      const data = await this.decryptBackupData(encryptedData);

      // Restore data
      await this.restoreData(data);

      // Log restoration
      await this.logRestoration(backupId);

      return {
        success: true,
        backupId,
        timestamp: Timestamp.now()
      };
    } catch (error) {
      console.error('Error restoring backup:', error);
      await this.handleRestoreFailure(backupId, error);
      throw error;
    }
  }

  static async collectBackupData(type) {
    const data = {
      collections: {},
      timestamp: Timestamp.now()
    };

    // Get list of collections to backup
    const collections = await this.getCollectionsToBackup(type);

    // Collect data from each collection
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      
      data.collections[collectionName] = [];
      querySnapshot.forEach(doc => {
        data.collections[collectionName].push({
          id: doc.id,
          data: doc.data()
        });
      });
    }

    return data;
  }

  static async encryptBackupData(data) {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));

      // Get encryption key
      const key = await this.getEncryptionKey();

      // Encrypt data
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        dataBuffer
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);

      return combined;
    } catch (error) {
      console.error('Error encrypting backup data:', error);
      throw error;
    }
  }

  static async decryptBackupData(encryptedData) {
    try {
      // Extract IV and data
      const iv = encryptedData.slice(0, 12);
      const data = encryptedData.slice(12);

      // Get encryption key
      const key = await this.getEncryptionKey();

      // Decrypt data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        data
      );

      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decryptedBuffer));
    } catch (error) {
      console.error('Error decrypting backup data:', error);
      throw error;
    }
  }

  static async verifyBackup(backupId) {
    try {
      // Download backup
      const storageRef = ref(storage, `backups/${backupId}`);
      const url = await getDownloadURL(storageRef);
      const response = await fetch(url);
      const encryptedData = await response.arrayBuffer();

      // Decrypt and verify data integrity
      const data = await this.decryptBackupData(encryptedData);

      // Verify each collection
      for (const [collectionName, documents] of Object.entries(data.collections)) {
        const collectionRef = collection(db, collectionName);
        for (const doc of documents) {
          const docRef = doc(collectionRef, doc.id);
          const currentDoc = await getDoc(docRef);
          
          // Compare current data with backup
          if (!this.compareDocuments(currentDoc.data(), doc.data)) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error verifying backup:', error);
      return false;
    }
  }

  // Utility Methods
  static async storeBackupMetadata(metadata) {
    try {
      await setDoc(doc(db, 'backups', metadata.id), metadata);
    } catch (error) {
      console.error('Error storing backup metadata:', error);
      throw error;
    }
  }

  static async getBackupMetadata(backupId) {
    try {
      const docRef = doc(db, 'backups', backupId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error getting backup metadata:', error);
      throw error;
    }
  }

  static async handleBackupFailure(backupId, error) {
    try {
      await setDoc(doc(db, 'backups', backupId), {
        status: this.BACKUP_STATUS.FAILED,
        error: error.message,
        timestamp: Timestamp.now()
      }, { merge: true });

      await NotificationService.notifyAdmins('BACKUP_FAILURE', {
        backupId,
        error: error.message
      });
    } catch (err) {
      console.error('Error handling backup failure:', err);
    }
  }

  static startBackupScheduler() {
    // Schedule daily full backup
    setInterval(() => {
      this.createBackup(this.BACKUP_TYPES.FULL);
    }, 24 * 60 * 60 * 1000);

    // Schedule hourly incremental backup
    setInterval(() => {
      this.createBackup(this.BACKUP_TYPES.INCREMENTAL);
    }, 60 * 60 * 1000);
  }

  static compareDocuments(doc1, doc2) {
    // Deep comparison of document data
    return JSON.stringify(doc1) === JSON.stringify(doc2);
  }
}

export default BackupService;
