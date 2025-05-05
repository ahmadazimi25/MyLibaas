import { functions } from './firebase/firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { db } from './firebase/firebaseConfig';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

class SMSService {
  static TEMPLATES = {
    DISPUTE_UPDATE: {
      id: 'dispute_update',
      template: 'Your dispute #{disputeId} has been {status}. {message}',
      priority: 'high'
    },
    RENTAL_REMINDER: {
      id: 'rental_reminder',
      template: 'Reminder: Your rental of {itemName} is due for return on {dueDate}.',
      priority: 'medium'
    },
    PAYMENT_CONFIRMATION: {
      id: 'payment_confirmation',
      template: 'Payment of ₹{amount} received for rental #{rentalId}.',
      priority: 'high'
    },
    LISTING_APPROVED: {
      id: 'listing_approved',
      template: 'Your listing "{title}" has been approved and is now live!',
      priority: 'medium'
    },
    ACCOUNT_WARNING: {
      id: 'account_warning',
      template: 'Warning: {message}. Please contact support for more information.',
      priority: 'urgent'
    },
    SECURITY_ALERT: {
      id: 'security_alert',
      template: 'Security alert: {message}. If this wasn\'t you, please contact support immediately.',
      priority: 'urgent'
    }
  };

  static async sendSMS(phoneNumber, templateId, data) {
    try {
      const template = this.TEMPLATES[templateId];
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      const message = this.formatMessage(template.template, data);
      
      // Log the SMS attempt
      await this.logSMSAttempt(phoneNumber, templateId, data);

      // Call Firebase Function to send SMS
      const sendSMSFunction = httpsCallable(functions, 'sendSMS');
      const result = await sendSMSFunction({
        to: phoneNumber,
        message,
        priority: template.priority
      });

      // Log successful send
      await this.updateSMSLog(result.data.messageId, 'delivered');

      return result.data.messageId;
    } catch (error) {
      console.error('Error sending SMS:', error);
      // Log failed attempt
      await this.updateSMSLog(error.messageId, 'failed', error.message);
      throw error;
    }
  }

  static formatMessage(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  static async sendBulkSMS(recipients, templateId, data) {
    try {
      const results = await Promise.allSettled(
        recipients.map(recipient => 
          this.sendSMS(recipient.phoneNumber, templateId, {
            ...data,
            ...recipient.data
          })
        )
      );

      return results.map((result, index) => ({
        phoneNumber: recipients[index].phoneNumber,
        status: result.status,
        messageId: result.value,
        error: result.reason
      }));
    } catch (error) {
      console.error('Error in bulk SMS:', error);
      throw error;
    }
  }

  static async logSMSAttempt(phoneNumber, templateId, data) {
    try {
      const logRef = await addDoc(collection(db, 'smsLogs'), {
        phoneNumber,
        templateId,
        data,
        timestamp: Timestamp.now(),
        status: 'pending'
      });
      return logRef.id;
    } catch (error) {
      console.error('Error logging SMS attempt:', error);
    }
  }

  static async updateSMSLog(messageId, status, error = null) {
    try {
      const logsRef = collection(db, 'smsLogs');
      const q = query(logsRef, where('messageId', '==', messageId));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach(async (doc) => {
        await doc.ref.update({
          status,
          error,
          updatedAt: Timestamp.now()
        });
      });
    } catch (error) {
      console.error('Error updating SMS log:', error);
    }
  }

  static async sendDisputeUpdate(phoneNumber, disputeId, status, message) {
    return this.sendSMS(phoneNumber, 'dispute_update', {
      disputeId,
      status,
      message
    });
  }

  static async sendRentalReminder(phoneNumber, itemName, dueDate) {
    return this.sendSMS(phoneNumber, 'rental_reminder', {
      itemName,
      dueDate: new Date(dueDate).toLocaleDateString()
    });
  }

  static async sendPaymentConfirmation(phoneNumber, amount, rentalId) {
    return this.sendSMS(phoneNumber, 'payment_confirmation', {
      amount,
      rentalId
    });
  }

  static async sendListingApproved(phoneNumber, title) {
    return this.sendSMS(phoneNumber, 'listing_approved', {
      title
    });
  }

  static async sendAccountWarning(phoneNumber, message) {
    return this.sendSMS(phoneNumber, 'account_warning', {
      message
    });
  }

  static async sendSecurityAlert(phoneNumber, message) {
    return this.sendSMS(phoneNumber, 'security_alert', {
      message
    });
  }
}

export default SMSService;
