import { db } from '../firebase/firebaseConfig';
import { performance, PerformanceObserver } from 'perf_hooks';

class PerformanceBenchmarkService {
  constructor() {
    this.benchmarks = new Map();
    this.results = new Map();
    this.observers = new Map();
    this.isRunning = false;
    this.setupObservers();
  }

  setupObservers() {
    // Performance observer for user timing measures
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.recordMetric(entry.name, {
          duration: entry.duration,
          startTime: entry.startTime,
          type: entry.entryType
        });
      });
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.set('measure', observer);
  }

  defineBenchmark(name, options = {}) {
    const {
      description = '',
      threshold = null,
      warmupRuns = 3,
      benchmarkRuns = 10,
      cooldownMs = 1000,
      tags = []
    } = options;

    this.benchmarks.set(name, {
      description,
      threshold,
      warmupRuns,
      benchmarkRuns,
      cooldownMs,
      tags,
      results: []
    });
  }

  async runBenchmark(name, testFn) {
    if (!this.benchmarks.has(name)) {
      throw new Error(`Benchmark "${name}" not defined`);
    }

    const benchmark = this.benchmarks.get(name);
    const results = [];

    // Warmup phase
    console.log(`🔥 Warming up benchmark: ${name}`);
    for (let i = 0; i < benchmark.warmupRuns; i++) {
      await testFn();
      await this.sleep(100); // Small delay between warmup runs
    }

    // Benchmark phase
    console.log(`📊 Running benchmark: ${name}`);
    for (let i = 0; i < benchmark.benchmarkRuns; i++) {
      const start = performance.now();
      await testFn();
      const duration = performance.now() - start;
      results.push(duration);
      await this.sleep(benchmark.cooldownMs);
    }

    // Calculate statistics
    const stats = this.calculateStats(results);
    benchmark.results.push({
      timestamp: new Date(),
      stats
    });

    // Store results
    await this.storeResults(name, stats);

    // Check threshold
    if (benchmark.threshold && stats.median > benchmark.threshold) {
      console.warn(`⚠️ Benchmark "${name}" exceeded threshold: ${stats.median}ms > ${benchmark.threshold}ms`);
    }

    return stats;
  }

  calculateStats(results) {
    const sorted = [...results].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const len = sorted.length;

    return {
      min: sorted[0],
      max: sorted[len - 1],
      median: sorted[Math.floor(len / 2)],
      mean: sum / len,
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)],
      stdDev: this.calculateStdDev(results, sum / len)
    };
  }

  calculateStdDev(results, mean) {
    const squareDiffs = results.map(value => {
      const diff = value - mean;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / results.length;
    return Math.sqrt(avgSquareDiff);
  }

  async storeResults(name, stats) {
    try {
      const benchmark = this.benchmarks.get(name);
      await db.collection('benchmarks').add({
        name,
        description: benchmark.description,
        tags: benchmark.tags,
        stats,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to store benchmark results:', error);
    }
  }

  startTracking(name) {
    performance.mark(`${name}-start`);
  }

  endTracking(name) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  recordMetric(name, data) {
    if (!this.results.has(name)) {
      this.results.set(name, []);
    }
    this.results.get(name).push({
      timestamp: new Date(),
      ...data
    });
  }

  async getResults(options = {}) {
    const {
      name = null,
      period = '24h',
      tags = []
    } = options;

    const periodStart = new Date(Date.now() - this.getPeriodMilliseconds(period));
    
    let query = db.collection('benchmarks')
      .where('timestamp', '>=', periodStart);

    if (name) {
      query = query.where('name', '==', name);
    }

    if (tags.length > 0) {
      query = query.where('tags', 'array-contains-any', tags);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data());
  }

  getPeriodMilliseconds(period) {
    const periods = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return periods[period] || periods['24h'];
  }

  async generateReport(options = {}) {
    const results = await this.getResults(options);
    
    return {
      summary: this.generateSummary(results),
      trends: this.analyzeTrends(results),
      recommendations: this.generateRecommendations(results)
    };
  }

  generateSummary(results) {
    const summary = {
      totalBenchmarks: results.length,
      uniqueBenchmarks: new Set(results.map(r => r.name)).size,
      averageStats: {},
      thresholdViolations: 0
    };

    // Calculate average stats
    const stats = results.reduce((acc, result) => {
      Object.entries(result.stats).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value;
      });
      return acc;
    }, {});

    Object.entries(stats).forEach(([key, value]) => {
      summary.averageStats[key] = value / results.length;
    });

    return summary;
  }

  analyzeTrends(results) {
    const trends = {};

    // Group by benchmark name
    const grouped = results.reduce((acc, result) => {
      if (!acc[result.name]) acc[result.name] = [];
      acc[result.name].push(result);
      return acc;
    }, {});

    // Analyze trends for each benchmark
    Object.entries(grouped).forEach(([name, benchmarks]) => {
      const sortedByTime = benchmarks.sort((a, b) => 
        a.timestamp.getTime() - b.timestamp.getTime()
      );

      const medians = sortedByTime.map(b => b.stats.median);
      trends[name] = {
        trend: this.calculateTrend(medians),
        improvement: this.calculateImprovement(medians)
      };
    });

    return trends;
  }

  calculateTrend(values) {
    if (values.length < 2) return 'insufficient_data';
    
    const first = values[0];
    const last = values[values.length - 1];
    const diff = ((last - first) / first) * 100;

    if (Math.abs(diff) < 5) return 'stable';
    return diff > 0 ? 'degrading' : 'improving';
  }

  calculateImprovement(values) {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    return ((first - last) / first) * 100;
  }

  generateRecommendations(results) {
    const recommendations = [];
    const trends = this.analyzeTrends(results);

    Object.entries(trends).forEach(([name, trend]) => {
      if (trend.trend === 'degrading') {
        recommendations.push({
          benchmark: name,
          severity: 'high',
          message: `Performance degrading by ${Math.abs(trend.improvement).toFixed(2)}%`
        });
      }
    });

    return recommendations;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.benchmarks.clear();
    this.results.clear();
  }
}

export default new PerformanceBenchmarkService();
