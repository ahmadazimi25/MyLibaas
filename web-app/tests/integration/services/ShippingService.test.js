import { jest } from '@jest/globals';
import { db } from '../../../src/services/firebase/firebaseConfig';
import ShippingService from '../../../src/services/logistics/ShippingService';
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
      data: () => ({ id: 'mock-doc-id' })
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

describe('ShippingService Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockShipmentData = {
    rentalId: 'RENTAL_123',
    from: {
      street: '123 Sender St',
      city: 'SenderCity',
      state: 'SS',
      zip: '12345'
    },
    to: {
      street: '456 Receiver St',
      city: 'ReceiverCity',
      state: 'RS',
      zip: '67890'
    },
    items: [
      { id: 'ITEM_1', name: 'Dress', quantity: 1 },
      { id: 'ITEM_2', name: 'Shoes', quantity: 1 }
    ],
    method: 'standard',
    carrier: 'fedex'
  };

  describe('createShipment', () => {
    it('should create a shipment', async () => {
      const result = await ShippingService.createShipment(mockShipmentData);

      expect(result).toBeDefined();
      expect(result.rentalId).toBe(mockShipmentData.rentalId);
      expect(mockFirebaseSetDoc).toHaveBeenCalled();
      expect(mockSendNotification).toHaveBeenCalled();
    });
  });

  describe('updateShipmentStatus', () => {
    it('should update shipment status', async () => {
      const shipmentId = 'SHIP_123';
      const newStatus = 'in_transit';
      const trackingInfo = { trackingNumber: 'TRK123', carrier: 'fedex' };

      const result = await ShippingService.updateShipmentStatus(shipmentId, newStatus, trackingInfo);

      expect(result).toBe(true);
      expect(mockFirebaseSetDoc).toHaveBeenCalled();
      expect(mockSendNotification).toHaveBeenCalled();
    });
  });

  describe('validateAddress', () => {
    it('should validate address', async () => {
      const address = {
        street: '123 Test St',
        city: 'TestCity',
        state: 'TS',
        zip: '12345'
      };

      const result = await ShippingService.validateAddress(address);

      expect(result).toBe(true);
    });
  });

  describe('generateLabel', () => {
    it('should generate shipping label', async () => {
      const shipmentId = 'SHIP_123';

      const result = await ShippingService.generateLabel(shipmentId);

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(mockFirebaseGetDoc).toHaveBeenCalled();
    });
  });
});
