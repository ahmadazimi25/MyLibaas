import { 
  getAuth, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  applyActionCode,
  sendPasswordResetEmail
} from 'firebase/auth';
import { db } from './firebase/firebaseConfig';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import NotificationService from './NotificationService';

class AuthService {
  static async signUp(email, password, userData) {
    try {
      const auth = getAuth();
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user, {
        url: window.location.origin + '/verify-email',
        handleCodeInApp: true
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        email,
        emailVerified: false,
        createdAt: new Date(),
        lastLogin: new Date(),
        status: 'pending_verification'
      });

      // Send welcome email
      await NotificationService.sendEmail(
        email,
        'welcome-template',
        {
          username: userData.username,
          verificationLink: `${window.location.origin}/verify-email?uid=${user.uid}`
        }
      );

      return {
        user,
        message: 'Please check your email to verify your account'
      };
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    }
  }

  static async verifyEmail(code) {
    try {
      const auth = getAuth();
      await applyActionCode(auth, code);

      // Update user document in Firestore
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          emailVerified: true,
          status: 'active',
          verifiedAt: new Date()
        });

        // Send confirmation email
        await NotificationService.sendEmail(
          user.email,
          'verification-success-template',
          {
            username: (await getDoc(doc(db, 'users', user.uid))).data().username
          }
        );
      }

      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  static async resendVerificationEmail() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('No user is currently signed in');
      }

      await sendEmailVerification(user, {
        url: window.location.origin + '/verify-email',
        handleCodeInApp: true
      });

      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      console.error('Error resending verification:', error);
      throw error;
    }
  }

  static async signIn(email, password) {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date()
      });

      // Check if email is verified
      if (!user.emailVerified) {
        return {
          user,
          warning: 'Please verify your email to access all features',
          verified: false
        };
      }

      return {
        user,
        verified: true
      };
    } catch (error) {
      console.error('Error in signin:', error);
      throw error;
    }
  }

  static async resetPassword(email) {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login'
      });

      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Error in password reset:', error);
      throw error;
    }
  }

  static async checkEmailVerification() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      // Reload user to get latest verification status
      await user.reload();
      
      return {
        verified: user.emailVerified,
        email: user.email
      };
    } catch (error) {
      console.error('Error checking verification:', error);
      throw error;
    }
  }
}

export default AuthService;
