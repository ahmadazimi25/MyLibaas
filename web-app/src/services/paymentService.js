import { db } from '../services/firebase/firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

class PaymentService {
  static async createPaymentIntent(bookingId) {
    try {
      // Get the booking details
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data();

      // Call Firebase Function to create payment intent
      const functions = getFunctions();
      const createStripePaymentIntent = httpsCallable(functions, 'createStripePaymentIntent');
      const result = await createStripePaymentIntent({
        bookingId,
        amount: booking.price.total * 100, // Convert to cents
        currency: 'cad'
      });

      return result.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  static async confirmPayment(bookingId, paymentIntentId) {
    try {
      // Update booking with payment intent ID
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        paymentIntentId,
        paymentStatus: 'processing'
      });

      // Call Firebase Function to confirm payment
      const functions = getFunctions();
      const confirmStripePayment = httpsCallable(functions, 'confirmStripePayment');
      const result = await confirmStripePayment({
        bookingId,
        paymentIntentId
      });

      return result.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  static async processRefund(bookingId) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data();

      if (!booking.paymentIntentId) {
        throw new Error('No payment found for this booking');
      }

      // Call Firebase Function to process refund
      const functions = getFunctions();
      const processStripeRefund = httpsCallable(functions, 'processStripeRefund');
      const result = await processStripeRefund({
        bookingId,
        paymentIntentId: booking.paymentIntentId
      });

      return result.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  static async getPaymentStatus(bookingId) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data();

      if (!booking.paymentIntentId) {
        return { status: 'no_payment' };
      }

      // Call Firebase Function to check payment status
      const functions = getFunctions();
      const checkStripePaymentStatus = httpsCallable(functions, 'checkStripePaymentStatus');
      const result = await checkStripePaymentStatus({
        paymentIntentId: booking.paymentIntentId
      });

      return result.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }
}

export default PaymentService;
