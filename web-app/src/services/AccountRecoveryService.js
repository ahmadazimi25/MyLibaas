import { db } from './firebase/firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuth, updatePassword, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import NotificationService from './NotificationService';
import SMSService from './SMSService';
import { generateSecureCode } from '../utils/security';

class AccountRecoveryService {
  static RECOVERY_TYPES = {
    EMAIL: 'email',
    PHONE: 'phone',
    TWO_FACTOR: 'two_factor'
  };

  static async initiateRecovery(identifier, type) {
    try {
      // Generate recovery code
      const recoveryCode = generateSecureCode(6);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

      // Store recovery attempt
      const recoveryId = `recovery_${Date.now()}`;
      await setDoc(doc(db, 'recoveryAttempts', recoveryId), {
        identifier,
        type,
        code: recoveryCode,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt),
        attempts: 0,
        status: 'pending'
      });

      // Send recovery code based on type
      if (type === this.RECOVERY_TYPES.EMAIL) {
        await NotificationService.sendEmail(
          identifier,
          'account-recovery',
          {
            recoveryCode,
            recoveryLink: `${window.location.origin}/recover?code=${recoveryCode}&id=${recoveryId}`
          }
        );
      } else if (type === this.RECOVERY_TYPES.PHONE) {
        await SMSService.sendSMS(
          identifier,
          'account_recovery',
          { recoveryCode }
        );
      }

      return {
        recoveryId,
        expiresAt,
        message: `Recovery code sent to ${type === this.RECOVERY_TYPES.EMAIL ? 'email' : 'phone'}`
      };
    } catch (error) {
      console.error('Error initiating recovery:', error);
      throw error;
    }
  }

  static async verifyRecoveryCode(recoveryId, code) {
    try {
      const recoveryRef = doc(db, 'recoveryAttempts', recoveryId);
      const recoveryDoc = await getDoc(recoveryRef);

      if (!recoveryDoc.exists()) {
        throw new Error('Invalid recovery attempt');
      }

      const recoveryData = recoveryDoc.data();
      
      // Check expiration
      if (new Date() > recoveryData.expiresAt.toDate()) {
        throw new Error('Recovery code has expired');
      }

      // Check attempts
      if (recoveryData.attempts >= 3) {
        throw new Error('Too many attempts. Please request a new code');
      }

      // Verify code
      if (recoveryData.code !== code) {
        await updateDoc(recoveryRef, {
          attempts: recoveryData.attempts + 1
        });
        throw new Error('Invalid recovery code');
      }

      // Mark as verified
      await updateDoc(recoveryRef, {
        status: 'verified',
        verifiedAt: Timestamp.now()
      });

      return {
        success: true,
        userId: recoveryData.userId
      };
    } catch (error) {
      console.error('Error verifying recovery code:', error);
      throw error;
    }
  }

  static async resetPassword(recoveryId, newPassword) {
    try {
      const recoveryRef = doc(db, 'recoveryAttempts', recoveryId);
      const recoveryDoc = await getDoc(recoveryRef);

      if (!recoveryDoc.exists() || recoveryDoc.data().status !== 'verified') {
        throw new Error('Invalid recovery attempt');
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // Update password in Firebase Auth
        await updatePassword(user, newPassword);

        // Log password change
        await setDoc(doc(db, 'securityLogs', `pwd_${Date.now()}`), {
          userId: user.uid,
          type: 'password_reset',
          timestamp: Timestamp.now(),
          metadata: {
            recoveryId,
            method: recoveryDoc.data().type
          }
        });

        // Send confirmation
        await NotificationService.sendEmail(
          user.email,
          'password-changed',
          {
            timestamp: new Date().toISOString()
          }
        );

        return {
          success: true,
          message: 'Password reset successfully'
        };
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  static async verifySecurityQuestions(userId, answers) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const securityQuestions = userData.securityQuestions || [];

      // Verify each answer
      const allCorrect = answers.every((answer, index) => {
        return securityQuestions[index]?.answer === answer;
      });

      if (!allCorrect) {
        throw new Error('Incorrect security answers');
      }

      return {
        success: true,
        message: 'Security questions verified successfully'
      };
    } catch (error) {
      console.error('Error verifying security questions:', error);
      throw error;
    }
  }

  static async initiateEmergencyRecovery(userId, reason) {
    try {
      // Create emergency recovery request
      const requestId = `emergency_${Date.now()}`;
      await setDoc(doc(db, 'emergencyRecovery', requestId), {
        userId,
        reason,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      // Notify support team
      await NotificationService.notifyAdmins(
        'EMERGENCY_RECOVERY',
        {
          userId,
          reason,
          requestId
        },
        'urgent'
      );

      return {
        requestId,
        message: 'Emergency recovery request submitted'
      };
    } catch (error) {
      console.error('Error initiating emergency recovery:', error);
      throw error;
    }
  }
}

export default AccountRecoveryService;
