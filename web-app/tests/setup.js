// Jest setup file
import { mockFirestore, mockAuth, mockStorage } from './mocks/firebaseMock';

// Increase timeout for async operations
jest.setTimeout(30000);

// Mock Firebase config
const mockFirebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-auth-domain',
  projectId: 'test-project-id',
  storageBucket: 'test-storage-bucket',
  messagingSenderId: 'test-messaging-sender-id',
  appId: 'test-app-id'
};

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({
    firestore: () => mockFirestore,
    auth: () => mockAuth,
    storage: () => mockStorage
  })),
  firestore: () => mockFirestore,
  auth: () => mockAuth,
  storage: () => mockStorage
}));

jest.mock('../src/services/firebase/firebaseConfig', () => ({
  db: mockFirestore,
  auth: mockAuth,
  storage: mockStorage,
  firebase: {
    initializeApp: jest.fn(() => ({
      firestore: () => mockFirestore,
      auth: () => mockAuth,
      storage: () => mockStorage
    }))
  }
}));

// Mock environment variables
process.env.REACT_APP_ID_VERIFICATION_API_KEY = 'test-id-key';
process.env.REACT_APP_ADDRESS_VERIFICATION_API_KEY = 'test-address-key';
process.env.REACT_APP_PHONE_VERIFICATION_API_KEY = 'test-phone-key';

// Import axios mock
import './mocks/axiosMock';

// Mock Notification Service
jest.mock('../src/services/NotificationService');

// Global test setup
beforeAll(() => {
  // Initialize test environment
  process.env.NODE_ENV = 'test';
  
  // Clear mock data store
  mockFirestore.clearMockData();
});

// Global test teardown
afterAll(() => {
  // Clear mock data store
  mockFirestore.clearMockData();
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  clearMockData: () => mockFirestore.clearMockData(),
  createMockTicket: (data) => ({
    id: `TICKET_${Date.now()}`,
    status: 'open',
    createdAt: new Date(),
    ...data
  }),
  createMockShipment: (data) => ({
    id: `SHIP_${Date.now()}`,
    status: 'pending',
    createdAt: new Date(),
    ...data
  }),
  createMockInspection: (data) => ({
    id: `INSP_${Date.now()}`,
    status: 'in_progress',
    createdAt: new Date(),
    ...data
  })
};
