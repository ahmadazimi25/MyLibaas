import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import NotificationService from '../NotificationService';

class LoadBalancerService {
  static ALGORITHMS = {
    ROUND_ROBIN: 'round_robin',
    LEAST_CONNECTIONS: 'least_connections',
    IP_HASH: 'ip_hash',
    WEIGHTED_ROUND_ROBIN: 'weighted_round_robin'
  };

  static SERVER_STATUS = {
    HEALTHY: 'healthy',
    UNHEALTHY: 'unhealthy',
    DRAINING: 'draining',
    MAINTENANCE: 'maintenance'
  };

  static async initialize() {
    try {
      // Initialize load balancer
      await Promise.all([
        this.initializeServers(),
        this.initializeHealthChecks(),
        this.initializeMetrics(),
        this.initializeSSL()
      ]);

      // Start health checks
      this.startHealthChecks();

      return { success: true, message: 'Load balancer initialized' };
    } catch (error) {
      console.error('Error initializing load balancer:', error);
      throw error;
    }
  }

  static async distributeRequest(request) {
    try {
      // Get active servers
      const servers = await this.getActiveServers();
      if (servers.length === 0) {
        throw new Error('No available servers');
      }

      // Select server based on algorithm
      const server = await this.selectServer(servers, request);

      // Update server metrics
      await this.updateServerMetrics(server.id, request);

      return {
        server,
        timestamp: Timestamp.now()
      };
    } catch (error) {
      console.error('Error distributing request:', error);
      throw error;
    }
  }

  static async selectServer(servers, request) {
    const algorithm = await this.getCurrentAlgorithm();
    
    switch (algorithm) {
      case this.ALGORITHMS.ROUND_ROBIN:
        return this.roundRobinSelection(servers);
      case this.ALGORITHMS.LEAST_CONNECTIONS:
        return this.leastConnectionsSelection(servers);
      case this.ALGORITHMS.IP_HASH:
        return this.ipHashSelection(servers, request);
      case this.ALGORITHMS.WEIGHTED_ROUND_ROBIN:
        return this.weightedRoundRobinSelection(servers);
      default:
        return this.roundRobinSelection(servers);
    }
  }

  static async roundRobinSelection(servers) {
    try {
      // Get current index
      const configRef = doc(db, 'loadbalancer', 'config');
      const config = await getDoc(configRef);
      const currentIndex = config.data()?.currentIndex || 0;

      // Select next server
      const server = servers[currentIndex % servers.length];

      // Update index
      await setDoc(configRef, {
        currentIndex: (currentIndex + 1) % servers.length,
        timestamp: Timestamp.now()
      }, { merge: true });

      return server;
    } catch (error) {
      console.error('Error in round robin selection:', error);
      throw error;
    }
  }

  static async leastConnectionsSelection(servers) {
    try {
      // Get server metrics
      const metrics = await Promise.all(
        servers.map(async server => {
          const metricsRef = doc(db, 'serverMetrics', server.id);
          const metricsDoc = await getDoc(metricsRef);
          return {
            server,
            connections: metricsDoc.data()?.activeConnections || 0
          };
        })
      );

      // Sort by connections
      metrics.sort((a, b) => a.connections - b.connections);

      return metrics[0].server;
    } catch (error) {
      console.error('Error in least connections selection:', error);
      throw error;
    }
  }

  static async ipHashSelection(servers, request) {
    try {
      const ip = request.ip || '0.0.0.0';
      
      // Create hash from IP
      const hash = this.hashIP(ip);
      
      // Select server based on hash
      const index = hash % servers.length;
      return servers[index];
    } catch (error) {
      console.error('Error in IP hash selection:', error);
      throw error;
    }
  }

  static async weightedRoundRobinSelection(servers) {
    try {
      // Get server weights
      const weights = await Promise.all(
        servers.map(async server => {
          const configRef = doc(db, 'serverConfig', server.id);
          const config = await getDoc(configRef);
          return {
            server,
            weight: config.data()?.weight || 1
          };
        })
      );

      // Calculate total weight
      const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

      // Get current weight index
      const configRef = doc(db, 'loadbalancer', 'config');
      const config = await getDoc(configRef);
      const currentWeight = config.data()?.currentWeight || 0;

      // Find server for current weight
      let selectedServer = null;
      let remainingWeight = currentWeight % totalWeight;

      for (const { server, weight } of weights) {
        if (remainingWeight < weight) {
          selectedServer = server;
          break;
        }
        remainingWeight -= weight;
      }

      // Update weight index
      await setDoc(configRef, {
        currentWeight: currentWeight + 1,
        timestamp: Timestamp.now()
      }, { merge: true });

      return selectedServer || servers[0];
    } catch (error) {
      console.error('Error in weighted round robin selection:', error);
      throw error;
    }
  }

  static async performHealthCheck(server) {
    try {
      // Check server health
      const response = await fetch(`${server.url}/health`);
      const healthy = response.status === 200;

      // Update server status
      await this.updateServerStatus(
        server.id,
        healthy ? this.SERVER_STATUS.HEALTHY : this.SERVER_STATUS.UNHEALTHY
      );

      // If unhealthy, notify admins
      if (!healthy) {
        await NotificationService.notifyAdmins('SERVER_UNHEALTHY', {
          serverId: server.id,
          url: server.url
        });
      }

      return healthy;
    } catch (error) {
      console.error('Error performing health check:', error);
      await this.updateServerStatus(server.id, this.SERVER_STATUS.UNHEALTHY);
      return false;
    }
  }

  static async updateServerStatus(serverId, status) {
    try {
      await setDoc(doc(db, 'servers', serverId), {
        status,
        lastChecked: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating server status:', error);
      throw error;
    }
  }

  static async updateServerMetrics(serverId, request) {
    try {
      const metricsRef = doc(db, 'serverMetrics', serverId);
      const metrics = await getDoc(metricsRef);
      const currentMetrics = metrics.data() || {
        requests: 0,
        activeConnections: 0
      };

      await setDoc(metricsRef, {
        requests: currentMetrics.requests + 1,
        activeConnections: currentMetrics.activeConnections + 1,
        lastRequest: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating server metrics:', error);
    }
  }

  static hashIP(ip) {
    return ip.split('.').reduce((hash, octet) => {
      return ((hash << 5) + hash) + parseInt(octet);
    }, 5381);
  }

  static startHealthChecks() {
    setInterval(async () => {
      const servers = await this.getActiveServers();
      await Promise.all(
        servers.map(server => this.performHealthCheck(server))
      );
    }, 30000); // Every 30 seconds
  }
}

export default LoadBalancerService;
