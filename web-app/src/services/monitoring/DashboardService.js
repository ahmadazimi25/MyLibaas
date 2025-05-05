import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

class DashboardService {
  static DASHBOARD_TYPES = {
    INFRASTRUCTURE: 'infrastructure',
    SECURITY: 'security',
    BUSINESS: 'business',
    USER: 'user'
  };

  static async getInfrastructureMetrics(timeRange = 3600) {
    try {
      const now = Timestamp.now();
      const startTime = new Timestamp(now.seconds - timeRange, 0);

      // Gather metrics from different services
      const [
        serverMetrics,
        rateLimitMetrics,
        sslMetrics,
        gatewayMetrics
      ] = await Promise.all([
        this.getServerMetrics(startTime),
        this.getRateLimitMetrics(startTime),
        this.getSSLMetrics(),
        this.getGatewayMetrics(startTime)
      ]);

      return {
        servers: serverMetrics,
        rateLimiting: rateLimitMetrics,
        ssl: sslMetrics,
        gateway: gatewayMetrics,
        timestamp: now
      };
    } catch (error) {
      console.error('Error getting infrastructure metrics:', error);
      throw error;
    }
  }

  static async getServerMetrics(startTime) {
    const metricsRef = collection(db, 'serverMetrics');
    const snapshot = await getDocs(
      query(metricsRef, 
        where('timestamp', '>=', startTime),
        orderBy('timestamp', 'desc')
      )
    );

    return snapshot.docs.map(doc => ({
      serverId: doc.id,
      ...doc.data()
    }));
  }

  static async getRateLimitMetrics(startTime) {
    const metricsRef = collection(db, 'ratelimit_analytics');
    const snapshot = await getDocs(
      query(metricsRef,
        where('timestamp', '>=', startTime),
        orderBy('timestamp', 'desc')
      )
    );

    return {
      total: snapshot.size,
      blocked: snapshot.docs.filter(doc => !doc.data().allowed).length,
      byType: this.groupByType(snapshot.docs)
    };
  }

  static async getSSLMetrics() {
    const certsRef = collection(db, 'certificates');
    const snapshot = await getDocs(certsRef);

    return {
      total: snapshot.size,
      expiringSoon: snapshot.docs.filter(doc => {
        const expiryDate = new Date(doc.data().expiryDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      }).length,
      byType: this.groupByType(snapshot.docs)
    };
  }

  static async getGatewayMetrics(startTime) {
    const metricsRef = collection(db, 'gateway_metrics');
    const snapshot = await getDocs(
      query(metricsRef,
        where('timestamp', '>=', startTime),
        orderBy('timestamp', 'desc')
      )
    );

    return {
      total: snapshot.size,
      success: snapshot.docs.filter(doc => doc.data().success).length,
      byEndpoint: this.groupByEndpoint(snapshot.docs),
      responseTime: this.calculateAverageResponseTime(snapshot.docs)
    };
  }

  static async getSecurityMetrics(timeRange = 3600) {
    try {
      const now = Timestamp.now();
      const startTime = new Timestamp(now.seconds - timeRange, 0);

      const [
        authMetrics,
        fraudMetrics,
        verificationMetrics
      ] = await Promise.all([
        this.getAuthenticationMetrics(startTime),
        this.getFraudMetrics(startTime),
        this.getVerificationMetrics(startTime)
      ]);

      return {
        authentication: authMetrics,
        fraud: fraudMetrics,
        verification: verificationMetrics,
        timestamp: now
      };
    } catch (error) {
      console.error('Error getting security metrics:', error);
      throw error;
    }
  }

  static async getBusinessMetrics(timeRange = 3600) {
    try {
      const now = Timestamp.now();
      const startTime = new Timestamp(now.seconds - timeRange, 0);

      const [
        revenueMetrics,
        userMetrics,
        itemMetrics,
        rentalMetrics
      ] = await Promise.all([
        this.getRevenueMetrics(startTime),
        this.getUserMetrics(startTime),
        this.getItemMetrics(startTime),
        this.getRentalMetrics(startTime)
      ]);

      return {
        revenue: revenueMetrics,
        users: userMetrics,
        items: itemMetrics,
        rentals: rentalMetrics,
        timestamp: now
      };
    } catch (error) {
      console.error('Error getting business metrics:', error);
      throw error;
    }
  }

  static async getUserMetrics(timeRange = 3600) {
    try {
      const now = Timestamp.now();
      const startTime = new Timestamp(now.seconds - timeRange, 0);

      const [
        activityMetrics,
        performanceMetrics,
        satisfactionMetrics
      ] = await Promise.all([
        this.getUserActivityMetrics(startTime),
        this.getUserPerformanceMetrics(startTime),
        this.getUserSatisfactionMetrics(startTime)
      ]);

      return {
        activity: activityMetrics,
        performance: performanceMetrics,
        satisfaction: satisfactionMetrics,
        timestamp: now
      };
    } catch (error) {
      console.error('Error getting user metrics:', error);
      throw error;
    }
  }

  static groupByType(docs) {
    return docs.reduce((acc, doc) => {
      const type = doc.data().type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }

  static groupByEndpoint(docs) {
    return docs.reduce((acc, doc) => {
      const endpoint = doc.data().path;
      acc[endpoint] = (acc[endpoint] || 0) + 1;
      return acc;
    }, {});
  }

  static calculateAverageResponseTime(docs) {
    if (docs.length === 0) return 0;
    const total = docs.reduce((sum, doc) => sum + doc.data().responseTime, 0);
    return total / docs.length;
  }

  static async saveDashboardConfig(userId, config) {
    try {
      await setDoc(doc(db, 'dashboard_configs', userId), {
        ...config,
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving dashboard config:', error);
      throw error;
    }
  }

  static async getDashboardConfig(userId) {
    try {
      const docRef = doc(db, 'dashboard_configs', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error getting dashboard config:', error);
      throw error;
    }
  }
}

export default DashboardService;
