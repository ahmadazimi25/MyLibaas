import { jest } from '@jest/globals';
import { db } from '../../../src/services/firebase/firebaseConfig';
import EmergencyResponseService from '../../../src/services/infrastructure/EmergencyResponseService';
import NotificationService from '../../../src/services/NotificationService';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Mock Firebase functions
const mockFirebaseDoc = jest.fn();
const mockFirebaseSetDoc = jest.fn();
const mockFirebaseGetDoc = jest.fn();
const mockFirebaseCollection = jest.fn();
const mockFirebaseQuery = jest.fn();
const mockFirebaseWhere = jest.fn();
const mockFirebaseGetDocs = jest.fn();

// Mock Timestamp
const mockTimestamp = {
  now: () => ({ toDate: () => new Date() })
};

jest.mock('firebase/firestore', () => ({
  doc: (...args) => {
    mockFirebaseDoc(...args);
    return { id: 'mock-doc-id' };
  },
  setDoc: (...args) => {
    mockFirebaseSetDoc(...args);
    return Promise.resolve();
  },
  getDoc: (...args) => {
    mockFirebaseGetDoc(...args);
    return Promise.resolve({
      exists: () => true,
      data: () => ({
        id: 'mock-doc-id',
        type: 'security_breach',
        severity: 'high',
        status: 'open'
      })
    });
  },
  collection: (...args) => {
    mockFirebaseCollection(...args);
    return { id: 'mock-collection-id' };
  },
  query: (...args) => {
    mockFirebaseQuery(...args);
    return { id: 'mock-query-id' };
  },
  where: (...args) => {
    mockFirebaseWhere(...args);
    return { id: 'mock-where-id' };
  },
  getDocs: (...args) => {
    mockFirebaseGetDocs(...args);
    return Promise.resolve({
      docs: []
    });
  },
  Timestamp: mockTimestamp
}));

// Mock NotificationService
const mockSendNotification = jest.fn();
jest.mock('../../../src/services/NotificationService', () => ({
  __esModule: true,
  default: {
    sendNotification: (...args) => {
      mockSendNotification(...args);
      return Promise.resolve();
    }
  }
}));

describe('EmergencyResponseService Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockIncidentData = {
    type: 'security_breach',
    severity: 'high',
    description: 'Security breach detected',
    affectedUsers: ['user123'],
    affectedServices: ['auth'],
    reporter: 'admin123'
  };

  describe('reportIncident', () => {
    it('should report an incident', async () => {
      const result = await EmergencyResponseService.reportIncident(mockIncidentData);

      expect(result).toBeDefined();
      expect(result.type).toBe(mockIncidentData.type);
      expect(result.severity).toBe(mockIncidentData.severity);
      expect(mockFirebaseSetDoc).toHaveBeenCalled();
      expect(mockSendNotification).toHaveBeenCalled();
    });
  });

  describe('initiateEmergencyResponse', () => {
    it('should initiate emergency response', async () => {
      const incidentId = 'INC_123';

      const result = await EmergencyResponseService.initiateEmergencyResponse(incidentId);

      expect(result).toBeDefined();
      expect(result.status).toBe('in_progress');
      expect(mockFirebaseSetDoc).toHaveBeenCalled();
      expect(mockSendNotification).toHaveBeenCalled();
    });
  });

  describe('updateIncidentStatus', () => {
    it('should update incident status', async () => {
      const incidentId = 'INC_123';
      const newStatus = 'resolved';
      const notes = 'Incident resolved';

      const result = await EmergencyResponseService.updateIncidentStatus(incidentId, newStatus, notes);

      expect(result).toBe(true);
      expect(mockFirebaseSetDoc).toHaveBeenCalled();
      expect(mockSendNotification).toHaveBeenCalled();
    });
  });

  describe('validateIncidentData', () => {
    it('should validate incident data', () => {
      const result = EmergencyResponseService.validateIncidentData(mockIncidentData);
      expect(result).toBe(true);
    });

    it('should reject invalid incident data', () => {
      const invalidData = { ...mockIncidentData, type: 'invalid_type' };
      expect(() => EmergencyResponseService.validateIncidentData(invalidData)).toThrow();
    });
  });

  describe('generateResponsePlan', () => {
    it('should generate response plan', async () => {
      const incidentId = 'INC_123';

      const result = await EmergencyResponseService.generateResponsePlan(incidentId);

      expect(result).toBeDefined();
      expect(result.steps).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(mockFirebaseGetDoc).toHaveBeenCalled();
    });
  });
});
