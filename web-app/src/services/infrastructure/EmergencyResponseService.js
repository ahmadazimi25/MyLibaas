import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, Timestamp, getDocs, query, where } from 'firebase/firestore';
import NotificationService from '../NotificationService';

class EmergencyResponseService {
  // Static constants
  static INCIDENT_TYPES = {
    SECURITY_BREACH: 'security_breach',
    SYSTEM_OUTAGE: 'system_outage',
    DATA_LOSS: 'data_loss',
    PERFORMANCE_DEGRADATION: 'performance_degradation'
  };

  static SEVERITY_LEVELS = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  };

  static RESPONSE_TEAMS = {
    SECURITY: 'security_team',
    INFRASTRUCTURE: 'infrastructure_team',
    DATABASE: 'database_team',
    OPERATIONS: 'operations_team'
  };

  static RESPONSE_STATUS = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
  };

  static async reportIncident(incidentData) {
    try {
      const { type, severity, description, affectedUsers, affectedServices, reporter } = incidentData;

      // Validate incident data
      if (!type || !severity || !description) {
        throw new Error('Missing required incident data');
      }

      // Create incident record
      const incidentId = `INC_${Date.now()}`;
      const incident = {
        id: incidentId,
        type,
        severity,
        description,
        affectedUsers: affectedUsers || [],
        affectedServices: affectedServices || [],
        reporter,
        status: this.RESPONSE_STATUS.OPEN,
        timeline: [{
          action: 'incident_reported',
          timestamp: Timestamp.now(),
          details: description
        }],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Store incident in Firestore
      await setDoc(doc(db, 'incidents', incidentId), incident);

      // Create and store response plan
      const responsePlan = await this.createResponsePlan(incident);
      await setDoc(doc(db, 'response_plans', incidentId), responsePlan);

      // Initiate emergency response
      await this.initiateEmergencyResponse(incidentId);

      return { incident, responsePlan };
    } catch (error) {
      console.error('Failed to report incident:', error);
      throw new Error('Failed to report incident');
    }
  }

  static async createResponsePlan(incident) {
    try {
      const plan = {
        id: incident.id,
        incidentId: incident.id,
        type: incident.type,
        severity: incident.severity,
        steps: this.generateResponseSteps(incident),
        assignedTeam: this.determineResponseTeam(incident),
        status: this.RESPONSE_STATUS.OPEN,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      return plan;
    } catch (error) {
      console.error('Failed to create response plan:', error);
      throw new Error('Failed to create response plan');
    }
  }

  static async initiateEmergencyResponse(incidentId) {
    try {
      const incidentDoc = await getDoc(doc(db, 'incidents', incidentId));
      const incident = incidentDoc.data();

      if (!incident) {
        throw new Error('Incident not found');
      }

      // Update incident status
      await setDoc(doc(db, 'incidents', incidentId), {
        status: this.RESPONSE_STATUS.IN_PROGRESS,
        updatedAt: Timestamp.now()
      }, { merge: true });

      // Notify response team
      await this.notifyResponseTeam(incident);

      return true;
    } catch (error) {
      console.error('Failed to initiate emergency response:', error);
      throw new Error('Failed to initiate emergency response');
    }
  }

  static async notifyResponseTeam(incident) {
    try {
      const team = this.determineResponseTeam(incident);
      const notification = {
        type: 'emergency_response',
        severity: incident.severity,
        message: `New ${incident.severity} incident reported: ${incident.description}`,
        team,
        incidentId: incident.id,
        timestamp: Timestamp.now()
      };

      await NotificationService.sendNotification(notification);
      return true;
    } catch (error) {
      console.error('Failed to notify response team:', error);
      throw new Error('Failed to notify response team');
    }
  }

  static determineResponseTeam(incident) {
    switch (incident.type) {
      case this.INCIDENT_TYPES.SECURITY_BREACH:
        return this.RESPONSE_TEAMS.SECURITY;
      case this.INCIDENT_TYPES.SYSTEM_OUTAGE:
        return this.RESPONSE_TEAMS.INFRASTRUCTURE;
      case this.INCIDENT_TYPES.DATA_LOSS:
        return this.RESPONSE_TEAMS.DATABASE;
      default:
        return this.RESPONSE_TEAMS.OPERATIONS;
    }
  }

  static generateResponseSteps(incident) {
    const steps = [];
    
    // Common initial steps
    steps.push({
      order: 1,
      action: 'Assess incident severity and impact',
      status: 'pending',
      assignedTo: this.determineResponseTeam(incident)
    });

    // Type-specific steps
    switch (incident.type) {
      case this.INCIDENT_TYPES.SECURITY_BREACH:
        steps.push(
          {
            order: 2,
            action: 'Isolate affected systems',
            status: 'pending',
            assignedTo: this.RESPONSE_TEAMS.SECURITY
          },
          {
            order: 3,
            action: 'Investigate breach vector',
            status: 'pending',
            assignedTo: this.RESPONSE_TEAMS.SECURITY
          }
        );
        break;
      case this.INCIDENT_TYPES.SYSTEM_OUTAGE:
        steps.push(
          {
            order: 2,
            action: 'Check system health metrics',
            status: 'pending',
            assignedTo: this.RESPONSE_TEAMS.INFRASTRUCTURE
          },
          {
            order: 3,
            action: 'Restore critical services',
            status: 'pending',
            assignedTo: this.RESPONSE_TEAMS.INFRASTRUCTURE
          }
        );
        break;
      // Add more cases for other incident types
    }

    // Common final steps
    steps.push({
      order: steps.length + 1,
      action: 'Document incident resolution',
      status: 'pending',
      assignedTo: this.determineResponseTeam(incident)
    });

    return steps;
  }

  static async generateIncidentReport(incidentId) {
    try {
      const incidentDoc = await getDoc(doc(db, 'incidents', incidentId));
      const incident = incidentDoc.data();

      if (!incident) {
        throw new Error('Incident not found');
      }

      const planDoc = await getDoc(doc(db, 'response_plans', incidentId));
      const plan = planDoc.data();

      const report = {
        id: `REP_${incidentId}`,
        incidentId,
        summary: {
          type: incident.type,
          severity: incident.severity,
          status: incident.status,
          duration: this.calculateIncidentDuration(incident),
          affectedUsers: incident.affectedUsers.length,
          affectedServices: incident.affectedServices
        },
        timeline: incident.timeline,
        responsePlan: plan,
        recommendations: this.generateRecommendations(incident, plan),
        generatedAt: Timestamp.now()
      };

      await setDoc(doc(db, 'incident_reports', report.id), report);
      return report;
    } catch (error) {
      console.error('Failed to generate incident report:', error);
      throw new Error('Failed to generate incident report');
    }
  }

  static calculateIncidentDuration(incident) {
    const start = incident.createdAt.toDate();
    const end = incident.status === this.RESPONSE_STATUS.RESOLVED ? 
      incident.updatedAt.toDate() : new Date();
    return Math.round((end - start) / 1000 / 60); // Duration in minutes
  }

  static generateRecommendations(incident, plan) {
    const recommendations = [];

    // Analyze incident type and severity
    if (incident.severity === this.SEVERITY_LEVELS.CRITICAL || 
        incident.severity === this.SEVERITY_LEVELS.HIGH) {
      recommendations.push({
        type: 'preventive',
        action: 'Review and update emergency response procedures',
        priority: 'high'
      });
    }

    // Analyze affected services
    if (incident.affectedServices.length > 1) {
      recommendations.push({
        type: 'infrastructure',
        action: 'Implement better service isolation',
        priority: 'medium'
      });
    }

    // Analyze response time
    const responseTime = this.calculateIncidentDuration(incident);
    if (responseTime > 60) { // More than 1 hour
      recommendations.push({
        type: 'process',
        action: 'Improve incident detection and response time',
        priority: 'high'
      });
    }

    return recommendations;
  }
}

export default EmergencyResponseService;
