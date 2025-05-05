import { jest } from '@jest/globals';
import { db } from '../../../src/services/firebase/firebaseConfig';
import SupportService from '../../../src/services/support/SupportService';
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
        userId: 'user123',
        subject: 'Test Ticket',
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

describe('SupportService Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTicketData = {
    userId: 'user123',
    subject: 'Payment Issue',
    description: 'Unable to process payment',
    priority: 'high'
  };

  describe('createTicket', () => {
    it('should create a support ticket', async () => {
      const result = await SupportService.createTicket(mockTicketData);

      expect(result).toBeDefined();
      expect(result.userId).toBe(mockTicketData.userId);
      expect(result.subject).toBe(mockTicketData.subject);
      expect(mockFirebaseSetDoc).toHaveBeenCalled();
      expect(mockSendNotification).toHaveBeenCalled();
    });
  });

  describe('updateTicketStatus', () => {
    it('should update ticket status', async () => {
      const ticketId = 'TICKET_123';
      const newStatus = 'in_progress';
      const notes = 'Working on the issue';

      const result = await SupportService.updateTicketStatus(ticketId, newStatus, notes);

      expect(result).toBe(true);
      expect(mockFirebaseSetDoc).toHaveBeenCalled();
      expect(mockSendNotification).toHaveBeenCalled();
    });
  });

  describe('addMessage', () => {
    it('should add message to ticket', async () => {
      const ticketId = 'TICKET_123';
      const message = {
        content: 'Test message',
        sender: 'user123'
      };

      const result = await SupportService.addMessage(ticketId, message);

      expect(result).toBeDefined();
      expect(result.content).toBe(message.content);
      expect(result.sender).toBe(message.sender);
      expect(mockFirebaseSetDoc).toHaveBeenCalled();
      expect(mockSendNotification).toHaveBeenCalled();
    });
  });

  describe('resolveTicket', () => {
    it('should resolve ticket', async () => {
      const ticketId = 'TICKET_123';
      const resolution = 'Issue has been resolved';

      const result = await SupportService.resolveTicket(ticketId, resolution);

      expect(result).toBe(true);
      expect(mockFirebaseSetDoc).toHaveBeenCalled();
      expect(mockSendNotification).toHaveBeenCalled();
    });
  });

  describe('validateTicketData', () => {
    it('should validate ticket data', () => {
      const result = SupportService.validateTicketData(mockTicketData);
      expect(result).toBe(true);
    });

    it('should reject invalid ticket data', () => {
      const invalidData = { ...mockTicketData, priority: 'invalid_priority' };
      expect(() => SupportService.validateTicketData(invalidData)).toThrow();
    });
  });
});
