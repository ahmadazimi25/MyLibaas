import { db } from './firebase/firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuth, PhoneAuthProvider, updatePhoneNumber } from 'firebase/auth';
import SMSService from './SMSService';
import { generateSecureCode } from '../utils/security';

class PhoneVerificationService {
  static async startVerification(phoneNumber) {
    try {
      // Generate verification code
      const verificationCode = generateSecureCode(6);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be logged in');
      }

      // Store verification attempt
      const verificationId = `phone_verify_${Date.now()}`;
      await setDoc(doc(db, 'phoneVerifications', verificationId), {
        userId: user.uid,
        phoneNumber,
        code: verificationCode,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt),
        attempts: 0,
        status: 'pending'
      });

      // Send verification SMS
      await SMSService.sendSMS(
        phoneNumber,
        'verification_code',
        { verificationCode }
      );

      return {
        verificationId,
        expiresAt,
        message: 'Verification code sent successfully'
      };
    } catch (error) {
      console.error('Error starting phone verification:', error);
      throw error;
    }
  }

  static async verifyCode(verificationId, code) {
    try {
      const verificationRef = doc(db, 'phoneVerifications', verificationId);
      const verificationDoc = await getDoc(verificationRef);

      if (!verificationDoc.exists()) {
        throw new Error('Invalid verification attempt');
      }

      const verificationData = verificationDoc.data();
      
      // Check expiration
      if (new Date() > verificationData.expiresAt.toDate()) {
        throw new Error('Verification code has expired');
      }

      // Check attempts
      if (verificationData.attempts >= 3) {
        throw new Error('Too many attempts. Please request a new code');
      }

      // Verify code
      if (verificationData.code !== code) {
        await updateDoc(verificationRef, {
          attempts: verificationData.attempts + 1
        });
        throw new Error('Invalid verification code');
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be logged in');
      }

      // Update user's phone number in Auth
      const provider = new PhoneAuthProvider(auth);
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await updatePhoneNumber(user, credential);

      // Update user document
      await updateDoc(doc(db, 'users', user.uid), {
        phoneNumber: verificationData.phoneNumber,
        phoneVerified: true,
        phoneVerifiedAt: Timestamp.now()
      });

      // Update verification status
      await updateDoc(verificationRef, {
        status: 'verified',
        verifiedAt: Timestamp.now()
      });

      // Send confirmation SMS
      await SMSService.sendSMS(
        verificationData.phoneNumber,
        'verification_success',
        {
          username: (await getDoc(doc(db, 'users', user.uid))).data().username
        }
      );

      return {
        success: true,
        message: 'Phone number verified successfully'
      };
    } catch (error) {
      console.error('Error verifying phone:', error);
      throw error;
    }
  }

  static async resendVerificationCode(verificationId) {
    try {
      const verificationRef = doc(db, 'phoneVerifications', verificationId);
      const verificationDoc = await getDoc(verificationRef);

      if (!verificationDoc.exists()) {
        throw new Error('Invalid verification attempt');
      }

      const verificationData = verificationDoc.data();

      // Generate new code
      const newCode = generateSecureCode(6);
      const newExpiresAt = new Date();
      newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 10);

      // Update verification document
      await updateDoc(verificationRef, {
        code: newCode,
        expiresAt: Timestamp.fromDate(newExpiresAt),
        attempts: 0,
        updatedAt: Timestamp.now()
      });

      // Send new code
      await SMSService.sendSMS(
        verificationData.phoneNumber,
        'verification_code',
        { verificationCode: newCode }
      );

      return {
        success: true,
        expiresAt: newExpiresAt,
        message: 'New verification code sent successfully'
      };
    } catch (error) {
      console.error('Error resending verification code:', error);
      throw error;
    }
  }

  static async checkVerificationStatus(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();

      return {
        phoneNumber: userData.phoneNumber || null,
        isVerified: userData.phoneVerified || false,
        verifiedAt: userData.phoneVerifiedAt?.toDate() || null
      };
    } catch (error) {
      console.error('Error checking verification status:', error);
      throw error;
    }
  }
}

export default PhoneVerificationService;
