import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, collection, query, where, Timestamp } from 'firebase/firestore';

class ServiceMetrics {
  static METRIC_TYPES = {
    SUPPORT: 'support',
    SHIPPING: 'shipping',
    QUALITY: 'quality'
  };

  static async recordSupportMetrics() {
    try {
      const now = Timestamp.now();
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);

      // Get tickets created today
      const tickets = await this.getTicketsForPeriod(dayStart);
      
      const metrics = {
        timestamp: now,
        period: 'daily',
        tickets: {
          total: tickets.length,
          byStatus: this.groupBy(tickets, 'status'),
          byPriority: this.groupBy(tickets, 'priority'),
          byType: this.groupBy(tickets, 'type')
        },
        responseTime: await this.calculateAverageResponseTime(tickets),
        resolutionTime: await this.calculateAverageResolutionTime(tickets),
        satisfaction: await this.calculateCustomerSatisfaction(tickets),
        agentPerformance: await this.calculateAgentPerformance(tickets)
      };

      await this.saveMetrics('support_metrics', metrics);
      return metrics;
    } catch (error) {
      console.error('Error recording support metrics:', error);
      throw error;
    }
  }

  static async recordShippingMetrics() {
    try {
      const now = Timestamp.now();
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);

      // Get shipments created today
      const shipments = await this.getShipmentsForPeriod(dayStart);
      
      const metrics = {
        timestamp: now,
        period: 'daily',
        shipments: {
          total: shipments.length,
          byStatus: this.groupBy(shipments, 'status'),
          byCarrier: this.groupBy(shipments, 'carrier'),
          byMethod: this.groupBy(shipments, 'method')
        },
        deliveryTime: await this.calculateAverageDeliveryTime(shipments),
        onTimeDelivery: await this.calculateOnTimeDeliveryRate(shipments),
        damages: await this.calculateDamageRate(shipments),
        returns: await this.calculateReturnRate(shipments)
      };

      await this.saveMetrics('shipping_metrics', metrics);
      return metrics;
    } catch (error) {
      console.error('Error recording shipping metrics:', error);
      throw error;
    }
  }

  static async recordQualityMetrics() {
    try {
      const now = Timestamp.now();
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);

      // Get inspections created today
      const inspections = await this.getInspectionsForPeriod(dayStart);
      
      const metrics = {
        timestamp: now,
        period: 'daily',
        inspections: {
          total: inspections.length,
          byType: this.groupBy(inspections, 'type'),
          byResult: this.groupBy(inspections, 'status')
        },
        qualityScores: await this.calculateQualityScores(inspections),
        authenticityRate: await this.calculateAuthenticityRate(inspections),
        damageRate: await this.calculateInspectionDamageRate(inspections),
        complianceRate: await this.calculateComplianceRate(inspections)
      };

      await this.saveMetrics('quality_metrics', metrics);
      return metrics;
    } catch (error) {
      console.error('Error recording quality metrics:', error);
      throw error;
    }
  }

  static async getMetricsDashboard(type, period = 'daily') {
    try {
      const metrics = await this.getMetricsForPeriod(type, period);
      return this.formatDashboardData(metrics, type);
    } catch (error) {
      console.error('Error getting metrics dashboard:', error);
      throw error;
    }
  }

  static async getPerformanceAlerts() {
    try {
      const alerts = [];
      
      // Check support metrics
      const supportMetrics = await this.getLatestMetrics('support_metrics');
      if (supportMetrics.responseTime > 30) { // 30 minutes threshold
        alerts.push({
          type: 'support',
          severity: 'high',
          message: 'High response time detected'
        });
      }

      // Check shipping metrics
      const shippingMetrics = await this.getLatestMetrics('shipping_metrics');
      if (shippingMetrics.onTimeDelivery < 0.95) { // 95% threshold
        alerts.push({
          type: 'shipping',
          severity: 'medium',
          message: 'On-time delivery rate below target'
        });
      }

      // Check quality metrics
      const qualityMetrics = await this.getLatestMetrics('quality_metrics');
      if (qualityMetrics.authenticityRate < 0.99) { // 99% threshold
        alerts.push({
          type: 'quality',
          severity: 'critical',
          message: 'Authenticity verification rate below threshold'
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error getting performance alerts:', error);
      throw error;
    }
  }

  // Helper methods
  static async saveMetrics(collection, metrics) {
    const docId = `${metrics.period}_${metrics.timestamp.seconds}`;
    await setDoc(doc(db, collection, docId), metrics);
  }

  static groupBy(items, key) {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  static async getTicketsForPeriod(startTime) {
    const ticketsRef = collection(db, 'support_tickets');
    const q = query(ticketsRef, where('createdAt', '>=', startTime));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async getShipmentsForPeriod(startTime) {
    const shipmentsRef = collection(db, 'shipments');
    const q = query(shipmentsRef, where('createdAt', '>=', startTime));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async getInspectionsForPeriod(startTime) {
    const inspectionsRef = collection(db, 'inspections');
    const q = query(inspectionsRef, where('createdAt', '>=', startTime));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async calculateAverageResponseTime(tickets) {
    if (tickets.length === 0) return 0;
    const totalTime = tickets.reduce((sum, ticket) => {
      if (!ticket.firstResponseTime) return sum;
      return sum + ticket.firstResponseTime;
    }, 0);
    return totalTime / tickets.length;
  }

  static async calculateAverageDeliveryTime(shipments) {
    if (shipments.length === 0) return 0;
    const deliveredShipments = shipments.filter(s => s.status === 'delivered');
    const totalTime = deliveredShipments.reduce((sum, shipment) => {
      return sum + (shipment.deliveredAt.seconds - shipment.createdAt.seconds);
    }, 0);
    return totalTime / deliveredShipments.length;
  }

  static async calculateQualityScores(inspections) {
    if (inspections.length === 0) return {};
    const scores = inspections.reduce((acc, inspection) => {
      Object.entries(inspection.criteria || {}).forEach(([criterion, score]) => {
        if (!acc[criterion]) acc[criterion] = [];
        acc[criterion].push(score);
      });
      return acc;
    }, {});

    return Object.entries(scores).reduce((acc, [criterion, scores]) => {
      acc[criterion] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return acc;
    }, {});
  }

  static formatDashboardData(metrics, type) {
    switch (type) {
      case this.METRIC_TYPES.SUPPORT:
        return {
          summary: {
            totalTickets: metrics.tickets.total,
            averageResponseTime: metrics.responseTime,
            satisfaction: metrics.satisfaction
          },
          charts: {
            ticketsByStatus: this.formatForChart(metrics.tickets.byStatus),
            ticketsByPriority: this.formatForChart(metrics.tickets.byPriority),
            responseTimeTrend: this.formatTrendData(metrics.responseTime)
          },
          tables: {
            agentPerformance: metrics.agentPerformance
          }
        };

      case this.METRIC_TYPES.SHIPPING:
        return {
          summary: {
            totalShipments: metrics.shipments.total,
            onTimeDelivery: metrics.onTimeDelivery,
            damageRate: metrics.damages
          },
          charts: {
            shipmentsByStatus: this.formatForChart(metrics.shipments.byStatus),
            shipmentsByCarrier: this.formatForChart(metrics.shipments.byCarrier),
            deliveryTimeTrend: this.formatTrendData(metrics.deliveryTime)
          },
          tables: {
            carrierPerformance: this.calculateCarrierPerformance(metrics)
          }
        };

      case this.METRIC_TYPES.QUALITY:
        return {
          summary: {
            totalInspections: metrics.inspections.total,
            averageQualityScore: this.calculateAverageQualityScore(metrics.qualityScores),
            authenticityRate: metrics.authenticityRate
          },
          charts: {
            inspectionsByType: this.formatForChart(metrics.inspections.byType),
            qualityScoresTrend: this.formatTrendData(metrics.qualityScores),
            authenticityTrend: this.formatTrendData(metrics.authenticityRate)
          },
          tables: {
            qualityByCategory: this.formatQualityScores(metrics.qualityScores)
          }
        };

      default:
        throw new Error(`Unknown metric type: ${type}`);
    }
  }

  static formatForChart(data) {
    return {
      labels: Object.keys(data),
      data: Object.values(data)
    };
  }

  static formatTrendData(data) {
    if (Array.isArray(data)) {
      return {
        labels: data.map((_, i) => `Day ${i + 1}`),
        data: data
      };
    }
    return {
      labels: ['Current'],
      data: [data]
    };
  }
}

export default ServiceMetrics;
