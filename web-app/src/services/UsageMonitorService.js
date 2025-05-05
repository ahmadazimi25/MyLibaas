import { db, auth } from './firebase/firebaseConfig';
import { collection, doc, setDoc, increment, getDoc } from 'firebase/firestore';

class UsageMonitorService {
  static DAILY_LIMITS = {
    DATABASE_READS: 50000,
    DATABASE_WRITES: 20000,
    STORAGE_UPLOAD: 20000,
    BANDWIDTH: 1024 * 1024 * 1024, // 1GB in bytes
  };

  static async trackDatabaseRead() {
    const date = new Date().toISOString().split('T')[0];
    const usageRef = doc(db, 'usage', date);

    try {
      await setDoc(usageRef, {
        databaseReads: increment(1)
      }, { merge: true });

      // Check if approaching limit
      const usage = await getDoc(usageRef);
      const reads = usage.data()?.databaseReads || 0;
      
      if (reads > this.DAILY_LIMITS.DATABASE_READS * 0.8) {
        this.sendAlert('Database reads at 80% of daily limit');
      }
    } catch (error) {
      console.error('Error tracking database read:', error);
    }
  }

  static async trackDatabaseWrite() {
    const date = new Date().toISOString().split('T')[0];
    const usageRef = doc(db, 'usage', date);

    try {
      await setDoc(usageRef, {
        databaseWrites: increment(1)
      }, { merge: true });

      const usage = await getDoc(usageRef);
      const writes = usage.data()?.databaseWrites || 0;
      
      if (writes > this.DAILY_LIMITS.DATABASE_WRITES * 0.8) {
        this.sendAlert('Database writes at 80% of daily limit');
      }
    } catch (error) {
      console.error('Error tracking database write:', error);
    }
  }

  static async trackStorageUpload(sizeInBytes) {
    const date = new Date().toISOString().split('T')[0];
    const usageRef = doc(db, 'usage', date);

    try {
      await setDoc(usageRef, {
        storageUploads: increment(1),
        storageBandwidth: increment(sizeInBytes)
      }, { merge: true });

      const usage = await getDoc(usageRef);
      const bandwidth = usage.data()?.storageBandwidth || 0;
      
      if (bandwidth > this.DAILY_LIMITS.BANDWIDTH * 0.8) {
        this.sendAlert('Storage bandwidth at 80% of daily limit');
      }
    } catch (error) {
      console.error('Error tracking storage upload:', error);
    }
  }

  static async sendAlert(message) {
    // Get admin users
    const adminsRef = collection(db, 'users');
    const adminDoc = await getDoc(doc(adminsRef, 'admins'));
    const adminEmails = adminDoc.data()?.emails || [];

    // Create notification
    const notificationRef = collection(db, 'notifications');
    await setDoc(doc(notificationRef), {
      type: 'USAGE_ALERT',
      message,
      timestamp: new Date(),
      recipients: adminEmails,
      read: false
    });
  }

  static async getDailyUsage(date = new Date().toISOString().split('T')[0]) {
    const usageRef = doc(db, 'usage', date);
    const usage = await getDoc(usageRef);
    return usage.data() || {
      databaseReads: 0,
      databaseWrites: 0,
      storageUploads: 0,
      storageBandwidth: 0
    };
  }
}

export default UsageMonitorService;
