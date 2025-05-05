import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, collection, Timestamp } from 'firebase/firestore';
import ServiceMetrics from './ServiceMetrics';

class MonitoringService {
  static ALERT_LEVELS = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
  };

  static METRIC_INTERVALS = {
    REALTIME: 60 * 1000, // 1 minute
    HIGH_FREQUENCY: 5 * 60 * 1000, // 5 minutes
    MEDIUM_FREQUENCY: 15 * 60 * 1000, // 15 minutes
    LOW_FREQUENCY: 60 * 60 * 1000 // 1 hour
  };

  constructor() {
    this.metricsCollectors = new Map();
    this.alertHandlers = new Map();
    this.isRunning = false;
  }

  async startMonitoring() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Initialize metrics collectors
    this.initializeCollectors();

    // Start collection intervals
    this.startCollectionIntervals();

    console.log('Monitoring service started');
  }

  async stopMonitoring() {
    this.isRunning = false;
    
    // Clear all intervals
    this.metricsCollectors.forEach(collector => {
      clearInterval(collector.interval);
    });

    console.log('Monitoring service stopped');
  }

  initializeCollectors() {
    // Support metrics
    this.addMetricsCollector('support', async () => {
      const metrics = await ServiceMetrics.recordSupportMetrics();
      await this.checkSupportAlerts(metrics);
      return metrics;
    }, this.METRIC_INTERVALS.HIGH_FREQUENCY);

    // Shipping metrics
    this.addMetricsCollector('shipping', async () => {
      const metrics = await ServiceMetrics.recordShippingMetrics();
      await this.checkShippingAlerts(metrics);
      return metrics;
    }, this.METRIC_INTERVALS.MEDIUM_FREQUENCY);

    // Quality control metrics
    this.addMetricsCollector('quality', async () => {
      const metrics = await ServiceMetrics.recordQualityMetrics();
      await this.checkQualityAlerts(metrics);
      return metrics;
    }, this.METRIC_INTERVALS.MEDIUM_FREQUENCY);

    // System metrics
    this.addMetricsCollector('system', async () => {
      const metrics = await this.collectSystemMetrics();
      await this.checkSystemAlerts(metrics);
      return metrics;
    }, this.METRIC_INTERVALS.REALTIME);
  }

  addMetricsCollector(name, collector, interval) {
    this.metricsCollectors.set(name, {
      collector,
      interval: null,
      lastRun: null
    });
  }

  startCollectionIntervals() {
    this.metricsCollectors.forEach((config, name) => {
      config.interval = setInterval(async () => {
        try {
          const metrics = await config.collector();
          config.lastRun = Date.now();

          // Store metrics
          await this.storeMetrics(name, metrics);

        } catch (error) {
          console.error(`Error collecting ${name} metrics:`, error);
          await this.handleAlert({
            level: this.ALERT_LEVELS.ERROR,
            source: name,
            message: `Metrics collection failed: ${error.message}`,
            timestamp: Date.now()
          });
        }
      }, interval);
    });
  }

  async collectSystemMetrics() {
    const metrics = {
      timestamp: Date.now(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      activeHandles: process._getActiveHandles().length,
      activeRequests: process._getActiveRequests().length
    };

    return metrics;
  }

  async storeMetrics(type, metrics) {
    try {
      await setDoc(doc(db, 'metrics', `${type}_${Date.now()}`), {
        type,
        metrics,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error storing ${type} metrics:`, error);
    }
  }

  async handleAlert(alert) {
    try {
      // Store alert
      await setDoc(doc(collection(db, 'alerts'), Date.now().toString()), {
        ...alert,
        timestamp: Timestamp.now()
      });

      // Notify handlers
      const handlers = this.alertHandlers.get(alert.level) || [];
      await Promise.all(handlers.map(handler => handler(alert)));

    } catch (error) {
      console.error('Error handling alert:', error);
    }
  }

  registerAlertHandler(level, handler) {
    if (!this.alertHandlers.has(level)) {
      this.alertHandlers.set(level, []);
    }
    this.alertHandlers.get(level).push(handler);
  }

  async checkSupportAlerts(metrics) {
    // Check response time
    if (metrics.responseTime > 30 * 60) { // 30 minutes
      await this.handleAlert({
        level: this.ALERT_LEVELS.WARNING,
        source: 'support',
        message: 'High response time detected',
        data: { responseTime: metrics.responseTime }
      });
    }

    // Check unassigned tickets
    if (metrics.tickets.unassigned > 10) {
      await this.handleAlert({
        level: this.ALERT_LEVELS.WARNING,
        source: 'support',
        message: 'High number of unassigned tickets',
        data: { unassignedCount: metrics.tickets.unassigned }
      });
    }
  }

  async checkShippingAlerts(metrics) {
    // Check delayed shipments
    if (metrics.shipments.delayed > 5) {
      await this.handleAlert({
        level: this.ALERT_LEVELS.WARNING,
        source: 'shipping',
        message: 'Multiple delayed shipments detected',
        data: { delayedCount: metrics.shipments.delayed }
      });
    }

    // Check damage rate
    if (metrics.damages > 0.05) { // 5% threshold
      await this.handleAlert({
        level: this.ALERT_LEVELS.ERROR,
        source: 'shipping',
        message: 'High damage rate detected',
        data: { damageRate: metrics.damages }
      });
    }
  }

  async checkQualityAlerts(metrics) {
    // Check authenticity rate
    if (metrics.authenticityRate < 0.99) { // 99% threshold
      await this.handleAlert({
        level: this.ALERT_LEVELS.CRITICAL,
        source: 'quality',
        message: 'Low authenticity verification rate',
        data: { rate: metrics.authenticityRate }
      });
    }

    // Check quality scores
    Object.entries(metrics.qualityScores).forEach(([criterion, score]) => {
      if (score < 3.5) { // Below 3.5 out of 5
        await this.handleAlert({
          level: this.ALERT_LEVELS.WARNING,
          source: 'quality',
          message: `Low quality score for ${criterion}`,
          data: { criterion, score }
        });
      }
    });
  }

  async checkSystemAlerts(metrics) {
    // Check memory usage
    const memoryUsagePercent = metrics.memory.heapUsed / metrics.memory.heapTotal;
    if (memoryUsagePercent > 0.85) { // 85% threshold
      await this.handleAlert({
        level: this.ALERT_LEVELS.ERROR,
        source: 'system',
        message: 'High memory usage detected',
        data: { usagePercent: memoryUsagePercent }
      });
    }

    // Check active handles
    if (metrics.activeHandles > 1000) {
      await this.handleAlert({
        level: this.ALERT_LEVELS.WARNING,
        source: 'system',
        message: 'High number of active handles',
        data: { handleCount: metrics.activeHandles }
      });
    }
  }

  async getMetricsDashboard(type, period = 'daily') {
    return await ServiceMetrics.getMetricsDashboard(type, period);
  }

  async getActiveAlerts() {
    const alertsRef = collection(db, 'alerts');
    const snapshot = await getDocs(
      query(alertsRef, 
        where('timestamp', '>=', Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000)),
        orderBy('timestamp', 'desc')
      )
    );

    return snapshot.docs.map(doc => doc.data());
  }
}

export default new MonitoringService();
