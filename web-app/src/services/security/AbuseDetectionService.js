import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import IPBlockingService from '../IPBlockingService';
import NotificationService from '../NotificationService';
import ProxyDetectionService from './ProxyDetectionService';

class AbuseDetectionService {
  static ABUSE_TYPES = {
    SPAM: 'spam',
    HARASSMENT: 'harassment',
    FRAUD: 'fraud',
    CONTENT: 'inappropriate_content',
    SCRAPING: 'data_scraping',
    DOS: 'denial_of_service'
  };

  static SEVERITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  };

  static async detectAbuse(userId, action, content = null) {
    try {
      // Gather all signals
      const [
        contentAnalysis,
        behaviorAnalysis,
        proxyCheck,
        rateLimit,
        userHistory
      ] = await Promise.all([
        this.analyzeContent(content),
        this.analyzeBehavior(userId, action),
        ProxyDetectionService.detectProxy(await this.getClientIP()),
        this.checkRateLimits(userId, action),
        this.getUserAbuseHistory(userId)
      ]);

      // Calculate overall risk
      const risk = this.calculateRisk({
        contentRisk: contentAnalysis.riskScore,
        behaviorRisk: behaviorAnalysis.riskScore,
        proxyRisk: proxyCheck.riskScore,
        rateLimitRisk: rateLimit.riskScore,
        historicalRisk: userHistory.riskScore
      });

      // Determine abuse type and severity
      const abuseType = this.determineAbuseType(
        contentAnalysis,
        behaviorAnalysis,
        action
      );

      const severity = this.determineSeverity(risk, abuseType);

      // Take action based on severity
      await this.handleAbuse(userId, {
        type: abuseType,
        severity,
        risk,
        details: {
          content: contentAnalysis,
          behavior: behaviorAnalysis,
          proxy: proxyCheck,
          rateLimit,
          history: userHistory
        }
      });

      return {
        isAbusive: risk > 0.7,
        risk,
        type: abuseType,
        severity,
        details: {
          contentIssues: contentAnalysis.issues,
          behaviorIssues: behaviorAnalysis.issues,
          rateLimitStatus: rateLimit.status
        }
      };
    } catch (error) {
      console.error('Error detecting abuse:', error);
      throw error;
    }
  }

  static async analyzeContent(content) {
    if (!content) return { riskScore: 0, issues: [] };

    try {
      const issues = [];
      let riskScore = 0;

      // Check for spam patterns
      const spamScore = await this.checkSpamPatterns(content);
      if (spamScore > 0.7) {
        issues.push({
          type: 'spam',
          score: spamScore,
          details: 'Content matches spam patterns'
        });
        riskScore += spamScore * 0.3;
      }

      // Check for inappropriate content
      const inappropriateScore = await this.checkInappropriateContent(content);
      if (inappropriateScore > 0.6) {
        issues.push({
          type: 'inappropriate',
          score: inappropriateScore,
          details: 'Content contains inappropriate material'
        });
        riskScore += inappropriateScore * 0.4;
      }

      // Check for malicious links
      const maliciousLinks = await this.checkMaliciousLinks(content);
      if (maliciousLinks.detected) {
        issues.push({
          type: 'malicious_links',
          score: maliciousLinks.riskScore,
          details: 'Content contains suspicious URLs'
        });
        riskScore += maliciousLinks.riskScore * 0.3;
      }

      return {
        riskScore: Math.min(1, riskScore),
        issues
      };
    } catch (error) {
      console.error('Error analyzing content:', error);
      return { riskScore: 0, issues: [] };
    }
  }

  static async analyzeBehavior(userId, action) {
    try {
      const issues = [];
      let riskScore = 0;

      // Check action frequency
      const frequency = await this.checkActionFrequency(userId, action);
      if (frequency.tooFrequent) {
        issues.push({
          type: 'high_frequency',
          score: frequency.riskScore,
          details: 'Actions performed too frequently'
        });
        riskScore += frequency.riskScore * 0.4;
      }

      // Check for pattern anomalies
      const patterns = await this.checkBehaviorPatterns(userId);
      if (patterns.isAnomalous) {
        issues.push({
          type: 'anomalous_pattern',
          score: patterns.riskScore,
          details: 'Unusual behavior patterns detected'
        });
        riskScore += patterns.riskScore * 0.3;
      }

      // Check for multiple account correlation
      const correlation = await this.checkAccountCorrelation(userId);
      if (correlation.found) {
        issues.push({
          type: 'account_correlation',
          score: correlation.riskScore,
          details: 'Possible multiple account abuse'
        });
        riskScore += correlation.riskScore * 0.3;
      }

      return {
        riskScore: Math.min(1, riskScore),
        issues
      };
    } catch (error) {
      console.error('Error analyzing behavior:', error);
      return { riskScore: 0, issues: [] };
    }
  }

  static async checkRateLimits(userId, action) {
    try {
      const windows = [
        { duration: 60000, limit: 30 },    // 1 minute
        { duration: 300000, limit: 100 },  // 5 minutes
        { duration: 3600000, limit: 500 }  // 1 hour
      ];

      const violations = [];
      let riskScore = 0;

      for (const window of windows) {
        const count = await this.getActionCount(userId, action, window.duration);
        if (count > window.limit) {
          violations.push({
            window: window.duration / 1000,
            count,
            limit: window.limit
          });
          riskScore += 0.3;
        }
      }

      return {
        riskScore: Math.min(1, riskScore),
        violations,
        status: violations.length > 0 ? 'exceeded' : 'normal'
      };
    } catch (error) {
      console.error('Error checking rate limits:', error);
      return { riskScore: 0, violations: [], status: 'error' };
    }
  }

  static async handleAbuse(userId, abuseData) {
    try {
      // Log abuse detection
      await this.logAbuseDetection(userId, abuseData);

      // Take action based on severity
      switch (abuseData.severity) {
        case this.SEVERITY_LEVELS.CRITICAL:
          await this.handleCriticalAbuse(userId, abuseData);
          break;
        case this.SEVERITY_LEVELS.HIGH:
          await this.handleHighAbuse(userId, abuseData);
          break;
        case this.SEVERITY_LEVELS.MEDIUM:
          await this.handleMediumAbuse(userId, abuseData);
          break;
        case this.SEVERITY_LEVELS.LOW:
          await this.handleLowAbuse(userId, abuseData);
          break;
      }
    } catch (error) {
      console.error('Error handling abuse:', error);
      throw error;
    }
  }

  static async handleCriticalAbuse(userId, abuseData) {
    try {
      // Block IP
      const ip = await this.getClientIP();
      await IPBlockingService.blockIP(
        ip,
        'critical_abuse',
        IPBlockingService.BLOCK_DURATIONS.PERMANENT,
        abuseData
      );

      // Disable user account
      await this.disableUserAccount(userId, 'critical_abuse');

      // Notify admins
      await NotificationService.notifyAdmins(
        'CRITICAL_ABUSE',
        {
          userId,
          abuseData
        },
        'critical'
      );
    } catch (error) {
      console.error('Error handling critical abuse:', error);
      throw error;
    }
  }

  static async handleHighAbuse(userId, abuseData) {
    try {
      // Temporary IP block
      const ip = await this.getClientIP();
      await IPBlockingService.blockIP(
        ip,
        'high_abuse',
        IPBlockingService.BLOCK_DURATIONS.LONG,
        abuseData
      );

      // Restrict user actions
      await this.restrictUserActions(userId, 'high_abuse');

      // Notify user and admins
      await Promise.all([
        NotificationService.notifyUser(
          userId,
          'abuse_warning',
          {
            severity: 'high',
            details: abuseData
          }
        ),
        NotificationService.notifyAdmins(
          'HIGH_ABUSE',
          {
            userId,
            abuseData
          },
          'high'
        )
      ]);
    } catch (error) {
      console.error('Error handling high abuse:', error);
      throw error;
    }
  }

  static async handleMediumAbuse(userId, abuseData) {
    try {
      // Add warning to user account
      await this.addUserWarning(userId, abuseData);

      // Notify user
      await NotificationService.notifyUser(
        userId,
        'abuse_warning',
        {
          severity: 'medium',
          details: abuseData
        }
      );
    } catch (error) {
      console.error('Error handling medium abuse:', error);
      throw error;
    }
  }

  static async handleLowAbuse(userId, abuseData) {
    try {
      // Log warning
      await this.logUserWarning(userId, abuseData);
    } catch (error) {
      console.error('Error handling low abuse:', error);
      throw error;
    }
  }

  // Utility methods
  static async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting client IP:', error);
      return null;
    }
  }

  static calculateRisk(risks) {
    const weights = {
      contentRisk: 0.3,
      behaviorRisk: 0.25,
      proxyRisk: 0.15,
      rateLimitRisk: 0.15,
      historicalRisk: 0.15
    };

    return Object.entries(risks).reduce(
      (total, [key, value]) => total + (value * weights[key]),
      0
    );
  }

  static determineSeverity(risk, type) {
    if (risk > 0.9) return this.SEVERITY_LEVELS.CRITICAL;
    if (risk > 0.7) return this.SEVERITY_LEVELS.HIGH;
    if (risk > 0.5) return this.SEVERITY_LEVELS.MEDIUM;
    return this.SEVERITY_LEVELS.LOW;
  }

  static async logAbuseDetection(userId, data) {
    try {
      await setDoc(doc(db, 'abuseDetections', `${userId}_${Date.now()}`), {
        userId,
        timestamp: Timestamp.now(),
        ...data
      });
    } catch (error) {
      console.error('Error logging abuse detection:', error);
    }
  }
}

export default AbuseDetectionService;
