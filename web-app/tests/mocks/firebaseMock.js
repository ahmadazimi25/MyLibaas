// Mock data store
const mockDataStore = new Map();

// Mock Firestore functionality
const mockFirestore = {
  collection: jest.fn((collectionName) => ({
    doc: jest.fn((docId) => ({
      get: jest.fn(() => Promise.resolve({
        exists: mockDataStore.has(`${collectionName}/${docId}`),
        data: () => mockDataStore.get(`${collectionName}/${docId}`) || {},
        id: docId,
      })),
      set: jest.fn((data) => {
        mockDataStore.set(`${collectionName}/${docId}`, { ...data });
        return Promise.resolve();
      }),
      update: jest.fn((data) => {
        const existingData = mockDataStore.get(`${collectionName}/${docId}`) || {};
        mockDataStore.set(`${collectionName}/${docId}`, { ...existingData, ...data });
        return Promise.resolve();
      }),
      delete: jest.fn(() => {
        mockDataStore.delete(`${collectionName}/${docId}`);
        return Promise.resolve();
      }),
    })),
    add: jest.fn((data) => {
      const docId = `mock-doc-${Date.now()}`;
      mockDataStore.set(`${collectionName}/${docId}`, { ...data });
      return Promise.resolve({
        id: docId,
        get: () => Promise.resolve({
          exists: true,
          data: () => mockDataStore.get(`${collectionName}/${docId}`),
        }),
      });
    }),
    get: jest.fn(() => Promise.resolve({
      docs: Array.from(mockDataStore.entries())
        .filter(([key]) => key.startsWith(`${collectionName}/`))
        .map(([key, value]) => ({
          id: key.split('/')[1],
          data: () => value,
          exists: true,
          ref: {
            id: key.split('/')[1],
            collection: () => mockFirestore.collection(collectionName),
            delete: () => Promise.resolve(),
          }
        })),
      forEach: jest.fn(),
      empty: false,
      size: mockDataStore.size,
    })),
    where: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(() => Promise.resolve({
        docs: Array.from(mockDataStore.entries())
          .filter(([key]) => key.startsWith(`${collectionName}/`))
          .map(([key, value]) => ({
            id: key.split('/')[1],
            data: () => value,
            exists: true,
            ref: {
              id: key.split('/')[1],
              collection: () => mockFirestore.collection(collectionName),
              delete: () => Promise.resolve(),
            }
          })),
        forEach: jest.fn(),
        empty: false,
        size: mockDataStore.size,
      })),
    })),
    orderBy: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        docs: Array.from(mockDataStore.entries())
          .filter(([key]) => key.startsWith(`${collectionName}/`))
          .map(([key, value]) => ({
            id: key.split('/')[1],
            data: () => value,
            exists: true,
            ref: {
              id: key.split('/')[1],
              collection: () => mockFirestore.collection(collectionName),
              delete: () => Promise.resolve(),
            }
          })),
        forEach: jest.fn(),
        empty: false,
        size: mockDataStore.size,
      })),
    })),
  })),
  batch: jest.fn(() => ({
    set: jest.fn((ref, data) => {
      const [collection, docId] = ref.id.split('/');
      mockDataStore.set(`${collection}/${docId}`, data);
    }),
    update: jest.fn((ref, data) => {
      const [collection, docId] = ref.id.split('/');
      const existingData = mockDataStore.get(`${collection}/${docId}`) || {};
      mockDataStore.set(`${collection}/${docId}`, { ...existingData, ...data });
    }),
    delete: jest.fn((ref) => {
      const [collection, docId] = ref.id.split('/');
      mockDataStore.delete(`${collection}/${docId}`);
    }),
    commit: jest.fn(() => Promise.resolve()),
  })),
  clearMockData: () => mockDataStore.clear(),
};

// Mock Auth functionality
const mockAuth = {
  currentUser: {
    uid: 'mock-user-id',
    email: 'test@example.com',
  },
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn(),
};

// Mock Storage functionality
const mockStorage = {
  ref: jest.fn((path) => ({
    child: jest.fn((childPath) => ({
      put: jest.fn(() => Promise.resolve({
        ref: {
          getDownloadURL: jest.fn(() => Promise.resolve(`https://mock-storage.com/${path}/${childPath}`)),
        },
      })),
      getDownloadURL: jest.fn(() => Promise.resolve(`https://mock-storage.com/${path}/${childPath}`)),
    })),
    put: jest.fn((file) => Promise.resolve({
      ref: {
        getDownloadURL: jest.fn(() => Promise.resolve(`https://mock-storage.com/${path}/${file.name}`)),
      },
    })),
  })),
};

// Mock Firebase app
const mockFirebase = {
  initializeApp: jest.fn(),
  firestore: () => mockFirestore,
  auth: () => mockAuth,
  storage: () => mockStorage,
};

jest.mock('firebase/app', () => mockFirebase);
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestore),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => mockStorage),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Export all mocks
export { mockFirestore, mockAuth, mockStorage, mockFirebase };
