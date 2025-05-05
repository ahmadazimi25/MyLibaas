import { db } from './firebase/firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { functions } from './firebase/firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import NotificationService from './NotificationService';
import SMSService from './SMSService';
import { generateSecureCode } from '../utils/security';

class TwoFactorService {
  static METHODS = {
    APP: 'authenticator_app',
    SMS: 'sms',
    EMAIL: 'email',
    BACKUP_CODES: 'backup_codes'
  };

  static async setup2FA(method) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be logged in');
      }

      switch (method) {
        case this.METHODS.APP:
          return await this.setupAuthenticatorApp(user.uid);
        case this.METHODS.SMS:
          return await this.setupSMS2FA(user.uid);
        case this.METHODS.EMAIL:
          return await this.setupEmail2FA(user.uid);
        default:
          throw new Error('Invalid 2FA method');
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw error;
    }
  }

  static async setupAuthenticatorApp(userId) {
    try {
      // Generate secret key
      const generate2FASecret = httpsCallable(functions, 'generate2FASecret');
      const { data: { secret, qrCode } } = await generate2FASecret({ userId });

      // Store temporary secret
      await setDoc(doc(db, 'temp2FASetup', userId), {
        secret,
        method: this.METHODS.APP,
        createdAt: Timestamp.now(),
        verified: false
      });

      return {
        secret,
        qrCode,
        message: 'Scan the QR code with your authenticator app'
      };
    } catch (error) {
      console.error('Error setting up authenticator:', error);
      throw error;
    }
  }

  static async setupSMS2FA(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      if (!userData.phoneVerified) {
        throw new Error('Phone number must be verified first');
      }

      // Generate and send verification code
      const verificationCode = generateSecureCode(6);
      
      await setDoc(doc(db, 'temp2FASetup', userId), {
        method: this.METHODS.SMS,
        phoneNumber: userData.phoneNumber,
        code: verificationCode,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)), // 10 minutes
        verified: false
      });

      // Send code via SMS
      await SMSService.sendSMS(
        userData.phoneNumber,
        '2fa_setup',
        { verificationCode }
      );

      return {
        message: 'Verification code sent to your phone'
      };
    } catch (error) {
      console.error('Error setting up SMS 2FA:', error);
      throw error;
    }
  }

  static async setupEmail2FA(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      // Generate verification code
      const verificationCode = generateSecureCode(6);
      
      await setDoc(doc(db, 'temp2FASetup', userId), {
        method: this.METHODS.EMAIL,
        email: userData.email,
        code: verificationCode,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)), // 10 minutes
        verified: false
      });

      // Send code via email
      await NotificationService.sendEmail(
        userData.email,
        '2fa-setup',
        { verificationCode }
      );

      return {
        message: 'Verification code sent to your email'
      };
    } catch (error) {
      console.error('Error setting up email 2FA:', error);
      throw error;
    }
  }

  static async verify2FASetup(userId, code) {
    try {
      const setupRef = doc(db, 'temp2FASetup', userId);
      const setupDoc = await getDoc(setupRef);

      if (!setupDoc.exists()) {
        throw new Error('No 2FA setup in progress');
      }

      const setupData = setupDoc.data();

      if (setupData.verified) {
        throw new Error('Setup already verified');
      }

      if (setupData.expiresAt && new Date() > setupData.expiresAt.toDate()) {
        throw new Error('Setup expired');
      }

      let verified = false;
      
      switch (setupData.method) {
        case this.METHODS.APP: {
          const verify2FACode = httpsCallable(functions, 'verify2FACode');
          const result = await verify2FACode({ 
            userId,
            secret: setupData.secret,
            code
          });
          verified = result.data.valid;
          break;
        }
        case this.METHODS.SMS:
        case this.METHODS.EMAIL:
          verified = setupData.code === code;
          break;
        default:
          throw new Error('Invalid 2FA method');
      }

      if (!verified) {
        throw new Error('Invalid verification code');
      }

      // Generate backup codes
      const backupCodes = await this.generateBackupCodes(userId);

      // Update user's 2FA settings
      await updateDoc(doc(db, 'users', userId), {
        twoFactorEnabled: true,
        twoFactorMethod: setupData.method,
        twoFactorSetupAt: Timestamp.now(),
        backupCodes: backupCodes.map(code => ({
          code: code.hash,
          used: false
        }))
      });

      // Clean up temporary setup
      await setupRef.delete();

      return {
        success: true,
        backupCodes: backupCodes.map(code => code.plain),
        message: '2FA enabled successfully'
      };
    } catch (error) {
      console.error('Error verifying 2FA setup:', error);
      throw error;
    }
  }

  static async verify2FALogin(userId, code) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      if (!userData.twoFactorEnabled) {
        throw new Error('2FA not enabled for this user');
      }

      let verified = false;

      switch (userData.twoFactorMethod) {
        case this.METHODS.APP: {
          const verify2FACode = httpsCallable(functions, 'verify2FACode');
          const result = await verify2FACode({ userId, code });
          verified = result.data.valid;
          break;
        }
        case this.METHODS.BACKUP_CODES: {
          // Check if code matches any unused backup code
          const backupCode = userData.backupCodes.find(bc => 
            !bc.used && bc.code === code
          );
          if (backupCode) {
            // Mark backup code as used
            await this.useBackupCode(userId, code);
            verified = true;
          }
          break;
        }
        default:
          throw new Error('Invalid 2FA method');
      }

      if (!verified) {
        throw new Error('Invalid verification code');
      }

      return {
        success: true,
        message: '2FA verification successful'
      };
    } catch (error) {
      console.error('Error verifying 2FA login:', error);
      throw error;
    }
  }

  static async disable2FA(userId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        twoFactorEnabled: false,
        twoFactorMethod: null,
        twoFactorSetupAt: null,
        backupCodes: null
      });

      return {
        success: true,
        message: '2FA disabled successfully'
      };
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  }

  static async generateBackupCodes(userId) {
    try {
      const generateBackupCodes = httpsCallable(functions, 'generateBackupCodes');
      const { data: { codes } } = await generateBackupCodes({ userId });
      return codes;
    } catch (error) {
      console.error('Error generating backup codes:', error);
      throw error;
    }
  }

  static async useBackupCode(userId, code) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      const backupCodes = userData.backupCodes;
      const codeIndex = backupCodes.findIndex(bc => bc.code === code);
      
      if (codeIndex !== -1) {
        backupCodes[codeIndex].used = true;
        await updateDoc(doc(db, 'users', userId), { backupCodes });
      }
    } catch (error) {
      console.error('Error using backup code:', error);
      throw error;
    }
  }
}

export default TwoFactorService;
