import { loadStripe } from '@stripe/stripe-js';
import { db } from '../firebase/config';

class StripeService {
  constructor() {
    this.stripe = null;
    this.init();
  }

  async init() {
    this.stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
  }

  async createConnectedAccount(userId, businessData) {
    try {
      // Create Stripe Connected Account for lender
      const response = await fetch('/api/create-connected-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          businessData
        })
      });

      const { accountId, accountLink } = await response.json();

      // Save Stripe account ID to user profile
      await db.collection('users').doc(userId).update({
        stripeAccountId: accountId
      });

      // Return account link for onboarding
      return accountLink;
    } catch (error) {
      console.error('Error creating connected account:', error);
      throw error;
    }
  }

  async processRentalPayment(rentalData) {
    const {
      amount,
      lenderId,
      renterId,
      bookingId
    } = rentalData;

    try {
      // Get lender's Stripe account ID
      const lenderDoc = await db.collection('users').doc(lenderId).get();
      const stripeAccountId = lenderDoc.data().stripeAccountId;

      // Create payment intent with automatic split
      const response = await fetch('/api/create-rental-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount, // Total amount in cents
          bookingId,
          lenderStripeAccount: stripeAccountId,
          applicationFeeAmount: Math.round(amount * 0.20) // 20% platform fee
        })
      });

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const result = await this.stripe.confirmCardPayment(clientSecret);

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Record successful payment
      await db.collection('payments').add({
        bookingId,
        lenderId,
        renterId,
        amount,
        platformFee: Math.round(amount * 0.20),
        lenderAmount: Math.round(amount * 0.80),
        status: 'succeeded',
        stripePaymentId: result.paymentIntent.id,
        timestamp: new Date()
      });

      return {
        success: true,
        paymentId: result.paymentIntent.id
      };
    } catch (error) {
      console.error('Error processing rental payment:', error);
      throw error;
    }
  }

  async handleRefund(bookingId, amount, reason) {
    try {
      const response = await fetch('/api/refund-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount,
          reason
        })
      });

      const { refundId } = await response.json();

      // Record refund
      await db.collection('refunds').add({
        bookingId,
        amount,
        reason,
        refundId,
        status: 'processed',
        timestamp: new Date()
      });

      return {
        success: true,
        refundId
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  async getLenderBalance(lenderId) {
    try {
      const lenderDoc = await db.collection('users').doc(lenderId).get();
      const stripeAccountId = lenderDoc.data().stripeAccountId;

      const response = await fetch(`/api/lender-balance/${stripeAccountId}`);
      const balance = await response.json();

      return {
        available: balance.available[0].amount,
        pending: balance.pending[0].amount,
        currency: balance.available[0].currency
      };
    } catch (error) {
      console.error('Error getting lender balance:', error);
      throw error;
    }
  }

  async createPayout(lenderId, amount) {
    try {
      const lenderDoc = await db.collection('users').doc(lenderId).get();
      const stripeAccountId = lenderDoc.data().stripeAccountId;

      const response = await fetch('/api/create-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripeAccountId,
          amount
        })
      });

      const { payoutId } = await response.json();

      // Record payout
      await db.collection('payouts').add({
        lenderId,
        amount,
        payoutId,
        status: 'processed',
        timestamp: new Date()
      });

      return {
        success: true,
        payoutId
      };
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  }
}

export default new StripeService();
