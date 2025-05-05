import { db } from '../firebase/firebaseConfig';

class FraudPreventionService {
  static RISK_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  };

  static FRAUD_INDICATORS = {
    MULTIPLE_ACCOUNTS: 'multiple_accounts',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    PAYMENT_ISSUES: 'payment_issues',
    VERIFICATION_FAILS: 'verification_fails',
    REPORTED_USER: 'reported_user'
  };

  constructor() {
    this.riskScores = new Map();
    this.fraudPatterns = new Map();
    this.initializeFraudPatterns();
  }

  initializeFraudPatterns() {
    // Multiple accounts pattern
    this.fraudPatterns.set(this.FRAUD_INDICATORS.MULTIPLE_ACCOUNTS, {
      weight: 0.3,
      threshold: 2, // Number of accounts with same data
      timeWindow: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Suspicious activity pattern
    this.fraudPatterns.set(this.FRAUD_INDICATORS.SUSPICIOUS_ACTIVITY, {
      weight: 0.25,
      threshold: 3, // Number of suspicious actions
      timeWindow: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Payment issues pattern
    this.fraudPatterns.set(this.FRAUD_INDICATORS.PAYMENT_ISSUES, {
      weight: 0.2,
      threshold: 2, // Number of payment failures
      timeWindow: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Verification failures pattern
    this.fraudPatterns.set(this.FRAUD_INDICATORS.VERIFICATION_FAILS, {
      weight: 0.15,
      threshold: 3, // Number of verification attempts
      timeWindow: 24 * 60 * 60 * 1000 // 24 hours
    });

    // User reports pattern
    this.fraudPatterns.set(this.FRAUD_INDICATORS.REPORTED_USER, {
      weight: 0.1,
      threshold: 2, // Number of reports
      timeWindow: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }

  async assessRisk(userId, action) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const riskFactors = await this.analyzeRiskFactors(userId, userProfile);
      const riskScore = this.calculateRiskScore(riskFactors);
      
      await this.updateRiskHistory(userId, riskScore, action);

      return {
        score: riskScore,
        level: this.getRiskLevel(riskScore),
        factors: riskFactors,
        action: this.recommendAction(riskScore)
      };
    } catch (error) {
      console.error('Risk assessment failed:', error);
      throw new Error('Risk assessment failed');
    }
  }

  async getUserProfile(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    return userDoc.data();
  }

  async analyzeRiskFactors(userId, userProfile) {
    const riskFactors = {};

    // Check for multiple accounts
    riskFactors.multipleAccounts = await this.checkMultipleAccounts(userProfile);

    // Check suspicious activity
    riskFactors.suspiciousActivity = await this.checkSuspiciousActivity(userId);

    // Check payment issues
    riskFactors.paymentIssues = await this.checkPaymentIssues(userId);

    // Check verification failures
    riskFactors.verificationFails = await this.checkVerificationFailures(userId);

    // Check user reports
    riskFactors.userReports = await this.checkUserReports(userId);

    return riskFactors;
  }

  async checkMultipleAccounts(userProfile) {
    const { email, phone, ip } = userProfile;

    const snapshot = await db.collection('users')
      .where('email', '==', email)
      .where('phone', '==', phone)
      .where('ip', '==', ip)
      .get();

    return {
      detected: snapshot.size > 1,
      count: snapshot.size,
      severity: this.calculateSeverity(
        snapshot.size,
        this.fraudPatterns.get(this.FRAUD_INDICATORS.MULTIPLE_ACCOUNTS)
      )
    };
  }

  async checkSuspiciousActivity(userId) {
    const snapshot = await db.collection('user_activities')
      .where('userId', '==', userId)
      .where('type', '==', 'suspicious')
      .where('timestamp', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
      .get();

    return {
      detected: snapshot.size > 0,
      count: snapshot.size,
      severity: this.calculateSeverity(
        snapshot.size,
        this.fraudPatterns.get(this.FRAUD_INDICATORS.SUSPICIOUS_ACTIVITY)
      )
    };
  }

  async checkPaymentIssues(userId) {
    const snapshot = await db.collection('payment_issues')
      .where('userId', '==', userId)
      .where('timestamp', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .get();

    return {
      detected: snapshot.size > 0,
      count: snapshot.size,
      severity: this.calculateSeverity(
        snapshot.size,
        this.fraudPatterns.get(this.FRAUD_INDICATORS.PAYMENT_ISSUES)
      )
    };
  }

  async checkVerificationFailures(userId) {
    const snapshot = await db.collection('verifications')
      .where('userId', '==', userId)
      .where('result.verified', '==', false)
      .where('timestamp', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
      .get();

    return {
      detected: snapshot.size > 0,
      count: snapshot.size,
      severity: this.calculateSeverity(
        snapshot.size,
        this.fraudPatterns.get(this.FRAUD_INDICATORS.VERIFICATION_FAILS)
      )
    };
  }

  async checkUserReports(userId) {
    const snapshot = await db.collection('user_reports')
      .where('reportedUserId', '==', userId)
      .where('timestamp', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .get();

    return {
      detected: snapshot.size > 0,
      count: snapshot.size,
      severity: this.calculateSeverity(
        snapshot.size,
        this.fraudPatterns.get(this.FRAUD_INDICATORS.REPORTED_USER)
      )
    };
  }

  calculateSeverity(count, pattern) {
    return Math.min(1, count / pattern.threshold);
  }

  calculateRiskScore(riskFactors) {
    let score = 0;
    let totalWeight = 0;

    this.fraudPatterns.forEach((pattern, indicator) => {
      if (riskFactors[indicator]) {
        score += riskFactors[indicator].severity * pattern.weight;
        totalWeight += pattern.weight;
      }
    });

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  getRiskLevel(score) {
    if (score >= 0.8) return this.RISK_LEVELS.CRITICAL;
    if (score >= 0.6) return this.RISK_LEVELS.HIGH;
    if (score >= 0.4) return this.RISK_LEVELS.MEDIUM;
    return this.RISK_LEVELS.LOW;
  }

  recommendAction(score) {
    if (score >= 0.8) {
      return {
        action: 'block',
        duration: 'permanent',
        reason: 'Critical risk level detected'
      };
    }
    if (score >= 0.6) {
      return {
        action: 'suspend',
        duration: '7d',
        reason: 'High risk activity detected'
      };
    }
    if (score >= 0.4) {
      return {
        action: 'restrict',
        duration: '24h',
        reason: 'Suspicious activity detected'
      };
    }
    return {
      action: 'monitor',
      duration: 'ongoing',
      reason: 'Normal activity'
    };
  }

  async updateRiskHistory(userId, score, action) {
    await db.collection('risk_history').add({
      userId,
      score,
      level: this.getRiskLevel(score),
      action,
      timestamp: new Date()
    });
  }

  async getFraudStats(period = '30d') {
    const periodStart = new Date(Date.now() - this.getPeriodMilliseconds(period));

    const snapshot = await db.collection('risk_history')
      .where('timestamp', '>=', periodStart)
      .get();

    const stats = {
      total: snapshot.size,
      byLevel: {},
      byAction: {},
      timeline: {}
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Count by risk level
      stats.byLevel[data.level] = (stats.byLevel[data.level] || 0) + 1;
      
      // Count by action taken
      stats.byAction[data.action] = (stats.byAction[data.action] || 0) + 1;
      
      // Timeline data
      const day = data.timestamp.toDate().toISOString().split('T')[0];
      stats.timeline[day] = (stats.timeline[day] || 0) + 1;
    });

    return stats;
  }

  getPeriodMilliseconds(period) {
    const periods = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return periods[period] || periods['30d'];
  }
}

export default new FraudPreventionService();
