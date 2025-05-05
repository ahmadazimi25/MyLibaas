import VerificationService from '../../../src/services/security/VerificationService';
import { db } from '../../../src/services/firebase/firebaseConfig';
import { mockUser, mockAddress, mockPhone } from '../../mocks/userMocks';

describe('VerificationService Integration Tests', () => {
  beforeEach(async () => {
    // Clear test data
    await clearTestData();
  });

  describe('ID Verification', () => {
    test('should successfully verify valid ID', async () => {
      const userData = {
        ...mockUser,
        idImage: 'valid-id-image.jpg'
      };

      const result = await VerificationService.verifyIdentity(userData);

      expect(result.verified).toBe(true);
      expect(result.score).toBeGreaterThan(0.8);
      expect(result.details).toBeDefined();
    });

    test('should reject invalid ID', async () => {
      const userData = {
        ...mockUser,
        idImage: 'invalid-id-image.jpg'
      };

      await expect(VerificationService.verifyIdentity(userData))
        .rejects.toThrow('Identity verification failed');
    });
  });

  describe('Address Verification', () => {
    test('should verify valid address', async () => {
      const result = await VerificationService.verifyAddress(mockAddress);

      expect(result.verified).toBe(true);
      expect(result.standardized).toBeDefined();
    });

    test('should reject invalid address', async () => {
      const invalidAddress = {
        ...mockAddress,
        street: 'Invalid Street 123###'
      };

      await expect(VerificationService.verifyAddress(invalidAddress))
        .rejects.toThrow('Address verification failed');
    });
  });

  describe('Phone Verification', () => {
    test('should initiate phone verification', async () => {
      const result = await VerificationService.verifyPhone(mockPhone);

      expect(result.verificationId).toBeDefined();
      expect(result.expiresIn).toBeGreaterThan(0);
    });

    test('should confirm valid verification code', async () => {
      const initResult = await VerificationService.verifyPhone(mockPhone);
      const result = await VerificationService.confirmPhoneVerification({
        verificationId: initResult.verificationId,
        code: '123456',
        userId: mockPhone.userId,
        phoneNumber: mockPhone.phoneNumber
      });

      expect(result.verified).toBe(true);
      expect(result.phoneNumber).toBe(mockPhone.phoneNumber);
    });
  });

  describe('Verification Status', () => {
    test('should track verification status correctly', async () => {
      // Complete all verifications
      await VerificationService.verifyIdentity(mockUser);
      await VerificationService.verifyAddress(mockAddress);
      const phoneInit = await VerificationService.verifyPhone(mockPhone);
      await VerificationService.confirmPhoneVerification({
        verificationId: phoneInit.verificationId,
        code: '123456',
        userId: mockPhone.userId,
        phoneNumber: mockPhone.phoneNumber
      });

      const status = await VerificationService.getVerificationStatus(mockUser.userId);

      expect(status.id.verified).toBe(true);
      expect(status.address.verified).toBe(true);
      expect(status.phone_completed.verified).toBe(true);
    });

    test('should correctly identify fully verified users', async () => {
      // Complete all verifications
      await VerificationService.verifyIdentity(mockUser);
      await VerificationService.verifyAddress(mockAddress);
      const phoneInit = await VerificationService.verifyPhone(mockPhone);
      await VerificationService.confirmPhoneVerification({
        verificationId: phoneInit.verificationId,
        code: '123456',
        userId: mockPhone.userId,
        phoneNumber: mockPhone.phoneNumber
      });

      const isVerified = await VerificationService.isFullyVerified(mockUser.userId);
      expect(isVerified).toBe(true);
    });
  });
});

async function clearTestData() {
  const collections = ['verifications'];
  await Promise.all(
    collections.map(async collection => {
      const snapshot = await db.collection(collection).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    })
  );
}
