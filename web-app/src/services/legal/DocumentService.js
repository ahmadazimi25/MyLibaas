import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, Timestamp } from 'firebase/firestore';

class DocumentService {
  static DOCUMENT_TYPES = {
    RENTAL_AGREEMENT: 'rental_agreement',
    TERMS_OF_SERVICE: 'terms_of_service',
    PRIVACY_POLICY: 'privacy_policy',
    USER_AGREEMENT: 'user_agreement',
    INSURANCE_POLICY: 'insurance_policy',
    DAMAGE_POLICY: 'damage_policy',
    RETURN_POLICY: 'return_policy'
  };

  static async generateDocument(type, data) {
    try {
      let content;
      switch (type) {
        case this.DOCUMENT_TYPES.RENTAL_AGREEMENT:
          content = await this.generateRentalAgreement(data);
          break;
        case this.DOCUMENT_TYPES.TERMS_OF_SERVICE:
          content = await this.generateTermsOfService(data);
          break;
        case this.DOCUMENT_TYPES.PRIVACY_POLICY:
          content = await this.generatePrivacyPolicy(data);
          break;
        case this.DOCUMENT_TYPES.USER_AGREEMENT:
          content = await this.generateUserAgreement(data);
          break;
        case this.DOCUMENT_TYPES.INSURANCE_POLICY:
          content = await this.generateInsurancePolicy(data);
          break;
        default:
          throw new Error(`Unsupported document type: ${type}`);
      }

      // Store document
      const docRef = await setDoc(doc(collection(db, 'legal_documents'), Date.now().toString()), {
        type,
        content,
        version: data.version,
        createdAt: Timestamp.now()
      });

      return {
        id: docRef.id,
        type,
        content,
        version: data.version
      };
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  }

  static async generateRentalAgreement(data) {
    const {
      renter,
      owner,
      item,
      rentalPeriod,
      price,
      deposit,
      terms
    } = data;

    return `
RENTAL AGREEMENT

This Rental Agreement (the "Agreement") is made on ${new Date().toLocaleDateString()} between:

OWNER
${owner.name}
${owner.address}

and

RENTER
${renter.name}
${renter.address}

1. ITEM DETAILS
   Item: ${item.name}
   Description: ${item.description}
   Condition: ${item.condition}
   Value: $${item.value}

2. RENTAL PERIOD
   Start Date: ${rentalPeriod.start}
   End Date: ${rentalPeriod.end}

3. PAYMENT
   Rental Fee: $${price.rental}
   Security Deposit: $${deposit}
   Insurance Fee: $${price.insurance}
   Total Payment: $${price.total}

4. TERMS AND CONDITIONS
   ${terms.join('\n   ')}

5. DAMAGE POLICY
   The Renter is responsible for any damage beyond normal wear and tear.
   Damage assessment will be conducted upon return.

6. RETURN POLICY
   Items must be returned in the same condition as received.
   Late returns will incur additional charges.

7. INSURANCE
   Insurance coverage is provided for the duration of the rental period.
   Coverage details are outlined in the attached Insurance Policy.

Signatures:

Owner: _________________________
Date: ${new Date().toLocaleDateString()}

Renter: _________________________
Date: ${new Date().toLocaleDateString()}
    `;
  }

  static async generateTermsOfService(data) {
    return `
TERMS OF SERVICE

Last Updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
   By accessing and using MyLibaas, you agree to these terms.

2. PLATFORM DESCRIPTION
   MyLibaas is a clothing rental platform connecting owners and renters.

3. USER ACCOUNTS
   - Users must provide accurate information
   - Users are responsible for account security
   - Platform reserves right to terminate accounts

4. RENTAL PROCESS
   - Booking and confirmation
   - Payment and deposits
   - Delivery and returns
   - Cancellation policies

5. FEES AND PAYMENTS
   - Rental fees
   - Platform fees
   - Payment processing
   - Refund policies

6. USER RESPONSIBILITIES
   - Item care
   - Communication
   - Accurate listings
   - Timely returns

7. PLATFORM POLICIES
   - Privacy Policy
   - Damage Policy
   - Return Policy
   - Insurance Coverage

8. DISPUTE RESOLUTION
   - Process
   - Mediation
   - Resolution timeline

9. LIMITATION OF LIABILITY
   Platform liability is limited to direct damages.

10. MODIFICATIONS
    Terms may be updated with notice to users.
    `;
  }

  static async generatePrivacyPolicy(data) {
    return `
PRIVACY POLICY

Last Updated: ${new Date().toLocaleDateString()}

1. DATA COLLECTION
   We collect:
   - Personal information
   - Usage data
   - Payment information
   - Communication records

2. DATA USE
   We use data for:
   - Platform operation
   - Service improvement
   - Communication
   - Legal compliance

3. DATA SHARING
   We share data with:
   - Service providers
   - Payment processors
   - Legal authorities when required

4. DATA SECURITY
   We implement:
   - Encryption
   - Access controls
   - Regular audits
   - Breach notification

5. USER RIGHTS
   Users can:
   - Access their data
   - Request corrections
   - Request deletion
   - Export data

6. COOKIES AND TRACKING
   We use:
   - Essential cookies
   - Analytics
   - Marketing tools

7. COMPLIANCE
   We comply with:
   - GDPR
   - CCPA
   - Local regulations

8. CONTACT
   Privacy concerns:
   Email: privacy@mylibaas.com
    `;
  }

  static async generateUserAgreement(data) {
    // Implementation for user agreement
    return 'User Agreement Content';
  }

  static async generateInsurancePolicy(data) {
    // Implementation for insurance policy
    return 'Insurance Policy Content';
  }

  static async getLatestDocument(type) {
    try {
      const docsRef = collection(db, 'legal_documents');
      const query = docsRef
        .where('type', '==', type)
        .orderBy('createdAt', 'desc')
        .limit(1);

      const snapshot = await getDocs(query);
      return snapshot.empty ? null : snapshot.docs[0].data();
    } catch (error) {
      console.error('Error getting latest document:', error);
      throw error;
    }
  }

  static async getUserAcceptance(userId, documentId) {
    try {
      const acceptanceRef = doc(db, 'document_acceptances', `${userId}_${documentId}`);
      const acceptance = await getDoc(acceptanceRef);
      return acceptance.exists() ? acceptance.data() : null;
    } catch (error) {
      console.error('Error getting user acceptance:', error);
      throw error;
    }
  }

  static async recordUserAcceptance(userId, documentId) {
    try {
      await setDoc(doc(db, 'document_acceptances', `${userId}_${documentId}`), {
        userId,
        documentId,
        acceptedAt: Timestamp.now(),
        ipAddress: 'user_ip_address', // Should be provided
        userAgent: 'user_agent' // Should be provided
      });
    } catch (error) {
      console.error('Error recording user acceptance:', error);
      throw error;
    }
  }
}

export default DocumentService;
