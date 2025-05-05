import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  arrayUnion,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';

class DatabaseService {
  // Users Collection
  static async createUser(userId, userData) {
    const userRef = doc(db, 'users', userId);
    const sanitizedData = {
      ...userData,
      username: userData.username,
      createdAt: Timestamp.now(),
      rating: 0,
      totalRentals: 0,
      responseRate: 100,
      verificationBadges: []
    };
    await setDoc(userRef, sanitizedData);
  }

  static async getUser(username) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username), limit(1));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].data();
  }

  // Listings Collection
  static async createListing(listingData) {
    const listingsRef = collection(db, 'listings');
    const newListingRef = doc(listingsRef);
    const sanitizedData = {
      ...listingData,
      createdAt: Timestamp.now(),
      status: 'active',
      views: 0,
      likes: 0
    };
    await setDoc(newListingRef, sanitizedData);
    return newListingRef.id;
  }

  static async getListing(listingId) {
    const listingRef = doc(db, 'listings', listingId);
    const listingDoc = await getDoc(listingRef);
    return listingDoc.exists() ? listingDoc.data() : null;
  }

  static async searchListings(filters) {
    const listingsRef = collection(db, 'listings');
    let q = query(listingsRef, where('status', '==', 'active'));

    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters.priceRange) {
      q = query(q, 
        where('price', '>=', filters.priceRange.min),
        where('price', '<=', filters.priceRange.max)
      );
    }
    // Add more filters as needed

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Rentals Collection
  static async createRental(rentalData) {
    const rentalsRef = collection(db, 'rentals');
    const newRentalRef = doc(rentalsRef);
    const sanitizedData = {
      ...rentalData,
      status: 'pending',
      createdAt: Timestamp.now()
    };
    await setDoc(newRentalRef, sanitizedData);
    return newRentalRef.id;
  }

  static async updateRentalStatus(rentalId, status) {
    const rentalRef = doc(db, 'rentals', rentalId);
    await updateDoc(rentalRef, { status, updatedAt: Timestamp.now() });
  }

  // Reviews Collection
  static async createReview(reviewData) {
    const reviewsRef = collection(db, 'reviews');
    const newReviewRef = doc(reviewsRef);
    const sanitizedData = {
      ...reviewData,
      createdAt: Timestamp.now()
    };
    await setDoc(newReviewRef, sanitizedData);
    
    // Update user rating
    const userRef = doc(db, 'users', reviewData.reviewedUserId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    const newRating = (userData.rating * userData.totalReviews + reviewData.ratings.overall) / 
                     (userData.totalReviews + 1);
    
    await updateDoc(userRef, {
      rating: newRating,
      totalReviews: userData.totalReviews + 1
    });

    return newReviewRef.id;
  }

  // Messages Collection
  static async createConversation(participants) {
    const conversationsRef = collection(db, 'messages');
    const newConversationRef = doc(conversationsRef);
    await setDoc(newConversationRef, {
      participants,
      createdAt: Timestamp.now(),
      lastMessageAt: Timestamp.now(),
      messages: []
    });
    return newConversationRef.id;
  }

  static async sendMessage(conversationId, messageData) {
    const conversationRef = doc(db, 'messages', conversationId);
    const sanitizedMessage = {
      ...messageData,
      timestamp: Timestamp.now()
    };
    
    await updateDoc(conversationRef, {
      messages: arrayUnion(sanitizedMessage),
      lastMessageAt: Timestamp.now()
    });
  }

  static async getConversations(username) {
    const conversationsRef = collection(db, 'messages');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', username),
      orderBy('lastMessageAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Transactions Collection
  static async createTransaction(transactionData) {
    const transactionsRef = collection(db, 'transactions');
    const newTransactionRef = doc(transactionsRef);
    const sanitizedData = {
      ...transactionData,
      status: 'pending',
      createdAt: Timestamp.now()
    };
    await setDoc(newTransactionRef, sanitizedData);
    return newTransactionRef.id;
  }

  static async updateTransactionStatus(transactionId, status) {
    const transactionRef = doc(db, 'transactions', transactionId);
    await updateDoc(transactionRef, {
      status,
      updatedAt: Timestamp.now()
    });
  }
}

export default DatabaseService;
