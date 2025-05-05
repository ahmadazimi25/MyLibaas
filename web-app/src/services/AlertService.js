import { db } from './firebase/firebaseConfig';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

class AlertService {
  static ALERT_THRESHOLDS = {
    STORAGE: {
      WARNING: 0.7, // 70% of free tier
      CRITICAL: 0.9  // 90% of free tier
    },
    DATABASE: {
      WARNING: 0.7,
      CRITICAL: 0.9
    },
    BANDWIDTH: {
      WARNING: 0.7,
      CRITICAL: 0.9
    }
  };

  static LIMITS = {
    STORAGE_GB: 5,  // 5GB free tier
    DATABASE_READS: 50000,  // daily
    DATABASE_WRITES: 20000, // daily
    BANDWIDTH_GB: 1  // 1GB/day
  };

  static async checkStorageUsage() {
    try {
      const statsRef = doc(db, 'system', 'stats');
      const stats = await getDoc(statsRef);
      const storageUsed = stats.data()?.storageUsed || 0;
      
      const usagePercentage = storageUsed / (this.LIMITS.STORAGE_GB * 1024 * 1024 * 1024);
      
      if (usagePercentage >= this.ALERT_THRESHOLDS.STORAGE.CRITICAL) {
        await this.createAlert('CRITICAL', 'Storage usage critical', {
          current: storageUsed,
          limit: this.LIMITS.STORAGE_GB * 1024 * 1024 * 1024,
          percentage: usagePercentage * 100
        });
      } else if (usagePercentage >= this.ALERT_THRESHOLDS.STORAGE.WARNING) {
        await this.createAlert('WARNING', 'Storage usage warning', {
          current: storageUsed,
          limit: this.LIMITS.STORAGE_GB * 1024 * 1024 * 1024,
          percentage: usagePercentage * 100
        });
      }
    } catch (error) {
      console.error('Error checking storage usage:', error);
    }
  }

  static async checkDatabaseUsage() {
    try {
      const date = new Date().toISOString().split('T')[0];
      const usageRef = doc(db, 'usage', date);
      const usage = await getDoc(usageRef);
      const data = usage.data() || {};
      
      // Check reads
      const readPercentage = (data.databaseReads || 0) / this.LIMITS.DATABASE_READS;
      if (readPercentage >= this.ALERT_THRESHOLDS.DATABASE.CRITICAL) {
        await this.createAlert('CRITICAL', 'Database reads critical', {
          current: data.databaseReads,
          limit: this.LIMITS.DATABASE_READS,
          percentage: readPercentage * 100
        });
      } else if (readPercentage >= this.ALERT_THRESHOLDS.DATABASE.WARNING) {
        await this.createAlert('WARNING', 'Database reads warning', {
          current: data.databaseReads,
          limit: this.LIMITS.DATABASE_READS,
          percentage: readPercentage * 100
        });
      }

      // Check writes
      const writePercentage = (data.databaseWrites || 0) / this.LIMITS.DATABASE_WRITES;
      if (writePercentage >= this.ALERT_THRESHOLDS.DATABASE.CRITICAL) {
        await this.createAlert('CRITICAL', 'Database writes critical', {
          current: data.databaseWrites,
          limit: this.LIMITS.DATABASE_WRITES,
          percentage: writePercentage * 100
        });
      } else if (writePercentage >= this.ALERT_THRESHOLDS.DATABASE.WARNING) {
        await this.createAlert('WARNING', 'Database writes warning', {
          current: data.databaseWrites,
          limit: this.LIMITS.DATABASE_WRITES,
          percentage: writePercentage * 100
        });
      }
    } catch (error) {
      console.error('Error checking database usage:', error);
    }
  }

  static async checkBandwidthUsage() {
    try {
      const date = new Date().toISOString().split('T')[0];
      const usageRef = doc(db, 'usage', date);
      const usage = await getDoc(usageRef);
      const bandwidth = usage.data()?.bandwidth || 0;
      
      const usagePercentage = bandwidth / (this.LIMITS.BANDWIDTH_GB * 1024 * 1024 * 1024);
      
      if (usagePercentage >= this.ALERT_THRESHOLDS.BANDWIDTH.CRITICAL) {
        await this.createAlert('CRITICAL', 'Bandwidth usage critical', {
          current: bandwidth,
          limit: this.LIMITS.BANDWIDTH_GB * 1024 * 1024 * 1024,
          percentage: usagePercentage * 100
        });
      } else if (usagePercentage >= this.ALERT_THRESHOLDS.BANDWIDTH.WARNING) {
        await this.createAlert('WARNING', 'Bandwidth usage warning', {
          current: bandwidth,
          limit: this.LIMITS.BANDWIDTH_GB * 1024 * 1024 * 1024,
          percentage: usagePercentage * 100
        });
      }
    } catch (error) {
      console.error('Error checking bandwidth usage:', error);
    }
  }

  static async createAlert(severity, message, details) {
    try {
      const alertsRef = collection(db, 'alerts');
      await setDoc(doc(alertsRef), {
        severity,
        message,
        details,
        timestamp: new Date(),
        acknowledged: false
      });

      // Notify admins
      await this.notifyAdmins(severity, message, details);
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  static async notifyAdmins(severity, message, details) {
    try {
      // Get admin users
      const usersRef = collection(db, 'users');
      const adminQuery = query(usersRef, where('role', '==', 'admin'));
      const admins = await getDocs(adminQuery);

      // Create notifications for each admin
      const notifications = admins.docs.map(admin => ({
        userId: admin.id,
        type: 'USAGE_ALERT',
        severity,
        message,
        details,
        timestamp: new Date(),
        read: false
      }));

      // Batch write notifications
      const notificationsRef = collection(db, 'notifications');
      await Promise.all(notifications.map(notification => 
        setDoc(doc(notificationsRef), notification)
      ));
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  }

  static async getActiveAlerts() {
    try {
      const alertsRef = collection(db, 'alerts');
      const alertsQuery = query(alertsRef, where('acknowledged', '==', false));
      const alerts = await getDocs(alertsQuery);
      
      return alerts.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting active alerts:', error);
      return [];
    }
  }

  static async acknowledgeAlert(alertId) {
    try {
      const alertRef = doc(db, 'alerts', alertId);
      await setDoc(alertRef, {
        acknowledged: true,
        acknowledgedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }
}

export default AlertService;
