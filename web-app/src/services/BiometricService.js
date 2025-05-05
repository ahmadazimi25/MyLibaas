import { db } from './firebase/firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { functions } from './firebase/firebaseConfig';
import { httpsCallable } from 'firebase/functions';

class BiometricService {
  static async checkBiometricSupport() {
    try {
      if (!window.PublicKeyCredential) {
        return {
          supported: false,
          reason: 'WebAuthn not supported in this browser'
        };
      }

      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      return {
        supported: available,
        reason: available ? null : 'No platform authenticator available'
      };
    } catch (error) {
      console.error('Error checking biometric support:', error);
      return {
        supported: false,
        reason: error.message
      };
    }
  }

  static async registerBiometric(userId) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be logged in');
      }

      // Get challenge from server
      const generateChallenge = httpsCallable(functions, 'generateRegistrationChallenge');
      const challenge = await generateChallenge({ userId });

      // Create credentials
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: this.base64ToArrayBuffer(challenge.data.challenge),
          rp: {
            name: 'MyLibaas',
            id: window.location.hostname
          },
          user: {
            id: this.base64ToArrayBuffer(userId),
            name: user.email,
            displayName: user.displayName || user.email
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'direct'
        }
      });

      // Send credential to server
      const verifyRegistration = httpsCallable(functions, 'verifyBiometricRegistration');
      await verifyRegistration({
        credential: this.credentialToObject(credential),
        userId
      });

      // Update user's biometric status
      await updateDoc(doc(db, 'users', userId), {
        biometricEnabled: true,
        biometricRegisteredAt: Timestamp.now(),
        biometricDevices: [{
          deviceId: credential.id,
          registeredAt: Timestamp.now(),
          lastUsed: Timestamp.now()
        }]
      });

      return {
        success: true,
        message: 'Biometric authentication registered successfully'
      };
    } catch (error) {
      console.error('Error registering biometric:', error);
      throw error;
    }
  }

  static async authenticateWithBiometric(email) {
    try {
      // Get challenge from server
      const generateChallenge = httpsCallable(functions, 'generateAuthenticationChallenge');
      const challenge = await generateChallenge({ email });

      // Get credential
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: this.base64ToArrayBuffer(challenge.data.challenge),
          rpId: window.location.hostname,
          userVerification: 'required',
          timeout: 60000
        }
      });

      // Verify with server
      const verifyAuthentication = httpsCallable(functions, 'verifyBiometricAuthentication');
      const result = await verifyAuthentication({
        credential: this.credentialToObject(credential),
        email
      });

      // Sign in with custom token
      const auth = getAuth();
      await signInWithCustomToken(auth, result.data.token);

      // Update last used timestamp
      const userDoc = await getDoc(doc(db, 'users', result.data.userId));
      const userData = userDoc.data();
      const devices = userData.biometricDevices || [];
      const deviceIndex = devices.findIndex(d => d.deviceId === credential.id);

      if (deviceIndex !== -1) {
        devices[deviceIndex].lastUsed = Timestamp.now();
        await updateDoc(doc(db, 'users', result.data.userId), {
          biometricDevices: devices
        });
      }

      return {
        success: true,
        user: result.data.user
      };
    } catch (error) {
      console.error('Error authenticating with biometric:', error);
      throw error;
    }
  }

  static async removeBiometric(deviceId) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be logged in');
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const devices = userData.biometricDevices || [];
      
      // Remove specific device
      const updatedDevices = devices.filter(d => d.deviceId !== deviceId);

      await updateDoc(doc(db, 'users', user.uid), {
        biometricDevices: updatedDevices,
        biometricEnabled: updatedDevices.length > 0
      });

      // Revoke server-side credential
      const revokeCredential = httpsCallable(functions, 'revokeBiometricCredential');
      await revokeCredential({ deviceId, userId: user.uid });

      return {
        success: true,
        message: 'Biometric authentication removed successfully'
      };
    } catch (error) {
      console.error('Error removing biometric:', error);
      throw error;
    }
  }

  // Utility methods
  static base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  static arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  static credentialToObject(credential) {
    return {
      id: credential.id,
      rawId: this.arrayBufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: this.arrayBufferToBase64(credential.response.clientDataJSON),
        attestationObject: credential.response.attestationObject 
          ? this.arrayBufferToBase64(credential.response.attestationObject)
          : undefined,
        authenticatorData: credential.response.authenticatorData
          ? this.arrayBufferToBase64(credential.response.authenticatorData)
          : undefined,
        signature: credential.response.signature
          ? this.arrayBufferToBase64(credential.response.signature)
          : undefined,
        userHandle: credential.response.userHandle
          ? this.arrayBufferToBase64(credential.response.userHandle)
          : undefined
      }
    };
  }
}

export default BiometricService;
