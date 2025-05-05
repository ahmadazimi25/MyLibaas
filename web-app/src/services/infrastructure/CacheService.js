import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, Timestamp } from 'firebase/firestore';

class CacheService {
  static CACHE_TYPES = {
    MEMORY: 'memory',
    PERSISTENT: 'persistent',
    DISTRIBUTED: 'distributed'
  };

  static memoryCache = new Map();
  static cacheTTL = new Map();

  static async initialize() {
    try {
      // Initialize cache systems
      await Promise.all([
        this.initializeMemoryCache(),
        this.initializePersistentCache(),
        this.initializeDistributedCache()
      ]);

      // Start cache maintenance
      this.startCacheMaintenance();

      return { success: true, message: 'Cache service initialized' };
    } catch (error) {
      console.error('Error initializing cache:', error);
      throw error;
    }
  }

  // Memory Cache Methods
  static async get(key, type = this.CACHE_TYPES.MEMORY) {
    try {
      switch (type) {
        case this.CACHE_TYPES.MEMORY:
          return this.getFromMemory(key);
        case this.CACHE_TYPES.PERSISTENT:
          return this.getFromPersistent(key);
        case this.CACHE_TYPES.DISTRIBUTED:
          return this.getFromDistributed(key);
        default:
          return null;
      }
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  }

  static async set(key, value, ttl = 3600, type = this.CACHE_TYPES.MEMORY) {
    try {
      switch (type) {
        case this.CACHE_TYPES.MEMORY:
          return this.setInMemory(key, value, ttl);
        case this.CACHE_TYPES.PERSISTENT:
          return this.setInPersistent(key, value, ttl);
        case this.CACHE_TYPES.DISTRIBUTED:
          return this.setInDistributed(key, value, ttl);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error setting in cache:', error);
      return false;
    }
  }

  // Memory Cache Implementation
  static getFromMemory(key) {
    // Check if key exists and not expired
    if (this.memoryCache.has(key)) {
      const expiryTime = this.cacheTTL.get(key);
      if (expiryTime > Date.now()) {
        return this.memoryCache.get(key);
      } else {
        // Remove expired key
        this.memoryCache.delete(key);
        this.cacheTTL.delete(key);
      }
    }
    return null;
  }

  static setInMemory(key, value, ttl) {
    this.memoryCache.set(key, value);
    this.cacheTTL.set(key, Date.now() + (ttl * 1000));
    return true;
  }

  // Persistent Cache Implementation
  static async getFromPersistent(key) {
    try {
      const docRef = doc(db, 'cache', key);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Check if cache is expired
        if (data.expiryTime > Timestamp.now().seconds) {
          return data.value;
        } else {
          // Remove expired cache
          await this.invalidate(key, this.CACHE_TYPES.PERSISTENT);
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting from persistent cache:', error);
      return null;
    }
  }

  static async setInPersistent(key, value, ttl) {
    try {
      await setDoc(doc(db, 'cache', key), {
        value,
        expiryTime: Timestamp.now().seconds + ttl,
        created: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error setting in persistent cache:', error);
      return false;
    }
  }

  // Distributed Cache Implementation (using Firebase RTDB or Redis)
  static async getFromDistributed(key) {
    // Implement distributed cache using Firebase RTDB or Redis
    return null;
  }

  static async setInDistributed(key, value, ttl) {
    // Implement distributed cache using Firebase RTDB or Redis
    return false;
  }

  // Cache Invalidation
  static async invalidate(key, type = this.CACHE_TYPES.MEMORY) {
    try {
      switch (type) {
        case this.CACHE_TYPES.MEMORY:
          this.memoryCache.delete(key);
          this.cacheTTL.delete(key);
          break;
        case this.CACHE_TYPES.PERSISTENT:
          await this.invalidatePersistent(key);
          break;
        case this.CACHE_TYPES.DISTRIBUTED:
          await this.invalidateDistributed(key);
          break;
      }
      return true;
    } catch (error) {
      console.error('Error invalidating cache:', error);
      return false;
    }
  }

  // Cache Maintenance
  static startCacheMaintenance() {
    // Clean memory cache every minute
    setInterval(() => {
      this.cleanMemoryCache();
    }, 60000);

    // Clean persistent cache every hour
    setInterval(() => {
      this.cleanPersistentCache();
    }, 3600000);
  }

  static async cleanMemoryCache() {
    const now = Date.now();
    for (const [key, expiryTime] of this.cacheTTL.entries()) {
      if (expiryTime <= now) {
        this.memoryCache.delete(key);
        this.cacheTTL.delete(key);
      }
    }
  }

  static async cleanPersistentCache() {
    try {
      const cacheRef = collection(db, 'cache');
      const now = Timestamp.now().seconds;
      
      // Get expired cache entries
      const expiredDocs = await getDocs(
        query(cacheRef, where('expiryTime', '<=', now))
      );

      // Delete expired entries
      const deletePromises = expiredDocs.docs.map(doc => 
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error cleaning persistent cache:', error);
    }
  }

  // Cache Statistics
  static async getStats() {
    return {
      memory: {
        size: this.memoryCache.size,
        keys: Array.from(this.memoryCache.keys())
      },
      persistent: await this.getPersistentStats(),
      distributed: await this.getDistributedStats()
    };
  }

  // Usage Examples
  static async cacheAPIResponse(endpoint, response, ttl = 3600) {
    const key = `api_${endpoint}`;
    await this.set(key, response, ttl);
  }

  static async getCachedAPIResponse(endpoint) {
    const key = `api_${endpoint}`;
    return await this.get(key);
  }

  static async cacheUserData(userId, data, ttl = 1800) {
    const key = `user_${userId}`;
    await this.set(key, data, ttl, this.CACHE_TYPES.PERSISTENT);
  }

  static async getCachedUserData(userId) {
    const key = `user_${userId}`;
    return await this.get(key, this.CACHE_TYPES.PERSISTENT);
  }
}

export default CacheService;
