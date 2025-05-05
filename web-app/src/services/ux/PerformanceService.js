import { db } from '../firebase/firebaseConfig';

class PerformanceService {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      FCP: 1800, // First Contentful Paint (ms)
      LCP: 2500, // Largest Contentful Paint (ms)
      FID: 100,  // First Input Delay (ms)
      CLS: 0.1,  // Cumulative Layout Shift
      TTI: 3800  // Time to Interactive (ms)
    };
  }

  async measurePagePerformance(pageId) {
    try {
      // Core Web Vitals
      const vitals = await this.measureCoreWebVitals();
      
      // Additional Metrics
      const additional = {
        resources: await this.measureResourceUsage(),
        timing: await this.measurePageTiming(),
        memory: await this.measureMemoryUsage()
      };

      const metrics = { ...vitals, ...additional };
      await this.storeMetrics(pageId, metrics);

      return {
        metrics,
        score: this.calculatePerformanceScore(metrics),
        recommendations: this.generateRecommendations(metrics)
      };
    } catch (error) {
      console.error('Performance measurement failed:', error);
      throw new Error('Failed to measure performance');
    }
  }

  async measureCoreWebVitals() {
    return new Promise(resolve => {
      // First Contentful Paint
      new PerformanceObserver((entryList) => {
        const fcp = entryList.getEntries()[0];
        this.metrics.set('FCP', fcp.startTime);
      }).observe({ type: 'paint', buffered: true });

      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const lcp = entryList.getEntries().pop();
        this.metrics.set('LCP', lcp.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const fid = entryList.getEntries()[0];
        this.metrics.set('FID', fid.processingStart - fid.startTime);
      }).observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        let cls = 0;
        entryList.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        this.metrics.set('CLS', cls);
      }).observe({ type: 'layout-shift', buffered: true });

      // Time to Interactive
      performance.mark('TTI_start');
      window.addEventListener('load', () => {
        requestIdleCallback(() => {
          performance.mark('TTI_end');
          performance.measure('TTI', 'TTI_start', 'TTI_end');
          const tti = performance.getEntriesByName('TTI')[0];
          this.metrics.set('TTI', tti.duration);
          
          resolve({
            FCP: this.metrics.get('FCP'),
            LCP: this.metrics.get('LCP'),
            FID: this.metrics.get('FID'),
            CLS: this.metrics.get('CLS'),
            TTI: this.metrics.get('TTI')
          });
        });
      });
    });
  }

  async measureResourceUsage() {
    const resources = performance.getEntriesByType('resource');
    
    return {
      totalResources: resources.length,
      byType: this.groupResourcesByType(resources),
      totalSize: this.calculateTotalSize(resources),
      loadTimes: this.calculateLoadTimes(resources)
    };
  }

  async measurePageTiming() {
    const timing = performance.timing;
    
    return {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ssl: timing.connectEnd - timing.secureConnectionStart,
      ttfb: timing.responseStart - timing.requestStart,
      domLoad: timing.domContentLoadedEventEnd - timing.navigationStart,
      windowLoad: timing.loadEventEnd - timing.navigationStart
    };
  }

  async measureMemoryUsage() {
    if (performance.memory) {
      const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
      return {
        used: usedJSHeapSize,
        total: totalJSHeapSize,
        percentage: (usedJSHeapSize / totalJSHeapSize) * 100
      };
    }
    return null;
  }

  groupResourcesByType(resources) {
    return resources.reduce((acc, resource) => {
      const type = this.getResourceType(resource.name);
      if (!acc[type]) acc[type] = [];
      acc[type].push(resource);
      return acc;
    }, {});
  }

  getResourceType(url) {
    const extension = url.split('.').pop().toLowerCase();
    const types = {
      js: 'script',
      css: 'style',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      webp: 'image',
      svg: 'image',
      woff: 'font',
      woff2: 'font',
      ttf: 'font'
    };
    return types[extension] || 'other';
  }

  calculateTotalSize(resources) {
    return resources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
  }

  calculateLoadTimes(resources) {
    return resources.reduce((acc, resource) => {
      acc[resource.name] = resource.duration;
      return acc;
    }, {});
  }

  calculatePerformanceScore(metrics) {
    const weights = {
      FCP: 0.2,
      LCP: 0.25,
      FID: 0.25,
      CLS: 0.15,
      TTI: 0.15
    };

    let score = 0;
    Object.entries(weights).forEach(([metric, weight]) => {
      const value = metrics[metric];
      const threshold = this.thresholds[metric];
      score += weight * this.calculateMetricScore(value, threshold);
    });

    return Math.round(score * 100);
  }

  calculateMetricScore(value, threshold) {
    if (value <= threshold * 0.75) return 1;
    if (value <= threshold) return 0.75;
    if (value <= threshold * 1.5) return 0.5;
    return 0;
  }

  generateRecommendations(metrics) {
    const recommendations = [];

    // Check each core web vital
    Object.entries(this.thresholds).forEach(([metric, threshold]) => {
      if (metrics[metric] > threshold) {
        recommendations.push(this.getMetricRecommendation(metric, metrics[metric]));
      }
    });

    // Check resource usage
    if (metrics.resources) {
      const { totalSize, byType } = metrics.resources;
      if (totalSize > 5000000) { // 5MB
        recommendations.push({
          type: 'resource_size',
          severity: 'high',
          message: 'Total resource size exceeds 5MB',
          actions: ['Optimize images', 'Minify JS/CSS', 'Enable compression']
        });
      }

      // Check image optimization
      if (byType.image && byType.image.length > 0) {
        const largeImages = byType.image.filter(img => img.transferSize > 200000);
        if (largeImages.length > 0) {
          recommendations.push({
            type: 'image_size',
            severity: 'medium',
            message: `${largeImages.length} images exceed 200KB`,
            actions: ['Use WebP format', 'Implement responsive images', 'Enable image compression']
          });
        }
      }
    }

    return recommendations;
  }

  getMetricRecommendation(metric, value) {
    const recommendations = {
      FCP: {
        type: 'fcp',
        severity: 'medium',
        message: 'First Contentful Paint is too slow',
        actions: [
          'Optimize server response time',
          'Minimize render-blocking resources',
          'Implement critical CSS'
        ]
      },
      LCP: {
        type: 'lcp',
        severity: 'high',
        message: 'Largest Contentful Paint needs improvement',
        actions: [
          'Optimize largest image or text block',
          'Implement preload for critical resources',
          'Optimize server response time'
        ]
      },
      FID: {
        type: 'fid',
        severity: 'high',
        message: 'First Input Delay is too high',
        actions: [
          'Minimize main thread work',
          'Break up long tasks',
          'Optimize JavaScript execution'
        ]
      },
      CLS: {
        type: 'cls',
        severity: 'medium',
        message: 'Layout shifts affecting user experience',
        actions: [
          'Set size attributes on images',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content'
        ]
      },
      TTI: {
        type: 'tti',
        severity: 'medium',
        message: 'Time to Interactive is too long',
        actions: [
          'Reduce JavaScript execution time',
          'Defer non-critical JavaScript',
          'Minimize main thread work'
        ]
      }
    };

    return recommendations[metric];
  }

  async storeMetrics(pageId, metrics) {
    try {
      await db.collection('performance_metrics').add({
        pageId,
        metrics,
        timestamp: new Date(),
        score: this.calculatePerformanceScore(metrics)
      });
    } catch (error) {
      console.error('Failed to store performance metrics:', error);
    }
  }

  async getPerformanceHistory(pageId, period = '7d') {
    const periodStart = new Date(Date.now() - this.getPeriodMilliseconds(period));

    const snapshot = await db.collection('performance_metrics')
      .where('pageId', '==', pageId)
      .where('timestamp', '>=', periodStart)
      .orderBy('timestamp')
      .get();

    return snapshot.docs.map(doc => doc.data());
  }

  getPeriodMilliseconds(period) {
    const periods = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return periods[period] || periods['7d'];
  }
}

export default new PerformanceService();
