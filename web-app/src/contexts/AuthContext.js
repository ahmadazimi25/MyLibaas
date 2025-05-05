import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, facebookProvider } from '../services/firebase/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  linkWithPopup
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      if (user) {
        // Force refresh the token to get the latest emailVerified status
        await user.reload();
        // Fetch user profile from Firestore
        await fetchUserProfile(user.uid);
      }
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener...');
      unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) {
        setUserProfile(doc.data());
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          preferences: {},
          role: 'user'
        };
        await db.collection('users').doc(uid).set(newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signup = async (email, password, name) => {
    try {
      console.log('Signup called with:', { email, name });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's profile with their name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);
      setVerificationEmailSent(true);

      console.log('Signup successful:', userCredential.user.uid);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage;
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = 'Failed to create account';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Login called with:', { email });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        return { 
          success: false, 
          error: 'Please verify your email before logging in',
          needsVerification: true,
          user: userCredential.user
        };
      }

      console.log('Login successful:', userCredential.user.uid);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage;
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        default:
          errorMessage = 'Failed to sign in';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      await sendEmailVerification(user);
      setVerificationEmailSent(true);
      return { success: true };
    } catch (error) {
      console.error('Verification email error:', error);
      return { 
        success: false, 
        error: 'Failed to send verification email. Please try again later.'
      };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage;
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        default:
          errorMessage = 'Failed to send password reset email';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Failed to log out' };
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // Update Firebase auth profile
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });

      // Update Firestore profile
      const updatedProfile = {
        ...userProfile,
        ...profileData,
        updatedAt: new Date().toISOString()
      };

      await db.collection('users').doc(user.uid).update(updatedProfile);
      setUserProfile(updatedProfile);

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const updateUserPassword = async (currentPassword, newPassword) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      let errorMessage;

      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Current password is incorrect';
          break;
        case 'auth/weak-password':
          errorMessage = 'New password is too weak';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Please log in again before changing your password';
          break;
        default:
          errorMessage = 'Failed to update password';
      }

      return { success: false, error: errorMessage };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!result.user.emailVerified) {
        await sendEmailVerification(result.user);
        setVerificationEmailSent(true);
        return { success: false, needsVerification: true, user: result.user };
      }
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { 
        success: false, 
        error: error.code === 'auth/popup-closed-by-user' 
          ? 'Sign in cancelled' 
          : 'Failed to sign in with Google' 
      };
    }
  };

  const signInWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      if (!result.user.emailVerified) {
        await sendEmailVerification(result.user);
        setVerificationEmailSent(true);
        return { success: false, needsVerification: true, user: result.user };
      }
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Facebook sign in error:', error);
      return { 
        success: false, 
        error: error.code === 'auth/popup-closed-by-user' 
          ? 'Sign in cancelled' 
          : 'Failed to sign in with Facebook' 
      };
    }
  };

  const linkSocialAccount = async (provider) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      const authProvider = provider === 'google' ? googleProvider : facebookProvider;
      await linkWithPopup(user, authProvider);
      return { success: true };
    } catch (error) {
      console.error('Link account error:', error);
      return { 
        success: false, 
        error: error.code === 'auth/credential-already-in-use'
          ? 'This account is already linked to another user'
          : 'Failed to link account'
      };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
    updateUserPassword,
    resendVerificationEmail,
    resetPassword,
    verificationEmailSent,
    signInWithGoogle,
    signInWithFacebook,
    linkSocialAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext;
