export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '+1234567890',
  idImage: 'test-id-image.jpg'
};

export const mockAddress = {
  street: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345',
  country: 'Test Country'
};

export const mockPhone = {
  userId: mockUser.id,
  phoneNumber: mockUser.phoneNumber,
  verified: false
};
