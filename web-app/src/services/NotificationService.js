import { db } from './firebase/firebaseConfig';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { functions } from './firebase/firebaseConfig';
import { httpsCallable } from 'firebase/functions';

class NotificationService {
  static NOTIFICATION_TYPES = {
    REPORT_READY: 'report_ready',
    DISPUTE_UPDATE: 'dispute_update',
    LISTING_MODERATION: 'listing_moderation',
    SYSTEM_ALERT: 'system_alert',
    USER_WARNING: 'user_warning',
    USAGE_ALERT: 'usage_alert'
  };

  static PRIORITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  };

  static async sendEmail(recipientEmail, template, data) {
    try {
      const sendEmailFunction = httpsCallable(functions, 'sendEmail');
      await sendEmailFunction({
        recipient: recipientEmail,
        template,
        data
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  static async notifyAdmins(type, data, priority = this.PRIORITY_LEVELS.MEDIUM) {
    try {
      // Get all admin users
      const adminsRef = collection(db, 'users');
      const adminQuery = query(adminsRef, where('role', '==', 'admin'));
      const adminDocs = await getDocs(adminQuery);
      
      // Create notification in database
      const notification = {
        type,
        data,
        priority,
        timestamp: Timestamp.now(),
        read: false
      };
      
      const notificationRef = await addDoc(collection(db, 'notifications'), notification);
      
      // Send email to each admin
      const emailPromises = adminDocs.docs.map(async (adminDoc) => {
        const adminData = adminDoc.data();
        if (adminData.email && adminData.emailNotifications) {
          await this.sendEmail(
            adminData.email,
            this.getEmailTemplate(type),
            {
              ...data,
              adminName: adminData.name,
              notificationId: notificationRef.id
            }
          );
        }
      });
      
      await Promise.all(emailPromises);
      
      return notificationRef.id;
    } catch (error) {
      console.error('Error notifying admins:', error);
      throw error;
    }
  }

  static getEmailTemplate(type) {
    const templates = {
      [this.NOTIFICATION_TYPES.REPORT_READY]: 'report-ready-template',
      [this.NOTIFICATION_TYPES.DISPUTE_UPDATE]: 'dispute-update-template',
      [this.NOTIFICATION_TYPES.LISTING_MODERATION]: 'listing-moderation-template',
      [this.NOTIFICATION_TYPES.SYSTEM_ALERT]: 'system-alert-template',
      [this.NOTIFICATION_TYPES.USER_WARNING]: 'user-warning-template',
      [this.NOTIFICATION_TYPES.USAGE_ALERT]: 'usage-alert-template'
    };
    
    return templates[type] || 'default-template';
  }

  static async scheduleReport(reportType, schedule, recipients) {
    try {
      const scheduleData = {
        reportType,
        schedule, // cron expression
        recipients,
        createdAt: Timestamp.now(),
        status: 'active'
      };
      
      const scheduleRef = await addDoc(collection(db, 'reportSchedules'), scheduleData);
      
      // Notify recipients
      await this.notifyAdmins(
        this.NOTIFICATION_TYPES.SYSTEM_ALERT,
        {
          message: `New ${reportType} report scheduled`,
          schedule,
          reportId: scheduleRef.id
        },
        this.PRIORITY_LEVELS.LOW
      );
      
      return scheduleRef.id;
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  }

  static async sendUsageAlert(metric, currentUsage, limit) {
    const percentage = (currentUsage / limit) * 100;
    let priority;
    
    if (percentage >= 90) {
      priority = this.PRIORITY_LEVELS.URGENT;
    } else if (percentage >= 75) {
      priority = this.PRIORITY_LEVELS.HIGH;
    } else if (percentage >= 50) {
      priority = this.PRIORITY_LEVELS.MEDIUM;
    } else {
      priority = this.PRIORITY_LEVELS.LOW;
    }
    
    await this.notifyAdmins(
      this.NOTIFICATION_TYPES.USAGE_ALERT,
      {
        metric,
        currentUsage,
        limit,
        percentage,
        timestamp: new Date().toISOString()
      },
      priority
    );
  }

  static async sendDisputeUpdate(disputeId, status, message) {
    await this.notifyAdmins(
      this.NOTIFICATION_TYPES.DISPUTE_UPDATE,
      {
        disputeId,
        status,
        message,
        timestamp: new Date().toISOString()
      },
      this.PRIORITY_LEVELS.HIGH
    );
  }

  static async sendListingModerationAlert(listingId, issues) {
    await this.notifyAdmins(
      this.NOTIFICATION_TYPES.LISTING_MODERATION,
      {
        listingId,
        issues,
        timestamp: new Date().toISOString()
      },
      this.PRIORITY_LEVELS.MEDIUM
    );
  }

  static async sendUserWarning(userId, reason, action) {
    await this.notifyAdmins(
      this.NOTIFICATION_TYPES.USER_WARNING,
      {
        userId,
        reason,
        action,
        timestamp: new Date().toISOString()
      },
      this.PRIORITY_LEVELS.HIGH
    );
  }
}

export default NotificationService;
