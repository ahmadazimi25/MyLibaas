import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, Timestamp } from 'firebase/firestore';
import { CacheService } from './CacheService';

class RateLimitingService {
  static LIMIT_TYPES = {
    IP: 'ip_based',
    USER: 'user_based',
    API_KEY: 'api_key_based',
    ENDPOINT: 'endpoint_based'
  };

  static TIERS = {
    FREE: {
      requests: 100,
      window: 60, // 1 minute
      concurrent: 5
    },
    PREMIUM: {
      requests: 1000,
      window: 60,
      concurrent: 20
    },
    ENTERPRISE: {
      requests: 10000,
      window: 60,
      concurrent: 100
    }
  };

  static async initialize() {
    try {
      // Initialize rate limiting
      await Promise.all([
        this.initializeRateLimiter(),
        this.initializeQuotaTracker(),
        this.initializeConcurrencyLimiter()
      ]);

      // Start cleanup job
      this.startCleanupJob();

      return { success: true, message: 'Rate limiting initialized' };
    } catch (error) {
      console.error('Error initializing rate limiting:', error);
      throw error;
    }
  }

  static async checkRateLimit(identifier, type = this.LIMIT_TYPES.IP) {
    try {
      // Get tier and limits
      const tier = await this.getUserTier(identifier);
      const limits = this.TIERS[tier];

      // Check different limit types
      const [requestLimit, concurrentLimit] = await Promise.all([
        this.checkRequestLimit(identifier, limits),
        this.checkConcurrentLimit(identifier, limits)
      ]);

      if (!requestLimit.allowed || !concurrentLimit.allowed) {
        return {
          allowed: false,
          reason: !requestLimit.allowed ? 'Rate limit exceeded' : 'Too many concurrent requests',
          resetTime: Math.min(requestLimit.resetTime, concurrentLimit.resetTime)
        };
      }

      // Increment counters
      await this.incrementCounters(identifier, type);

      return {
        allowed: true,
        remaining: requestLimit.remaining,
        resetTime: requestLimit.resetTime
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Default to allowing the request in case of errors
      return { allowed: true, remaining: 0, resetTime: Date.now() + 60000 };
    }
  }

  static async checkRequestLimit(identifier, limits) {
    try {
      const key = `ratelimit_${identifier}`;
      const now = Date.now();

      // Get current window data from cache
      let window = await CacheService.get(key) || {
        count: 0,
        startTime: now
      };

      // Check if window has expired
      if (now - window.startTime >= limits.window * 1000) {
        window = {
          count: 0,
          startTime: now
        };
      }

      // Check if limit is exceeded
      if (window.count >= limits.requests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: window.startTime + (limits.window * 1000)
        };
      }

      return {
        allowed: true,
        remaining: limits.requests - window.count,
        resetTime: window.startTime + (limits.window * 1000)
      };
    } catch (error) {
      console.error('Error checking request limit:', error);
      return { allowed: true, remaining: 0, resetTime: Date.now() + 60000 };
    }
  }

  static async checkConcurrentLimit(identifier, limits) {
    try {
      const key = `concurrent_${identifier}`;
      const now = Date.now();

      // Get current concurrent requests from cache
      let concurrent = await CacheService.get(key) || {
        count: 0,
        requests: []
      };

      // Clean up old requests
      concurrent.requests = concurrent.requests.filter(req => 
        now - req.timestamp < 30000 // 30 seconds timeout
      );
      concurrent.count = concurrent.requests.length;

      // Check if limit is exceeded
      if (concurrent.count >= limits.concurrent) {
        return {
          allowed: false,
          resetTime: concurrent.requests[0].timestamp + 30000
        };
      }

      return {
        allowed: true,
        resetTime: now + 30000
      };
    } catch (error) {
      console.error('Error checking concurrent limit:', error);
      return { allowed: true, resetTime: Date.now() + 30000 };
    }
  }

  static async incrementCounters(identifier, type) {
    try {
      const now = Date.now();

      // Increment request counter
      const requestKey = `ratelimit_${identifier}`;
      let window = await CacheService.get(requestKey) || {
        count: 0,
        startTime: now
      };
      window.count++;
      await CacheService.set(requestKey, window, 60);

      // Add concurrent request
      const concurrentKey = `concurrent_${identifier}`;
      let concurrent = await CacheService.get(concurrentKey) || {
        count: 0,
        requests: []
      };
      concurrent.requests.push({ timestamp: now });
      concurrent.count = concurrent.requests.length;
      await CacheService.set(concurrentKey, concurrent, 30);

      // Store analytics
      await this.storeAnalytics(identifier, type);
    } catch (error) {
      console.error('Error incrementing counters:', error);
    }
  }

  static async getUserTier(identifier) {
    try {
      // Check cache first
      const cachedTier = await CacheService.get(`tier_${identifier}`);
      if (cachedTier) return cachedTier;

      // Check database
      const userDoc = await getDoc(doc(db, 'users', identifier));
      const tier = userDoc.exists() ? userDoc.data().tier : 'FREE';

      // Cache the result
      await CacheService.set(`tier_${identifier}`, tier, 3600);

      return tier;
    } catch (error) {
      console.error('Error getting user tier:', error);
      return 'FREE'; // Default to free tier
    }
  }

  static async storeAnalytics(identifier, type) {
    try {
      const analytics = {
        identifier,
        type,
        timestamp: Timestamp.now()
      };

      await setDoc(doc(collection(db, 'ratelimit_analytics'), Date.now().toString()), analytics);
    } catch (error) {
      console.error('Error storing analytics:', error);
    }
  }

  static async getAnalytics(identifier, timeRange = 3600) {
    try {
      const now = Timestamp.now();
      const startTime = new Timestamp(now.seconds - timeRange, 0);

      const analyticsRef = collection(db, 'ratelimit_analytics');
      const query = analyticsRef
        .where('identifier', '==', identifier)
        .where('timestamp', '>=', startTime)
        .orderBy('timestamp', 'desc');

      const snapshot = await getDocs(query);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting analytics:', error);
      return [];
    }
  }

  static startCleanupJob() {
    // Clean up expired windows every minute
    setInterval(() => {
      this.cleanupExpiredWindows();
    }, 60000);
  }

  static async cleanupExpiredWindows() {
    try {
      const now = Date.now();

      // Get all rate limit keys
      const keys = await CacheService.getKeys('ratelimit_*');
      
      for (const key of keys) {
        const window = await CacheService.get(key);
        if (window && now - window.startTime >= 60000) {
          await CacheService.invalidate(key);
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired windows:', error);
    }
  }

  // Utility methods for testing and monitoring
  static async simulateLoad(identifier, requests = 100, concurrent = 10) {
    const results = [];
    const promises = [];

    for (let i = 0; i < requests; i++) {
      if (promises.length >= concurrent) {
        await Promise.race(promises);
      }

      const promise = this.checkRateLimit(identifier)
        .then(result => results.push(result));
      promises.push(promise);
    }

    await Promise.all(promises);
    return results;
  }

  static async resetLimits(identifier) {
    try {
      await Promise.all([
        CacheService.invalidate(`ratelimit_${identifier}`),
        CacheService.invalidate(`concurrent_${identifier}`)
      ]);
      return true;
    } catch (error) {
      console.error('Error resetting limits:', error);
      return false;
    }
  }
}

export default RateLimitingService;
