import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import NotificationService from '../NotificationService';

class SecurityABTestingService {
  static TEST_TYPES = {
    CAPTCHA: 'captcha',
    RATE_LIMIT: 'rate_limit',
    FRAUD_DETECTION: 'fraud_detection',
    USER_VERIFICATION: 'user_verification',
    SECURITY_MEASURES: 'security_measures'
  };

  static METRICS = {
    CONVERSION: 'conversion_rate',
    DETECTION: 'detection_rate',
    FALSE_POSITIVES: 'false_positive_rate',
    USER_SATISFACTION: 'user_satisfaction',
    COMPLETION_TIME: 'completion_time'
  };

  static async createTest(config) {
    try {
      const testId = `test_${Date.now()}`;
      const test = {
        id: testId,
        status: 'active',
        startTime: Timestamp.now(),
        endTime: new Date(Date.now() + config.duration),
        config,
        variants: this.initializeVariants(config.variants),
        metrics: this.initializeMetrics(config.metrics)
      };

      await setDoc(doc(db, 'securityTests', testId), test);
      await this.startTestMonitoring(testId);

      return testId;
    } catch (error) {
      console.error('Error creating test:', error);
      throw error;
    }
  }

  static async assignUserToVariant(userId, testId) {
    try {
      const test = await this.getTest(testId);
      if (!test || test.status !== 'active') return null;

      // Deterministic assignment based on user ID
      const variantIndex = this.hashString(userId) % test.variants.length;
      const variant = test.variants[variantIndex];

      await setDoc(doc(db, 'testAssignments', `${testId}_${userId}`), {
        userId,
        testId,
        variant: variant.id,
        assignedAt: Timestamp.now()
      });

      return variant;
    } catch (error) {
      console.error('Error assigning user to variant:', error);
      throw error;
    }
  }

  static async trackEvent(testId, userId, eventType, data) {
    try {
      const assignment = await this.getUserAssignment(testId, userId);
      if (!assignment) return;

      await setDoc(doc(db, 'testEvents', `${testId}_${userId}_${Date.now()}`), {
        testId,
        userId,
        variant: assignment.variant,
        eventType,
        data,
        timestamp: Timestamp.now()
      });

      await this.updateMetrics(testId, assignment.variant, eventType, data);
    } catch (error) {
      console.error('Error tracking event:', error);
      throw error;
    }
  }

  static async analyzeResults(testId) {
    try {
      const [test, events] = await Promise.all([
        this.getTest(testId),
        this.getTestEvents(testId)
      ]);

      const results = {
        testId,
        startTime: test.startTime,
        endTime: test.endTime,
        totalUsers: await this.countTestUsers(testId),
        variants: await this.analyzeVariants(test, events),
        winner: await this.determineWinner(test, events),
        confidence: await this.calculateConfidence(test, events),
        recommendations: await this.generateRecommendations(test, events)
      };

      await this.storeResults(testId, results);
      return results;
    } catch (error) {
      console.error('Error analyzing results:', error);
      throw error;
    }
  }

  static async monitorTest(testId) {
    try {
      const test = await this.getTest(testId);
      const events = await this.getTestEvents(testId);

      const metrics = await this.calculateMetrics(test, events);
      const significance = await this.checkSignificance(metrics);

      if (significance.isSignificant) {
        await this.handleSignificantResult(testId, metrics);
      }

      return {
        metrics,
        significance,
        recommendations: await this.generateRecommendations(test, events)
      };
    } catch (error) {
      console.error('Error monitoring test:', error);
      throw error;
    }
  }

  // Analysis Methods
  static async analyzeVariants(test, events) {
    const variants = {};

    for (const variant of test.variants) {
      const variantEvents = events.filter(e => e.variant === variant.id);
      
      variants[variant.id] = {
        users: await this.countVariantUsers(test.id, variant.id),
        conversionRate: this.calculateConversionRate(variantEvents),
        detectionRate: this.calculateDetectionRate(variantEvents),
        falsePositiveRate: this.calculateFalsePositiveRate(variantEvents),
        userSatisfaction: await this.calculateUserSatisfaction(variant.id),
        completionTime: this.calculateCompletionTime(variantEvents)
      };
    }

    return variants;
  }

  static async determineWinner(test, events) {
    const variants = await this.analyzeVariants(test, events);
    let winner = null;
    let bestScore = -1;

    for (const [variantId, metrics] of Object.entries(variants)) {
      const score = this.calculateVariantScore(metrics);
      if (score > bestScore) {
        bestScore = score;
        winner = variantId;
      }
    }

    return {
      variantId: winner,
      metrics: variants[winner],
      confidence: await this.calculateConfidence(test, events, winner)
    };
  }

  static calculateVariantScore(metrics) {
    const weights = {
      conversionRate: 0.3,
      detectionRate: 0.3,
      falsePositiveRate: -0.2,
      userSatisfaction: 0.1,
      completionTime: 0.1
    };

    return Object.entries(weights).reduce(
      (score, [metric, weight]) => score + metrics[metric] * weight,
      0
    );
  }

  // Statistical Methods
  static async calculateConfidence(test, events, variantId) {
    const variant = test.variants.find(v => v.id === variantId);
    const variantEvents = events.filter(e => e.variant === variantId);
    
    const sampleSize = variantEvents.length;
    const populationSize = events.length;
    
    return this.calculateConfidenceInterval(
      this.calculateVariantScore({ variant, events: variantEvents }),
      sampleSize,
      populationSize
    );
  }

  static calculateConfidenceInterval(score, sampleSize, populationSize) {
    const z = 1.96; // 95% confidence level
    const standardError = Math.sqrt((score * (1 - score)) / sampleSize);
    const margin = z * standardError;

    return {
      mean: score,
      lower: Math.max(0, score - margin),
      upper: Math.min(1, score + margin),
      confidence: 0.95
    };
  }

  // Utility Methods
  static hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  static initializeVariants(variants) {
    return variants.map(variant => ({
      ...variant,
      users: 0,
      events: 0,
      metrics: this.initializeMetrics(variant.metrics)
    }));
  }

  static initializeMetrics(metrics) {
    return metrics.reduce((acc, metric) => {
      acc[metric] = {
        value: 0,
        count: 0,
        sum: 0
      };
      return acc;
    }, {});
  }

  // Database Methods
  static async getTest(testId) {
    const doc = await getDoc(doc(db, 'securityTests', testId));
    return doc.data();
  }

  static async getUserAssignment(testId, userId) {
    const doc = await getDoc(
      doc(db, 'testAssignments', `${testId}_${userId}`)
    );
    return doc.data();
  }

  static async getTestEvents(testId) {
    const snapshot = await getDocs(
      query(
        collection(db, 'testEvents'),
        where('testId', '==', testId),
        orderBy('timestamp', 'asc')
      )
    );

    const events = [];
    snapshot.forEach(doc => events.push(doc.data()));
    return events;
  }

  static async storeResults(testId, results) {
    await setDoc(doc(db, 'testResults', testId), {
      ...results,
      timestamp: Timestamp.now()
    });
  }
}

export default SecurityABTestingService;
