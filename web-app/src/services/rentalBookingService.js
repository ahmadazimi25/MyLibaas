import { db } from '../services/firebase/firebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

class RentalBookingService {
  static async checkAvailability(listingId, startDate, endDate) {
    try {
      // Check if the listing exists
      const listingRef = doc(db, 'listings', listingId);
      const listingDoc = await getDoc(listingRef);
      
      if (!listingDoc.exists()) {
        throw new Error('Listing not found');
      }

      // Get all bookings for this listing that overlap with the requested dates
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('listingId', '==', listingId),
        where('status', 'in', ['pending', 'confirmed', 'in_progress']),
      );

      const bookingDocs = await getDocs(q);
      const conflictingBooking = bookingDocs.docs.find(doc => {
        const booking = doc.data();
        const bookingStart = booking.dateRange.startDate.toDate();
        const bookingEnd = booking.dateRange.endDate.toDate();
        
        return (
          (startDate >= bookingStart && startDate <= bookingEnd) ||
          (endDate >= bookingStart && endDate <= bookingEnd) ||
          (startDate <= bookingStart && endDate >= bookingEnd)
        );
      });

      return !conflictingBooking;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }

  static calculatePrice(listing, startDate, endDate) {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    let rentalFee;

    // Calculate rental fee based on duration
    if (days <= 7) {
      rentalFee = listing.pricing.rentalPrice.daily * days;
    } else if (days <= 30) {
      rentalFee = listing.pricing.rentalPrice.weekly * Math.ceil(days / 7);
    } else {
      rentalFee = listing.pricing.rentalPrice.monthly * Math.ceil(days / 30);
    }

    // Calculate service fee (10% of rental fee)
    const serviceFee = rentalFee * 0.10;

    // Get security deposit
    const securityDeposit = listing.pricing.securityDeposit;

    return {
      rentalFee,
      serviceFee,
      securityDeposit,
      total: rentalFee + serviceFee + securityDeposit
    };
  }

  static async createBooking(listingId, renterId, startDate, endDate) {
    try {
      // Get listing details
      const listingRef = doc(db, 'listings', listingId);
      const listingDoc = await getDoc(listingRef);
      
      if (!listingDoc.exists()) {
        throw new Error('Listing not found');
      }
      
      const listing = listingDoc.data();

      // Check availability
      const isAvailable = await this.checkAvailability(listingId, startDate, endDate);
      if (!isAvailable) {
        throw new Error('Selected dates are not available');
      }

      // Calculate price
      const price = this.calculatePrice(listing, startDate, endDate);

      // Create booking
      const bookingData = {
        listingId,
        renterId,
        lenderId: listing.userId,
        dateRange: {
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate)
        },
        status: 'pending',
        price,
        paymentStatus: 'pending',
        created: Timestamp.now(),
        updated: Timestamp.now()
      };

      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
      return { id: bookingRef.id, ...bookingData };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  static async updateBookingStatus(bookingId, status, notes = '') {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status,
        notes,
        updated: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  static async updatePaymentStatus(bookingId, paymentStatus, paymentIntentId = null) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const updateData = {
        paymentStatus,
        updated: Timestamp.now()
      };

      if (paymentIntentId) {
        updateData.paymentIntentId = paymentIntentId;
      }

      await updateDoc(bookingRef, updateData);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  static async getBooking(bookingId) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      return { id: bookingDoc.id, ...bookingDoc.data() };
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  static async getUserBookings(userId, role = 'renter') {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where(role === 'renter' ? 'renterId' : 'lenderId', '==', userId)
      );

      const bookingDocs = await getDocs(q);
      return bookingDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }

  static async getListingBookings(listingId) {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('listingId', '==', listingId));

      const bookingDocs = await getDocs(q);
      return bookingDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting listing bookings:', error);
      throw error;
    }
  }
}

export default RentalBookingService;
