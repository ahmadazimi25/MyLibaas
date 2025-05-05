import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, Timestamp } from 'firebase/firestore';
import Stripe from 'stripe';

class StripeService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.platformFee = 0.15; // 15% platform fee
  }

  async setupConnectedAccount(user) {
    try {
      // Create Stripe Connect account
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: user.country,
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        business_type: 'individual',
        business_profile: {
          mcc: '5691', // Clothing rental
          url: `https://mylibaas.com/users/${user.id}`
        }
      });

      // Store account info
      await setDoc(doc(db, 'stripe_accounts', user.id), {
        accountId: account.id,
        status: account.charges_enabled ? 'active' : 'pending',
        createdAt: Timestamp.now()
      });

      return account;
    } catch (error) {
      console.error('Error setting up Stripe account:', error);
      throw error;
    }
  }

  async createPaymentIntent(rental) {
    try {
      const amount = this.calculateAmount(rental);
      const fee = Math.round(amount * this.platformFee);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        application_fee_amount: fee,
        transfer_data: {
          destination: rental.owner.stripeAccountId
        },
        metadata: {
          rentalId: rental.id,
          itemId: rental.item.id,
          renterId: rental.renter.id,
          ownerId: rental.owner.id
        }
      });

      // Store payment intent
      await setDoc(doc(db, 'payment_intents', paymentIntent.id), {
        rentalId: rental.id,
        amount: amount,
        fee: fee,
        status: paymentIntent.status,
        createdAt: Timestamp.now()
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async handleSecurityDeposit(rental) {
    try {
      const depositAmount = this.calculateDeposit(rental.item);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: depositAmount,
        currency: 'usd',
        capture_method: 'manual', // Will be captured only if damage occurs
        metadata: {
          type: 'security_deposit',
          rentalId: rental.id,
          itemId: rental.item.id,
          renterId: rental.renter.id
        }
      });

      // Store deposit info
      await setDoc(doc(db, 'security_deposits', rental.id), {
        paymentIntentId: paymentIntent.id,
        amount: depositAmount,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error handling security deposit:', error);
      throw error;
    }
  }

  async processRefund(rental, amount, reason) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: rental.paymentIntentId,
        amount: amount,
        metadata: {
          rentalId: rental.id,
          reason: reason
        }
      });

      // Store refund info
      await setDoc(doc(db, 'refunds', refund.id), {
        rentalId: rental.id,
        amount: amount,
        reason: reason,
        status: refund.status,
        createdAt: Timestamp.now()
      });

      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  async handlePayout(rental) {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: this.calculatePayout(rental),
        currency: 'usd',
        destination: rental.owner.stripeAccountId,
        transfer_group: rental.id,
        metadata: {
          rentalId: rental.id,
          itemId: rental.item.id,
          ownerId: rental.owner.id
        }
      });

      // Store transfer info
      await setDoc(doc(db, 'transfers', transfer.id), {
        rentalId: rental.id,
        amount: transfer.amount,
        status: transfer.status,
        createdAt: Timestamp.now()
      });

      return transfer;
    } catch (error) {
      console.error('Error handling payout:', error);
      throw error;
    }
  }

  calculateAmount(rental) {
    const baseAmount = rental.item.price * rental.days;
    const insuranceFee = this.calculateInsuranceFee(rental.item);
    const serviceFee = this.calculateServiceFee(baseAmount);
    
    return Math.round((baseAmount + insuranceFee + serviceFee) * 100);
  }

  calculateDeposit(item) {
    // Calculate deposit based on item value
    return Math.round(item.value * 0.3 * 100); // 30% of item value
  }

  calculatePayout(rental) {
    const amount = this.calculateAmount(rental);
    const fee = Math.round(amount * this.platformFee);
    return amount - fee;
  }

  calculateInsuranceFee(item) {
    // Calculate insurance fee based on item value
    return Math.round(item.value * 0.05); // 5% of item value
  }

  calculateServiceFee(baseAmount) {
    // Calculate service fee
    return Math.round(baseAmount * 0.10); // 10% service fee
  }

  async calculateTax(amount, location) {
    try {
      const taxCalculation = await this.stripe.tax.calculations.create({
        currency: 'usd',
        line_items: [{
          amount: amount,
          reference: 'rental_fee'
        }],
        customer_details: {
          address: {
            country: location.country,
            state: location.state,
            postal_code: location.postalCode
          },
          tax_ids: []
        }
      });

      return taxCalculation.tax_amount;
    } catch (error) {
      console.error('Error calculating tax:', error);
      return 0;
    }
  }

  async getPayoutSchedule(accountId) {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      return account.settings.payouts;
    } catch (error) {
      console.error('Error getting payout schedule:', error);
      throw error;
    }
  }

  async updatePayoutSchedule(accountId, schedule) {
    try {
      await this.stripe.accounts.update(accountId, {
        settings: {
          payouts: schedule
        }
      });
    } catch (error) {
      console.error('Error updating payout schedule:', error);
      throw error;
    }
  }
}

export default new StripeService();
