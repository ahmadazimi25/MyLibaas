import { openDB } from 'idb';

class OfflineNotificationService {
  constructor() {
    this.dbName = 'mylibaas-notifications';
    this.version = 1;
    this.initializeDb();
    this.setupNetworkListeners();
  }

  async initializeDb() {
    this.db = await openDB(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => this.showNetworkStatus('online'));
    window.addEventListener('offline', () => this.showNetworkStatus('offline'));
  }

  async showNetworkStatus(status) {
    const title = status === 'online' ? 'Back Online!' : 'You\'re Offline';
    const options = {
      body: status === 'online'
        ? 'Your connection has been restored. Syncing your data...'
        : 'Don\'t worry! You can still access your saved items and drafts.',
      icon: '/logo192.png',
      badge: '/favicon.ico',
      tag: 'network-status',
      renotify: true,
    };

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }

    // Store notification in IndexedDB
    await this.storeNotification({
      type: 'network',
      title,
      message: options.body,
      timestamp: new Date(),
      status,
    });
  }

  async storeNotification(notification) {
    try {
      await this.db.add('notifications', notification);
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  async getNotifications(limit = 50) {
    try {
      const tx = this.db.transaction('notifications', 'readonly');
      const store = tx.objectStore('notifications');
      const notifications = await store.getAll();
      return notifications
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async clearOldNotifications(daysToKeep = 7) {
    try {
      const tx = this.db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      const notifications = await store.getAll();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      for (const notification of notifications) {
        if (new Date(notification.timestamp) < cutoffDate) {
          await store.delete(notification.id);
        }
      }
    } catch (error) {
      console.error('Error clearing old notifications:', error);
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Sync notifications
  async syncNotifications() {
    if (!navigator.onLine) return;

    try {
      const notifications = await this.getNotifications();
      // TODO: Implement server sync
      console.log('Syncing notifications:', notifications);
    } catch (error) {
      console.error('Error syncing notifications:', error);
    }
  }

  // Show custom notification
  async showNotification(title, options = {}) {
    const notification = {
      type: options.type || 'custom',
      title,
      message: options.body,
      timestamp: new Date(),
      data: options.data,
    };

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        ...options,
        icon: options.icon || '/logo192.png',
        badge: options.badge || '/favicon.ico',
      });
    }

    // Store notification
    await this.storeNotification(notification);
  }
}

export default new OfflineNotificationService();
