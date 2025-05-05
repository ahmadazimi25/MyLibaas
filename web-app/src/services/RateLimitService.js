import { db } from './firebase/firebaseConfig';
import { doc, setDoc, getDoc, increment, Timestamp } from 'firebase/firestore';

class RateLimitService {
  static LIMITS = {
    LOGIN_ATTEMPTS: {
      max: 5,
      window: 15 * 60 * 1000 // 15 minutes
    },
    VERIFICATION_ATTEMPTS: {
      max: 3,
      window: 10 * 60 * 1000 // 10 minutes
    },
    PASSWORD_RESET: {
      max: 3,
      window: 60 * 60 * 1000 // 1 hour
    },
    API_CALLS: {
      max: 100,
      window: 60 * 60 * 1000 // 1 hour
    }
  };

  static async checkRateLimit(identifier, action) {
    try {
      const limit = this.LIMITS[action];
      if (!limit) {
        throw new Error(`Unknown rate limit action: ${action}`);
      }

      const rateLimitRef = doc(db, 'rateLimits', `${identifier}_${action}`);
      const rateLimitDoc = await getDoc(rateLimitRef);
      const now = Date.now();

      if (rateLimitDoc.exists()) {
        const data = rateLimitDoc.data();
        
        // Check if window has expired
        if (now - data.windowStart > limit.window) {
          // Reset window
          await this.resetRateLimit(identifier, action);
          return {
            allowed: true,
            remaining: limit.max - 1,
            resetAt: new Date(now + limit.window)
          };
        }

        // Check if limit exceeded
        if (data.attempts >= limit.max) {
          return {
            allowed: false,
            remaining: 0,
            resetAt: new Date(data.windowStart + limit.window)
          };
        }

        // Increment attempts
        await setDoc(rateLimitRef, {
          attempts: increment(1)
        }, { merge: true });

        return {
          allowed: true,
          remaining: limit.max - data.attempts - 1,
          resetAt: new Date(data.windowStart + limit.window)
        };
      } else {
        // Create new rate limit entry
        await setDoc(rateLimitRef, {
          identifier,
          action,
          attempts: 1,
          windowStart: now,
          lastAttempt: now
        });

        return {
          allowed: true,
          remaining: limit.max - 1,
          resetAt: new Date(now + limit.window)
        };
      }
    } catch (error) {
      console.error('Error checking rate limit:', error);
      throw error;
    }
  }

  static async resetRateLimit(identifier, action) {
    try {
      const now = Date.now();
      await setDoc(doc(db, 'rateLimits', `${identifier}_${action}`), {
        identifier,
        action,
        attempts: 0,
        windowStart: now,
        lastAttempt: now
      });

      return {
        success: true,
        message: 'Rate limit reset successfully'
      };
    } catch (error) {
      console.error('Error resetting rate limit:', error);
      throw error;
    }
  }

  static async logRateLimitViolation(identifier, action) {
    try {
      await setDoc(doc(db, 'rateLimitViolations', `${identifier}_${Date.now()}`), {
        identifier,
        action,
        timestamp: Timestamp.now(),
        userAgent: navigator.userAgent,
        ip: await this.getClientIP()
      });
    } catch (error) {
      console.error('Error logging rate limit violation:', error);
    }
  }

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

  static getRateLimitHeaders(result) {
    return {
      'X-RateLimit-Limit': this.LIMITS[result.action].max,
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': result.resetAt.getTime()
    };
  }
}

export default RateLimitService;
