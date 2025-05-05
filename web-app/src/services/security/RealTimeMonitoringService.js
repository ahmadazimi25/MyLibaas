import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import NotificationService from '../NotificationService';

class RealTimeMonitoringService {
  static ALERT_LEVELS = {
    INFO: 'info',
    WARNING: 'warning',
    CRITICAL: 'critical',
    EMERGENCY: 'emergency'
  };

  static MONITOR_TYPES = {
    TRAFFIC: 'traffic_monitoring',
    SECURITY: 'security_monitoring',
    PERFORMANCE: 'performance_monitoring',
    ERROR: 'error_monitoring',
    USER: 'user_monitoring'
  };

  static monitors = new Map();
  static alertHandlers = new Map();
  static thresholds = new Map();

  static async initialize() {
    try {
      // Load monitoring configurations
      const config = await this.loadMonitoringConfig();
      
      // Set up real-time monitors
      await Promise.all([
        this.setupTrafficMonitor(),
        this.setupSecurityMonitor(),
        this.setupPerformanceMonitor(),
        this.setupErrorMonitor(),
        this.setupUserMonitor()
      ]);

      return {
        success: true,
        message: 'Real-time monitoring initialized'
      };
    } catch (error) {
      console.error('Error initializing monitoring:', error);
      throw error;
    }
  }

  static async setupTrafficMonitor() {
    const monitor = onSnapshot(
      query(collection(db, 'requests'), orderBy('timestamp', 'desc')),
      snapshot => {
        const traffic = this.analyzeTraffic(snapshot);
        
        if (traffic.anomalies.length > 0) {
          this.handleAlert(this.MONITOR_TYPES.TRAFFIC, {
            level: this.determineAlertLevel(traffic),
            details: traffic
          });
        }
      }
    );

    this.monitors.set(this.MONITOR_TYPES.TRAFFIC, monitor);
  }

  static async setupSecurityMonitor() {
    const monitor = onSnapshot(
      query(collection(db, 'securityEvents'), orderBy('timestamp', 'desc')),
      snapshot => {
        const security = this.analyzeSecurityEvents(snapshot);
        
        if (security.threats.length > 0) {
          this.handleAlert(this.MONITOR_TYPES.SECURITY, {
            level: this.determineAlertLevel(security),
            details: security
          });
        }
      }
    );

    this.monitors.set(this.MONITOR_TYPES.SECURITY, monitor);
  }

  static async setupPerformanceMonitor() {
    const monitor = onSnapshot(
      query(collection(db, 'performance'), orderBy('timestamp', 'desc')),
      snapshot => {
        const performance = this.analyzePerformance(snapshot);
        
        if (performance.issues.length > 0) {
          this.handleAlert(this.MONITOR_TYPES.PERFORMANCE, {
            level: this.determineAlertLevel(performance),
            details: performance
          });
        }
      }
    );

    this.monitors.set(this.MONITOR_TYPES.PERFORMANCE, monitor);
  }

  static async setupErrorMonitor() {
    const monitor = onSnapshot(
      query(collection(db, 'errors'), orderBy('timestamp', 'desc')),
      snapshot => {
        const errors = this.analyzeErrors(snapshot);
        
        if (errors.critical.length > 0) {
          this.handleAlert(this.MONITOR_TYPES.ERROR, {
            level: this.determineAlertLevel(errors),
            details: errors
          });
        }
      }
    );

    this.monitors.set(this.MONITOR_TYPES.ERROR, monitor);
  }

  static async setupUserMonitor() {
    const monitor = onSnapshot(
      query(collection(db, 'userActivity'), orderBy('timestamp', 'desc')),
      snapshot => {
        const activity = this.analyzeUserActivity(snapshot);
        
        if (activity.suspicious.length > 0) {
          this.handleAlert(this.MONITOR_TYPES.USER, {
            level: this.determineAlertLevel(activity),
            details: activity
          });
        }
      }
    );

    this.monitors.set(this.MONITOR_TYPES.USER, monitor);
  }

  static async handleAlert(type, alert) {
    try {
      // Log alert
      await this.logAlert(type, alert);

      // Notify relevant parties
      if (alert.level === this.ALERT_LEVELS.CRITICAL || 
          alert.level === this.ALERT_LEVELS.EMERGENCY) {
        await NotificationService.notifyAdmins(
          'SECURITY_ALERT',
          {
            type,
            alert
          },
          alert.level
        );
      }

      // Execute registered handlers
      const handlers = this.alertHandlers.get(type) || [];
      handlers.forEach(handler => handler(alert));
    } catch (error) {
      console.error('Error handling alert:', error);
    }
  }

  static registerAlertHandler(type, handler) {
    const handlers = this.alertHandlers.get(type) || [];
    handlers.push(handler);
    this.alertHandlers.set(type, handlers);
  }

  static setThreshold(type, metric, value) {
    const thresholds = this.thresholds.get(type) || {};
    thresholds[metric] = value;
    this.thresholds.set(type, thresholds);
  }

  // Analysis methods
  static analyzeTraffic(snapshot) {
    const requests = [];
    const anomalies = [];
    
    snapshot.forEach(doc => {
      const request = doc.data();
      requests.push(request);
      
      // Check for traffic anomalies
      if (this.isTrafficAnomalous(request)) {
        anomalies.push(request);
      }
    });

    return {
      requests: requests.length,
      anomalies,
      patterns: this.detectTrafficPatterns(requests)
    };
  }

  static analyzeSecurityEvents(snapshot) {
    const events = [];
    const threats = [];
    
    snapshot.forEach(doc => {
      const event = doc.data();
      events.push(event);
      
      // Check for security threats
      if (this.isSecurityThreat(event)) {
        threats.push(event);
      }
    });

    return {
      events: events.length,
      threats,
      riskLevel: this.calculateRiskLevel(threats)
    };
  }

  static analyzePerformance(snapshot) {
    const metrics = [];
    const issues = [];
    
    snapshot.forEach(doc => {
      const metric = doc.data();
      metrics.push(metric);
      
      // Check for performance issues
      if (this.isPerformanceIssue(metric)) {
        issues.push(metric);
      }
    });

    return {
      metrics: metrics.length,
      issues,
      averages: this.calculatePerformanceAverages(metrics)
    };
  }

  static analyzeErrors(snapshot) {
    const errors = [];
    const critical = [];
    
    snapshot.forEach(doc => {
      const error = doc.data();
      errors.push(error);
      
      // Check for critical errors
      if (this.isCriticalError(error)) {
        critical.push(error);
      }
    });

    return {
      errors: errors.length,
      critical,
      patterns: this.detectErrorPatterns(errors)
    };
  }

  static analyzeUserActivity(snapshot) {
    const activities = [];
    const suspicious = [];
    
    snapshot.forEach(doc => {
      const activity = doc.data();
      activities.push(activity);
      
      // Check for suspicious activity
      if (this.isSuspiciousActivity(activity)) {
        suspicious.push(activity);
      }
    });

    return {
      activities: activities.length,
      suspicious,
      patterns: this.detectUserPatterns(activities)
    };
  }

  // Utility methods
  static determineAlertLevel(data) {
    if (data.critical?.length > 0 || data.threats?.length > 2) {
      return this.ALERT_LEVELS.EMERGENCY;
    }
    if (data.threats?.length > 0 || data.issues?.length > 5) {
      return this.ALERT_LEVELS.CRITICAL;
    }
    if (data.anomalies?.length > 0 || data.issues?.length > 0) {
      return this.ALERT_LEVELS.WARNING;
    }
    return this.ALERT_LEVELS.INFO;
  }

  static async logAlert(type, alert) {
    try {
      await setDoc(doc(db, 'monitoringAlerts', `${type}_${Date.now()}`), {
        type,
        alert,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error logging alert:', error);
    }
  }

  static async loadMonitoringConfig() {
    try {
      const configDoc = await getDoc(doc(db, 'config', 'monitoring'));
      return configDoc.data() || {};
    } catch (error) {
      console.error('Error loading monitoring config:', error);
      return {};
    }
  }

  static cleanup() {
    // Stop all monitors
    this.monitors.forEach(monitor => monitor());
    this.monitors.clear();
    this.alertHandlers.clear();
    this.thresholds.clear();
  }
}

export default RealTimeMonitoringService;
