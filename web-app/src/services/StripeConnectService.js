import { db } from '../firebase/config';

class StripeConnectService {
  constructor() {
    this.accountType = process.env.REACT_APP_STRIPE_ACCOUNT_TYPE;
    this.clientId = process.env.REACT_APP_STRIPE_CONNECT_CLIENT_ID;
  }

  async onboardLender(userId, businessData) {
    try {
      // Create Stripe Connect account
      const response = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          businessData,
          accountType: this.accountType
        })
      });

      const { accountId, accountLink } = await response.json();

      // Save Stripe account ID to user profile
      await db.collection('users').doc(userId).update({
        stripeAccountId: accountId,
        stripeOnboardingStatus: 'pending'
      });

      // Return onboarding URL
      return accountLink;
    } catch (error) {
      console.error('Error onboarding lender:', error);
      throw error;
    }
  }

  async checkOnboardingStatus(userId) {
    try {
      const response = await fetch(`/api/stripe/account-status/${userId}`);
      const { status, requirements } = await response.json();

      await db.collection('users').doc(userId).update({
        stripeOnboardingStatus: status,
        stripeRequirements: requirements
      });

      return { status, requirements };
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      throw error;
    }
  }

  async createLoginLink(userId) {
    try {
      const user = await db.collection('users').doc(userId).get();
      const { stripeAccountId } = user.data();

      const response = await fetch('/api/stripe/create-login-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountId: stripeAccountId
        })
      });

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Error creating login link:', error);
      throw error;
    }
  }

  async getAccountBalance(userId) {
    try {
      const user = await db.collection('users').doc(userId).get();
      const { stripeAccountId } = user.data();

      const response = await fetch(`/api/stripe/account-balance/${stripeAccountId}`);
      const balance = await response.json();

      return {
        available: balance.available,
        pending: balance.pending,
        instant: balance.instant_available
      };
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  async createPayout(userId, amount) {
    try {
      const user = await db.collection('users').doc(userId).get();
      const { stripeAccountId } = user.data();

      const response = await fetch('/api/stripe/create-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountId: stripeAccountId,
          amount
        })
      });

      const payout = await response.json();

      // Record payout in database
      await db.collection('payouts').add({
        userId,
        amount,
        status: payout.status,
        stripePayoutId: payout.id,
        createdAt: new Date()
      });

      return payout;
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  }

  async getPayoutSchedule(userId) {
    try {
      const user = await db.collection('users').doc(userId).get();
      const { stripeAccountId } = user.data();

      const response = await fetch(`/api/stripe/payout-schedule/${stripeAccountId}`);
      return response.json();
    } catch (error) {
      console.error('Error getting payout schedule:', error);
      throw error;
    }
  }
}

export default new StripeConnectService();
