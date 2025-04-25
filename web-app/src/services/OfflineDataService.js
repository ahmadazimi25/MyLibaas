import { openDB } from 'idb';

class OfflineDataService {
  constructor() {
    this.dbName = 'mylibaas-offline';
    this.version = 1;
    this.stores = {
      listings: 'listings',
      bookings: 'bookings',
      messages: 'messages',
      userProfile: 'userProfile',
      outbox: 'outbox'
    };
    this.initializeDb();
  }

  async initializeDb() {
    try {
      this.db = await openDB(this.dbName, this.version, {
        upgrade(db) {
          // Create stores if they don't exist
          if (!db.objectStoreNames.contains('listings')) {
            db.createObjectStore('listings', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('bookings')) {
            db.createObjectStore('bookings', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('messages')) {
            db.createObjectStore('messages', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('userProfile')) {
            db.createObjectStore('userProfile', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('outbox')) {
            db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
          }
        }
      });
    } catch (error) {
      console.error('Error initializing offline database:', error);
    }
  }

  // Listings
  async cacheListing(listing) {
    try {
      const tx = this.db.transaction('listings', 'readwrite');
      await tx.store.put(listing);
    } catch (error) {
      console.error('Error caching listing:', error);
    }
  }

  async getCachedListing(id) {
    try {
      return await this.db.get('listings', id);
    } catch (error) {
      console.error('Error getting cached listing:', error);
      return null;
    }
  }

  async getCachedListings() {
    try {
      return await this.db.getAll('listings');
    } catch (error) {
      console.error('Error getting cached listings:', error);
      return [];
    }
  }

  // Bookings
  async cacheBooking(booking) {
    try {
      const tx = this.db.transaction('bookings', 'readwrite');
      await tx.store.put(booking);
    } catch (error) {
      console.error('Error caching booking:', error);
    }
  }

  async getCachedBooking(id) {
    try {
      return await this.db.get('bookings', id);
    } catch (error) {
      console.error('Error getting cached booking:', error);
      return null;
    }
  }

  async getCachedBookings() {
    try {
      return await this.db.getAll('bookings');
    } catch (error) {
      console.error('Error getting cached bookings:', error);
      return [];
    }
  }

  // Messages
  async cacheMessage(message) {
    try {
      const tx = this.db.transaction('messages', 'readwrite');
      await tx.store.put(message);
    } catch (error) {
      console.error('Error caching message:', error);
    }
  }

  async getCachedMessages(conversationId) {
    try {
      const allMessages = await this.db.getAll('messages');
      return allMessages.filter(msg => msg.conversationId === conversationId);
    } catch (error) {
      console.error('Error getting cached messages:', error);
      return [];
    }
  }

  // User Profile
  async cacheUserProfile(profile) {
    try {
      const tx = this.db.transaction('userProfile', 'readwrite');
      await tx.store.put(profile);
    } catch (error) {
      console.error('Error caching user profile:', error);
    }
  }

  async getCachedUserProfile(userId) {
    try {
      return await this.db.get('userProfile', userId);
    } catch (error) {
      console.error('Error getting cached user profile:', error);
      return null;
    }
  }

  // Offline Actions Queue
  async queueAction(action) {
    try {
      const tx = this.db.transaction('outbox', 'readwrite');
      await tx.store.add({
        ...action,
        timestamp: new Date(),
        status: 'pending'
      });

      // Request sync if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const sw = await navigator.serviceWorker.ready;
        await sw.sync.register('sync-actions');
      }
    } catch (error) {
      console.error('Error queuing offline action:', error);
    }
  }

  async getPendingActions() {
    try {
      return await this.db.getAll('outbox');
    } catch (error) {
      console.error('Error getting pending actions:', error);
      return [];
    }
  }

  async removeAction(id) {
    try {
      await this.db.delete('outbox', id);
    } catch (error) {
      console.error('Error removing action:', error);
    }
  }

  // Storage Management
  async clearOldCache(daysToKeep = 7) {
    const stores = Object.values(this.stores);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    for (const store of stores) {
      try {
        const tx = this.db.transaction(store, 'readwrite');
        const items = await tx.store.getAll();
        
        for (const item of items) {
          if (item.timestamp && new Date(item.timestamp) < cutoffDate) {
            await tx.store.delete(item.id);
          }
        }
      } catch (error) {
        console.error(`Error clearing old cache for ${store}:`, error);
      }
    }
  }

  // Network Status
  isOnline() {
    return navigator.onLine;
  }

  addOnlineListener(callback) {
    window.addEventListener('online', callback);
  }

  addOfflineListener(callback) {
    window.addEventListener('offline', callback);
  }

  removeOnlineListener(callback) {
    window.removeEventListener('online', callback);
  }

  removeOfflineListener(callback) {
    window.removeEventListener('offline', callback);
  }
}

export default new OfflineDataService();
