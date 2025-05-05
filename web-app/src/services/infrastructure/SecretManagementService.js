import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import * as crypto from 'crypto';

class SecretManagementService {
  static SECRET_TYPES = {
    API_KEY: 'api_key',
    DATABASE: 'database',
    PAYMENT: 'payment',
    ENCRYPTION: 'encryption',
    SERVICE: 'service'
  };

  static async initializeSecrets() {
    try {
      // Generate and store required secrets
      await Promise.all([
        this.generateSecret('stripe', this.SECRET_TYPES.PAYMENT),
        this.generateSecret('firebase', this.SECRET_TYPES.DATABASE),
        this.generateSecret('sendgrid', this.SECRET_TYPES.SERVICE),
        this.generateSecret('encryption', this.SECRET_TYPES.ENCRYPTION)
      ]);

      return { success: true, message: 'Secrets initialized successfully' };
    } catch (error) {
      console.error('Error initializing secrets:', error);
      throw error;
    }
  }

  static async generateSecret(name, type) {
    try {
      const secret = {
        value: crypto.randomBytes(32).toString('hex'),
        type,
        createdAt: Timestamp.now(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        rotationRequired: true
      };

      await this.storeSecret(name, secret);
      return { name, type };
    } catch (error) {
      console.error('Error generating secret:', error);
      throw error;
    }
  }

  static async rotateSecret(name) {
    try {
      const currentSecret = await this.getSecret(name);
      if (!currentSecret) throw new Error('Secret not found');

      // Generate new secret
      const newSecret = await this.generateSecret(name, currentSecret.type);

      // Store old secret for grace period
      await this.storeSecret(`${name}_old`, {
        ...currentSecret,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hour grace period
      });

      return { success: true, name, type: currentSecret.type };
    } catch (error) {
      console.error('Error rotating secret:', error);
      throw error;
    }
  }

  static async validateSecret(name, value) {
    try {
      const secret = await this.getSecret(name);
      if (!secret) return false;

      // Check current secret
      if (secret.value === value && new Date() < secret.expiresAt) {
        return true;
      }

      // Check old secret during grace period
      const oldSecret = await this.getSecret(`${name}_old`);
      if (oldSecret && oldSecret.value === value && new Date() < oldSecret.expiresAt) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error validating secret:', error);
      return false;
    }
  }

  static async storeSecret(name, secret) {
    try {
      // Encrypt secret before storing
      const encryptedSecret = this.encryptSecret(secret);

      await setDoc(doc(db, 'secrets', name), {
        ...encryptedSecret,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error storing secret:', error);
      throw error;
    }
  }

  static async getSecret(name) {
    try {
      const doc = await getDoc(doc(db, 'secrets', name));
      if (!doc.exists()) return null;

      // Decrypt secret
      const encryptedSecret = doc.data();
      return this.decryptSecret(encryptedSecret);
    } catch (error) {
      console.error('Error getting secret:', error);
      throw error;
    }
  }

  static encryptSecret(secret) {
    // Use encryption key from environment
    const key = Buffer.from(process.env.SECRET_ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(secret), 'utf8'),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  static decryptSecret(encryptedSecret) {
    const key = Buffer.from(process.env.SECRET_ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(encryptedSecret.iv, 'hex');
    const authTag = Buffer.from(encryptedSecret.authTag, 'hex');
    const encrypted = Buffer.from(encryptedSecret.encrypted, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  }
}

export default SecretManagementService;
