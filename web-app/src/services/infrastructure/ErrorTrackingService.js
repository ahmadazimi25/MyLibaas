import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';
import { db } from '../firebase/firebaseConfig';

class ErrorTrackingService {
  static ERROR_LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    FATAL: 'fatal'
  };

  constructor() {
    this.isInitialized = false;
    this.environment = process.env.NODE_ENV;
    this.release = process.env.REACT_APP_VERSION;
  }

  initialize(dsn) {
    if (this.isInitialized) return;

    Sentry.init({
      dsn,
      environment: this.environment,
      release: this.release,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 1.0,
      beforeSend: (event) => this.beforeSend(event)
    });

    this.setupGlobalHandlers();
    this.isInitialized = true;
  }

  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        level: this.ERROR_LEVELS.ERROR,
        tags: { type: 'unhandled_promise_rejection' }
      });
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        level: this.ERROR_LEVELS.ERROR,
        tags: { type: 'uncaught_error' }
      });
    });
  }

  setUser(user) {
    if (!this.isInitialized) return;

    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username
    });
  }

  clearUser() {
    if (!this.isInitialized) return;
    Sentry.setUser(null);
  }

  async captureError(error, options = {}) {
    if (!this.isInitialized) return;

    const {
      level = this.ERROR_LEVELS.ERROR,
      tags = {},
      extra = {},
      user = null
    } = options;

    // Store error in Firebase
    await this.storeError({
      message: error.message,
      stack: error.stack,
      level,
      tags,
      extra,
      user,
      timestamp: new Date()
    });

    // Send to Sentry
    Sentry.withScope((scope) => {
      scope.setLevel(level);
      Object.entries(tags).forEach(([key, value]) => scope.setTag(key, value));
      Object.entries(extra).forEach(([key, value]) => scope.setExtra(key, value));
      if (user) scope.setUser(user);
      Sentry.captureException(error);
    });
  }

  async storeError(errorData) {
    try {
      await db.collection('errors').add(errorData);
    } catch (err) {
      console.error('Failed to store error:', err);
    }
  }

  beforeSend(event) {
    // Filter out certain errors
    if (this.shouldIgnoreError(event)) {
      return null;
    }

    // Sanitize sensitive data
    return this.sanitizeEventData(event);
  }

  shouldIgnoreError(event) {
    // Ignore certain types of errors
    const ignoredErrors = [
      'Network request failed',
      'ResizeObserver loop limit exceeded'
    ];

    return ignoredErrors.some(ignored => 
      event.message && event.message.includes(ignored)
    );
  }

  sanitizeEventData(event) {
    if (!event.request) return event;

    // Remove sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie'];
    if (event.request.headers) {
      sensitiveHeaders.forEach(header => {
        delete event.request.headers[header];
      });
    }

    // Sanitize URLs
    if (event.request.url) {
      event.request.url = this.sanitizeUrl(event.request.url);
    }

    return event;
  }

  sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      // Remove sensitive query parameters
      const sensitiveParams = ['token', 'key', 'password'];
      sensitiveParams.forEach(param => urlObj.searchParams.delete(param));
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  async getErrorStats(period = '24h') {
    const now = new Date();
    const periodStart = new Date(now.getTime() - this.getPeriodMilliseconds(period));

    const snapshot = await db.collection('errors')
      .where('timestamp', '>=', periodStart)
      .get();

    const errors = snapshot.docs.map(doc => doc.data());

    return {
      total: errors.length,
      byLevel: this.groupByLevel(errors),
      topErrors: this.getTopErrors(errors),
      timeline: this.getErrorTimeline(errors)
    };
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

  groupByLevel(errors) {
    return errors.reduce((acc, error) => {
      acc[error.level] = (acc[error.level] || 0) + 1;
      return acc;
    }, {});
  }

  getTopErrors(errors) {
    const errorMap = errors.reduce((acc, error) => {
      const key = `${error.message}:${error.stack?.split('\n')[0]}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(errorMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }));
  }

  getErrorTimeline(errors) {
    const timeline = {};
    errors.forEach(error => {
      const hour = error.timestamp.toDate().toISOString().slice(0, 13);
      timeline[hour] = (timeline[hour] || 0) + 1;
    });
    return timeline;
  }
}

export default new ErrorTrackingService();
