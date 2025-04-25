import { db, functions } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

class SecurityNotificationService {
  constructor() {
    this.notificationsCollection = collection(db, 'securityNotifications');
    this.sendEmailFunction = httpsCallable(functions, 'sendSecurityEmail');
    this.sendSMSFunction = httpsCallable(functions, 'sendSecuritySMS');
    this.pushNotificationFunction = httpsCallable(functions, 'sendPushNotification');
  }

  async notifyAdmins(violationData) {
    const notification = {
      type: 'security_alert',
      severity: this.calculateSeverity(violationData),
      timestamp: new Date(),
      data: violationData,
      status: 'pending',
    };

    try {
      // Store notification
      const notificationRef = await addDoc(this.notificationsCollection, notification);

      // Send immediate alerts for high-severity issues
      if (notification.severity === 'high') {
        await this.sendUrgentAlerts(notification);
      }

      // Queue notification for dashboard
      await this.queueDashboardAlert(notification);

      return notificationRef.id;
    } catch (error) {
      console.error('Error sending security notification:', error);
      throw error;
    }
  }

  async notifySecurityTeam(pattern) {
    const alert = {
      type: 'suspicious_pattern',
      timestamp: new Date(),
      pattern,
      status: 'unreviewed',
    };

    try {
      // Store alert
      const alertRef = await addDoc(collection(db, 'securityAlerts'), alert);

      // Send real-time notification
      await this.sendSecurityTeamAlert(alert);

      return alertRef.id;
    } catch (error) {
      console.error('Error notifying security team:', error);
      throw error;
    }
  }

  async sendBatchReport(timeframe = 'daily') {
    const reports = await this.generateBatchReport(timeframe);
    
    try {
      // Send email report
      await this.sendEmailFunction({
        template: 'security_report',
        data: reports,
        timeframe
      });

      // Update report status
      await this.updateReportStatus(timeframe);
    } catch (error) {
      console.error('Error sending batch report:', error);
      throw error;
    }
  }

  // Private methods
  calculateSeverity(violationData) {
    const { 
      frequency = 0,
      userHistory = [],
      violationType,
      mlConfidence = 0
    } = violationData;

    // Calculate severity based on multiple factors
    let severityScore = 0;

    // Factor 1: Frequency of violations
    severityScore += frequency * 0.3;

    // Factor 2: User history
    severityScore += (userHistory.length * 0.2);

    // Factor 3: Violation type severity
    const typeSeverity = {
      'personal_info': 0.8,
      'platform_evasion': 0.9,
      'spam': 0.5,
      'suspicious': 0.6
    };
    severityScore += (typeSeverity[violationType] || 0.5) * 0.3;

    // Factor 4: ML confidence
    severityScore += mlConfidence * 0.2;

    // Determine final severity level
    if (severityScore >= 0.8) return 'high';
    if (severityScore >= 0.5) return 'medium';
    return 'low';
  }

  async sendUrgentAlerts(notification) {
    const promises = [
      this.sendEmailFunction({
        template: 'urgent_security_alert',
        data: notification
      }),
      this.sendSMSFunction({
        template: 'urgent_security_alert',
        data: notification
      }),
      this.pushNotificationFunction({
        title: 'Urgent Security Alert',
        body: this.generateAlertBody(notification),
        data: notification
      })
    ];

    await Promise.all(promises);
  }

  async queueDashboardAlert(notification) {
    await addDoc(collection(db, 'dashboardAlerts'), {
      ...notification,
      displayed: false,
      createdAt: new Date()
    });
  }

  generateAlertBody(notification) {
    const { type, severity, data } = notification;
    return `${severity.toUpperCase()} Alert: ${type} detected. ${data.summary || ''}`;
  }

  async generateBatchReport(timeframe) {
    const startDate = this.getReportStartDate(timeframe);
    const query = await getDocs(
      query(
        this.notificationsCollection,
        where('timestamp', '>=', startDate)
      )
    );

    const notifications = [];
    query.forEach(doc => notifications.push(doc.data()));

    return {
      timeframe,
      total: notifications.length,
      bySeverity: this.groupBySeverity(notifications),
      byType: this.groupByType(notifications),
      trends: this.analyzeTrends(notifications),
      recommendations: this.generateRecommendations(notifications)
    };
  }

  getReportStartDate(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case 'hourly':
        return new Date(now.setHours(now.getHours() - 1));
      case 'daily':
        return new Date(now.setDate(now.getDate() - 1));
      case 'weekly':
        return new Date(now.setDate(now.getDate() - 7));
      default:
        return new Date(now.setDate(now.getDate() - 1));
    }
  }

  groupBySeverity(notifications) {
    return notifications.reduce((acc, curr) => {
      acc[curr.severity] = (acc[curr.severity] || 0) + 1;
      return acc;
    }, {});
  }

  groupByType(notifications) {
    return notifications.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {});
  }

  analyzeTrends(notifications) {
    // Implement trend analysis
    return {
      increasingPatterns: [],
      decreasingPatterns: [],
      newPatterns: []
    };
  }

  generateRecommendations(notifications) {
    // Implement recommendation generation
    return [];
  }

  async updateReportStatus(timeframe) {
    const reportRef = doc(db, 'securityReports', timeframe);
    await updateDoc(reportRef, {
      lastSent: new Date(),
      status: 'sent'
    });
  }
}

export default new SecurityNotificationService();
