import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import NotificationService from '../NotificationService';

class SecurityReportingService {
  static REPORT_TYPES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    INCIDENT: 'incident',
    AUDIT: 'audit'
  };

  static REPORT_CATEGORIES = {
    TRAFFIC: 'traffic',
    SECURITY: 'security',
    PERFORMANCE: 'performance',
    USER: 'user',
    SYSTEM: 'system'
  };

  static async generateReport(type, options = {}) {
    try {
      const startTime = options.startTime || this.getReportStartTime(type);
      const endTime = options.endTime || new Date();

      // Gather data for report
      const [
        trafficStats,
        securityEvents,
        performanceMetrics,
        userActivity,
        systemHealth
      ] = await Promise.all([
        this.getTrafficStats(startTime, endTime),
        this.getSecurityEvents(startTime, endTime),
        this.getPerformanceMetrics(startTime, endTime),
        this.getUserActivity(startTime, endTime),
        this.getSystemHealth(startTime, endTime)
      ]);

      // Generate report
      const report = {
        type,
        timeRange: {
          start: startTime,
          end: endTime
        },
        summary: this.generateSummary({
          trafficStats,
          securityEvents,
          performanceMetrics,
          userActivity,
          systemHealth
        }),
        details: {
          traffic: trafficStats,
          security: securityEvents,
          performance: performanceMetrics,
          user: userActivity,
          system: systemHealth
        },
        recommendations: this.generateRecommendations({
          trafficStats,
          securityEvents,
          performanceMetrics,
          userActivity,
          systemHealth
        })
      };

      // Store report
      await this.storeReport(report);

      // Notify relevant parties
      await this.notifyReportStakeholders(report);

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  static async getTrafficStats(startTime, endTime) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'requests'),
          where('timestamp', '>=', startTime),
          where('timestamp', '<=', endTime)
        )
      );

      const requests = [];
      snapshot.forEach(doc => requests.push(doc.data()));

      return {
        totalRequests: requests.length,
        uniqueUsers: new Set(requests.map(r => r.userId)).size,
        peakTraffic: this.calculatePeakTraffic(requests),
        geographicDistribution: this.analyzeGeographicDistribution(requests),
        deviceDistribution: this.analyzeDeviceDistribution(requests),
        errorRates: this.calculateErrorRates(requests)
      };
    } catch (error) {
      console.error('Error getting traffic stats:', error);
      throw error;
    }
  }

  static async getSecurityEvents(startTime, endTime) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'securityEvents'),
          where('timestamp', '>=', startTime),
          where('timestamp', '<=', endTime)
        )
      );

      const events = [];
      snapshot.forEach(doc => events.push(doc.data()));

      return {
        totalEvents: events.length,
        criticalEvents: events.filter(e => e.severity === 'critical').length,
        threatTypes: this.analyzeThreatTypes(events),
        blockedIPs: this.analyzeBlockedIPs(events),
        suspiciousActivities: this.analyzeSuspiciousActivities(events),
        resolutionStats: this.calculateResolutionStats(events)
      };
    } catch (error) {
      console.error('Error getting security events:', error);
      throw error;
    }
  }

  static async getPerformanceMetrics(startTime, endTime) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'performance'),
          where('timestamp', '>=', startTime),
          where('timestamp', '<=', endTime)
        )
      );

      const metrics = [];
      snapshot.forEach(doc => metrics.push(doc.data()));

      return {
        averageResponseTime: this.calculateAverageResponseTime(metrics),
        serverLoad: this.analyzeServerLoad(metrics),
        errorRates: this.analyzeErrorRates(metrics),
        resourceUtilization: this.analyzeResourceUtilization(metrics),
        bottlenecks: this.identifyBottlenecks(metrics)
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }

  static async getUserActivity(startTime, endTime) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'userActivity'),
          where('timestamp', '>=', startTime),
          where('timestamp', '<=', endTime)
        )
      );

      const activities = [];
      snapshot.forEach(doc => activities.push(doc.data()));

      return {
        activeUsers: this.countActiveUsers(activities),
        userActions: this.analyzeUserActions(activities),
        suspiciousActivity: this.detectSuspiciousActivity(activities),
        userSessions: this.analyzeUserSessions(activities),
        userDevices: this.analyzeUserDevices(activities)
      };
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw error;
    }
  }

  static async getSystemHealth(startTime, endTime) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'systemHealth'),
          where('timestamp', '>=', startTime),
          where('timestamp', '<=', endTime)
        )
      );

      const healthData = [];
      snapshot.forEach(doc => healthData.push(doc.data()));

      return {
        uptime: this.calculateUptime(healthData),
        resourceUsage: this.analyzeResourceUsage(healthData),
        errors: this.analyzeSystemErrors(healthData),
        warnings: this.analyzeSystemWarnings(healthData),
        maintenance: this.analyzeMaintenanceEvents(healthData)
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      throw error;
    }
  }

  static generateSummary(data) {
    return {
      overview: {
        totalRequests: data.trafficStats.totalRequests,
        uniqueUsers: data.trafficStats.uniqueUsers,
        criticalEvents: data.securityEvents.criticalEvents,
        performanceScore: this.calculatePerformanceScore(data.performanceMetrics),
        systemHealth: this.calculateSystemHealthScore(data.systemHealth)
      },
      highlights: this.generateHighlights(data),
      concerns: this.identifyConcerns(data),
      trends: this.analyzeTrends(data)
    };
  }

  static generateRecommendations(data) {
    const recommendations = [];

    // Security recommendations
    if (data.securityEvents.criticalEvents > 0) {
      recommendations.push({
        category: 'security',
        priority: 'high',
        action: 'Review and update security policies',
        reason: `${data.securityEvents.criticalEvents} critical security events detected`
      });
    }

    // Performance recommendations
    if (data.performanceMetrics.averageResponseTime > 1000) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        action: 'Optimize server response time',
        reason: 'Average response time exceeds 1 second'
      });
    }

    // System recommendations
    if (data.systemHealth.resourceUsage.cpu > 80) {
      recommendations.push({
        category: 'system',
        priority: 'high',
        action: 'Scale system resources',
        reason: 'High CPU utilization detected'
      });
    }

    return recommendations;
  }

  static async storeReport(report) {
    try {
      const reportId = `${report.type}_${Date.now()}`;
      await setDoc(doc(db, 'securityReports', reportId), {
        ...report,
        timestamp: Timestamp.now()
      });

      return reportId;
    } catch (error) {
      console.error('Error storing report:', error);
      throw error;
    }
  }

  static async notifyReportStakeholders(report) {
    try {
      // Notify admins for all reports
      await NotificationService.notifyAdmins(
        'SECURITY_REPORT',
        {
          type: report.type,
          summary: report.summary
        }
      );

      // Notify additional stakeholders based on report content
      if (report.summary.concerns.length > 0) {
        await NotificationService.notifySecurityTeam(
          'SECURITY_CONCERNS',
          {
            concerns: report.summary.concerns,
            recommendations: report.recommendations
          }
        );
      }
    } catch (error) {
      console.error('Error notifying stakeholders:', error);
    }
  }

  // Utility methods
  static getReportStartTime(type) {
    const now = new Date();
    switch (type) {
      case this.REPORT_TYPES.DAILY:
        return new Date(now.setDate(now.getDate() - 1));
      case this.REPORT_TYPES.WEEKLY:
        return new Date(now.setDate(now.getDate() - 7));
      case this.REPORT_TYPES.MONTHLY:
        return new Date(now.setMonth(now.getMonth() - 1));
      default:
        return now;
    }
  }

  static calculatePerformanceScore(metrics) {
    const weights = {
      responseTime: 0.4,
      errorRate: 0.3,
      resourceUtilization: 0.3
    };

    const scores = {
      responseTime: this.normalizeMetric(metrics.averageResponseTime, 0, 2000),
      errorRate: this.normalizeMetric(metrics.errorRates.overall, 0, 0.05),
      resourceUtilization: this.normalizeMetric(
        metrics.resourceUtilization.average,
        0,
        100
      )
    };

    return Object.entries(weights).reduce(
      (score, [metric, weight]) => score + scores[metric] * weight,
      0
    );
  }

  static calculateSystemHealthScore(health) {
    const weights = {
      uptime: 0.3,
      resourceUsage: 0.3,
      errors: 0.4
    };

    const scores = {
      uptime: health.uptime / 100,
      resourceUsage: 1 - (health.resourceUsage.average / 100),
      errors: Math.max(0, 1 - (health.errors.length / 100))
    };

    return Object.entries(weights).reduce(
      (score, [metric, weight]) => score + scores[metric] * weight,
      0
    );
  }

  static normalizeMetric(value, min, max) {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }
}

export default SecurityReportingService;
