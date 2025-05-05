import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import NotificationService from '../NotificationService';

class MonitoringService {
  static METRIC_TYPES = {
    PERFORMANCE: 'performance',
    ERROR: 'error',
    USAGE: 'usage',
    BUSINESS: 'business',
    SECURITY: 'security'
  };

  static ALERT_LEVELS = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
  };

  static metrics = new Map();
  static thresholds = new Map();
  static alertHandlers = new Map();

  static async initialize() {
    try {
      // Initialize monitoring
      await Promise.all([
        this.initializePerformanceMonitoring(),
        this.initializeErrorTracking(),
        this.initializeUsageMetrics(),
        this.initializeBusinessMetrics(),
        this.initializeSecurityMetrics()
      ]);

      // Start periodic checks
      this.startPeriodicChecks();

      return { success: true, message: 'Monitoring initialized' };
    } catch (error) {
      console.error('Error initializing monitoring:', error);
      throw error;
    }
  }

  // Performance Monitoring
  static async trackPerformance(metric) {
    try {
      const { name, value, tags } = metric;
      
      // Store metric
      await this.storeMetric('performance', {
        name,
        value,
        tags,
        timestamp: Timestamp.now()
      });

      // Check thresholds
      await this.checkPerformanceThresholds(name, value, tags);

      // Update running metrics
      this.updateRunningMetrics('performance', name, value);
    } catch (error) {
      console.error('Error tracking performance:', error);
      throw error;
    }
  }

  // Error Tracking
  static async trackError(error) {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        type: error.name,
        timestamp: Timestamp.now(),
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          // Add any relevant context
        }
      };

      // Store error
      await this.storeMetric('error', errorData);

      // Check severity and alert if necessary
      const severity = this.determineErrorSeverity(error);
      if (severity >= this.ALERT_LEVELS.ERROR) {
        await this.triggerAlert('error', errorData, severity);
      }

      // Update error metrics
      this.updateErrorMetrics(error);
    } catch (err) {
      console.error('Error tracking error:', err);
    }
  }

  // Usage Metrics
  static async trackUsage(metric) {
    try {
      const { feature, action, userId, metadata } = metric;
      
      const usageData = {
        feature,
        action,
        userId,
        metadata,
        timestamp: Timestamp.now()
      };

      // Store usage metric
      await this.storeMetric('usage', usageData);

      // Update usage statistics
      this.updateUsageStatistics(feature, action);
    } catch (error) {
      console.error('Error tracking usage:', error);
      throw error;
    }
  }

  // Business Metrics
  static async trackBusinessMetric(metric) {
    try {
      const { type, value, metadata } = metric;
      
      const businessData = {
        type,
        value,
        metadata,
        timestamp: Timestamp.now()
      };

      // Store business metric
      await this.storeMetric('business', businessData);

      // Check business thresholds
      await this.checkBusinessThresholds(type, value);
    } catch (error) {
      console.error('Error tracking business metric:', error);
      throw error;
    }
  }

  // Security Metrics
  static async trackSecurityMetric(metric) {
    try {
      const { type, severity, details } = metric;
      
      const securityData = {
        type,
        severity,
        details,
        timestamp: Timestamp.now()
      };

      // Store security metric
      await this.storeMetric('security', securityData);

      // Check security thresholds
      if (severity >= this.ALERT_LEVELS.WARNING) {
        await this.triggerAlert('security', securityData, severity);
      }
    } catch (error) {
      console.error('Error tracking security metric:', error);
      throw error;
    }
  }

  // Threshold Management
  static setThreshold(type, name, config) {
    const thresholds = this.thresholds.get(type) || new Map();
    thresholds.set(name, config);
    this.thresholds.set(type, thresholds);
  }

  static async checkThresholds(type, name, value) {
    const thresholds = this.thresholds.get(type);
    if (!thresholds) return;

    const config = thresholds.get(name);
    if (!config) return;

    if (value > config.critical) {
      await this.triggerAlert(type, { name, value }, this.ALERT_LEVELS.CRITICAL);
    } else if (value > config.warning) {
      await this.triggerAlert(type, { name, value }, this.ALERT_LEVELS.WARNING);
    }
  }

  // Alert Management
  static async triggerAlert(type, data, level) {
    try {
      const alert = {
        type,
        data,
        level,
        timestamp: Timestamp.now()
      };

      // Store alert
      await this.storeAlert(alert);

      // Notify relevant parties
      if (level >= this.ALERT_LEVELS.ERROR) {
        await NotificationService.notifyAdmins('MONITORING_ALERT', alert);
      }

      // Execute registered handlers
      const handlers = this.alertHandlers.get(type) || [];
      handlers.forEach(handler => handler(alert));
    } catch (error) {
      console.error('Error triggering alert:', error);
    }
  }

  // Metric Storage
  static async storeMetric(type, data) {
    try {
      await setDoc(doc(collection(db, 'metrics'), `${type}_${Date.now()}`), {
        type,
        ...data,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error storing metric:', error);
    }
  }

  // Alert Storage
  static async storeAlert(alert) {
    try {
      await setDoc(doc(collection(db, 'alerts'), `${alert.type}_${Date.now()}`), {
        ...alert,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error storing alert:', error);
    }
  }

  // Utility Methods
  static determineErrorSeverity(error) {
    if (error.fatal) return this.ALERT_LEVELS.CRITICAL;
    if (error.type === 'TypeError') return this.ALERT_LEVELS.ERROR;
    return this.ALERT_LEVELS.WARNING;
  }

  static updateRunningMetrics(type, name, value) {
    const metrics = this.metrics.get(type) || new Map();
    const current = metrics.get(name) || { count: 0, sum: 0, avg: 0, min: value, max: value };

    current.count++;
    current.sum += value;
    current.avg = current.sum / current.count;
    current.min = Math.min(current.min, value);
    current.max = Math.max(current.max, value);

    metrics.set(name, current);
    this.metrics.set(type, metrics);
  }

  static startPeriodicChecks() {
    // Check thresholds every minute
    setInterval(() => {
      this.checkAllThresholds();
    }, 60000);

    // Reset running metrics every hour
    setInterval(() => {
      this.resetRunningMetrics();
    }, 3600000);
  }

  static async checkAllThresholds() {
    for (const [type, metrics] of this.metrics.entries()) {
      for (const [name, data] of metrics.entries()) {
        await this.checkThresholds(type, name, data.avg);
      }
    }
  }

  static resetRunningMetrics() {
    this.metrics.clear();
  }
}

export default MonitoringService;
