import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, Timestamp } from 'firebase/firestore';
import { CacheService } from './CacheService';
import RateLimitingService from './RateLimitingService';
import SSLService from './SSLService';
import LoadBalancerService from './LoadBalancerService';

class APIGatewayService {
  static ROUTE_TYPES = {
    PUBLIC: 'public',
    PROTECTED: 'protected',
    ADMIN: 'admin'
  };

  static async initialize() {
    try {
      await Promise.all([
        this.initializeRouting(),
        this.initializeMiddleware(),
        this.initializeEndpoints()
      ]);

      return { success: true, message: 'API Gateway initialized' };
    } catch (error) {
      console.error('Error initializing API Gateway:', error);
      throw error;
    }
  }

  static async handleRequest(request) {
    try {
      // Apply middleware chain
      const middlewareResult = await this.applyMiddleware(request);
      if (!middlewareResult.success) {
        return middlewareResult;
      }

      // Route request
      const route = await this.getRoute(request.path);
      if (!route) {
        return {
          success: false,
          status: 404,
          message: 'Route not found'
        };
      }

      // Check permissions
      if (!await this.checkPermissions(request, route)) {
        return {
          success: false,
          status: 403,
          message: 'Unauthorized'
        };
      }

      // Load balance request
      const server = await LoadBalancerService.distributeRequest(request);
      if (!server.allowed) {
        return {
          success: false,
          status: 503,
          message: 'Service unavailable'
        };
      }

      // Forward request
      const response = await this.forwardRequest(server.server, request);

      // Cache response if applicable
      if (route.cache) {
        await this.cacheResponse(request.path, response);
      }

      return response;
    } catch (error) {
      console.error('Error handling request:', error);
      return {
        success: false,
        status: 500,
        message: 'Internal server error'
      };
    }
  }

  static async applyMiddleware(request) {
    try {
      // Apply SSL/TLS
      const sslResult = await SSLService.validateRequest(request);
      if (!sslResult.success) return sslResult;

      // Check rate limits
      const rateLimitResult = await RateLimitingService.checkRateLimit(
        request.ip,
        request.path
      );
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          status: 429,
          message: 'Rate limit exceeded',
          resetTime: rateLimitResult.resetTime
        };
      }

      // Apply other middleware (authentication, logging, etc.)
      const middlewareChain = await this.getMiddlewareChain(request.path);
      for (const middleware of middlewareChain) {
        const result = await middleware(request);
        if (!result.success) return result;
      }

      return { success: true };
    } catch (error) {
      console.error('Error applying middleware:', error);
      return {
        success: false,
        status: 500,
        message: 'Middleware error'
      };
    }
  }

  static async getRoute(path) {
    try {
      // Check cache first
      const cachedRoute = await CacheService.get(`route_${path}`);
      if (cachedRoute) return cachedRoute;

      // Get from database
      const routeDoc = await getDoc(doc(db, 'routes', path));
      if (!routeDoc.exists()) return null;

      const route = routeDoc.data();
      
      // Cache route
      await CacheService.set(`route_${path}`, route, 3600);
      
      return route;
    } catch (error) {
      console.error('Error getting route:', error);
      return null;
    }
  }

  static async checkPermissions(request, route) {
    try {
      switch (route.type) {
        case this.ROUTE_TYPES.PUBLIC:
          return true;

        case this.ROUTE_TYPES.PROTECTED:
          return await this.validateToken(request.token);

        case this.ROUTE_TYPES.ADMIN:
          return await this.validateAdminToken(request.token);

        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  static async validateToken(token) {
    // Implement token validation logic
    return true;
  }

  static async validateAdminToken(token) {
    // Implement admin token validation logic
    return true;
  }

  static async forwardRequest(server, request) {
    try {
      // Implement request forwarding logic
      const response = await fetch(`${server.url}${request.path}`, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });

      return {
        success: true,
        status: response.status,
        data: await response.json()
      };
    } catch (error) {
      console.error('Error forwarding request:', error);
      throw error;
    }
  }

  static async cacheResponse(path, response) {
    try {
      if (response.success && response.status === 200) {
        await CacheService.set(`response_${path}`, response, 300); // Cache for 5 minutes
      }
    } catch (error) {
      console.error('Error caching response:', error);
    }
  }

  static async addRoute(path, config) {
    try {
      await setDoc(doc(db, 'routes', path), {
        ...config,
        updatedAt: Timestamp.now()
      });

      // Invalidate cache
      await CacheService.invalidate(`route_${path}`);

      return { success: true };
    } catch (error) {
      console.error('Error adding route:', error);
      throw error;
    }
  }

  static async removeRoute(path) {
    try {
      await deleteDoc(doc(db, 'routes', path));
      await CacheService.invalidate(`route_${path}`);
      return { success: true };
    } catch (error) {
      console.error('Error removing route:', error);
      throw error;
    }
  }

  static async getMetrics(timeRange = 3600) {
    try {
      const now = Timestamp.now();
      const startTime = new Timestamp(now.seconds - timeRange, 0);

      const metricsRef = collection(db, 'gateway_metrics');
      const query = metricsRef
        .where('timestamp', '>=', startTime)
        .orderBy('timestamp', 'desc');

      const snapshot = await getDocs(query);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting metrics:', error);
      return [];
    }
  }
}

export default APIGatewayService;
