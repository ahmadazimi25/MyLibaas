// Mock response data
const mockResponses = {
  'https://api.idverification.com/verify': (data) => {
    if (data.idImage === 'invalid-id-image.jpg') {
      return Promise.reject(new Error('Identity verification failed'));
    }
    return Promise.resolve({
      data: {
        verified: true,
        score: 0.95,
        details: {
          documentValid: true,
          faceMatch: true,
          dataMatch: true
        }
      }
    });
  },
  'https://api.addressverification.com/verify': (data) => {
    if (data.street.includes('Invalid')) {
      return Promise.reject(new Error('Address verification failed'));
    }
    return Promise.resolve({
      data: {
        verified: true,
        standardized: {
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zipCode,
          country: data.country
        },
        details: {
          deliverable: true,
          addressExists: true
        }
      }
    });
  },
  'https://api.phoneverification.com/send': (data) => {
    if (data.phoneNumber.includes('invalid')) {
      return Promise.reject(new Error('Phone verification failed'));
    }
    return Promise.resolve({
      data: {
        verificationId: 'test-verification-id',
        expiresIn: 300
      }
    });
  },
  'https://api.phoneverification.com/verify': (data) => {
    if (data.code !== '123456') {
      return Promise.reject(new Error('Invalid verification code'));
    }
    return Promise.resolve({
      data: {
        verified: true,
        phoneNumber: data.phoneNumber
      }
    });
  }
};

// Mock axios
const mockAxios = {
  post: jest.fn((url, data) => {
    const handler = mockResponses[url];
    if (!handler) {
      return Promise.reject(new Error('Unknown API endpoint'));
    }
    return handler(data);
  }),
  get: jest.fn(() => {
    return Promise.reject(new Error('GET method not implemented'));
  })
};

jest.mock('axios', () => mockAxios);

export default mockAxios;
