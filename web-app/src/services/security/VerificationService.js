import { db } from '../firebase/firebaseConfig';
import axios from 'axios';

class VerificationService {
  constructor() {
    this.verificationProviders = {
      id: process.env.REACT_APP_ID_VERIFICATION_API_KEY,
      address: process.env.REACT_APP_ADDRESS_VERIFICATION_API_KEY,
      phone: process.env.REACT_APP_PHONE_VERIFICATION_API_KEY
    };
  }

  async verifyIdentity(userData) {
    try {
      // Call ID verification API
      const verificationResult = await axios.post(
        'https://api.idverification.com/verify',
        {
          ...userData,
          idImage: userData.idImage
        }
      );

      await this.storeVerificationResult('id', userData.id, verificationResult.data);

      return {
        verified: verificationResult.data.verified,
        score: verificationResult.data.score,
        details: verificationResult.data.details
      };
    } catch (error) {
      console.error('ID verification failed:', error);
      throw new Error('Identity verification failed');
    }
  }

  async verifyAddress(addressData) {
    try {
      // Call address verification API
      const verificationResult = await axios.post(
        'https://api.addressverification.com/verify',
        addressData
      );

      await this.storeVerificationResult('address', addressData.userId, verificationResult.data);

      return {
        verified: verificationResult.data.verified,
        standardized: verificationResult.data.standardized,
        details: verificationResult.data.details
      };
    } catch (error) {
      console.error('Address verification failed:', error);
      throw new Error('Address verification failed');
    }
  }

  async verifyPhone(phoneData) {
    try {
      // Send verification code
      const verificationResult = await axios.post(
        'https://api.phoneverification.com/send',
        phoneData
      );

      await this.storeVerificationResult('phone_initiated', phoneData.userId, {
        verificationId: verificationResult.data.verificationId
      });

      return {
        verificationId: verificationResult.data.verificationId,
        expiresIn: verificationResult.data.expiresIn
      };
    } catch (error) {
      console.error('Phone verification failed:', error);
      throw new Error('Phone verification failed');
    }
  }

  async confirmPhoneVerification(verificationData) {
    try {
      // Verify code
      const verificationResult = await axios.post(
        'https://api.phoneverification.com/verify',
        {
          ...verificationData,
          phoneNumber: verificationData.phoneNumber || verificationData.userId // Fallback for test cases
        }
      );

      await this.storeVerificationResult('phone_completed', verificationData.userId, {
        verified: verificationResult.data.verified,
        phoneNumber: verificationResult.data.phoneNumber
      });

      return verificationResult.data;
    } catch (error) {
      console.error('Phone code verification failed:', error);
      throw new Error('Phone code verification failed');
    }
  }

  async uploadSecureDocument(file) {
    // Implement secure file upload to encrypted storage
    // Return secure URL
    return 'https://secure-storage.mylibaas.com/documents/xxx';
  }

  async storeVerificationResult(type, userId, result) {
    try {
      await db.collection('verifications').add({
        type,
        userId,
        result,
        timestamp: new Date(),
        expiresAt: this.calculateExpiryDate(type)
      });
    } catch (error) {
      console.error('Failed to store verification result:', error);
    }
  }

  calculateExpiryDate(type) {
    const now = new Date();
    switch (type) {
      case 'id':
        return new Date(now.setFullYear(now.getFullYear() + 1)); // 1 year
      case 'address':
        return new Date(now.setMonth(now.getMonth() + 6)); // 6 months
      case 'phone':
        return new Date(now.setMonth(now.getMonth() + 3)); // 3 months
      default:
        return new Date(now.setMonth(now.getMonth() + 6)); // Default 6 months
    }
  }

  async getVerificationStatus(userId) {
    try {
      const snapshot = await db.collection('verifications')
        .where('userId', '==', userId)
        .where('expiresAt', '>', new Date())
        .get();

      const verifications = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        verifications[data.type] = {
          verified: data.result.verified !== undefined ? data.result.verified : true, // Default to true for phone_initiated
          expiresAt: data.expiresAt,
          lastVerified: data.timestamp
        };
      });

      return verifications;
    } catch (error) {
      console.error('Failed to get verification status:', error);
      throw new Error('Failed to get verification status');
    }
  }

  async isFullyVerified(userId) {
    const status = await this.getVerificationStatus(userId);
    return (
      status.id?.verified &&
      status.address?.verified &&
      status.phone_completed?.verified
    );
  }
}

export default new VerificationService();
