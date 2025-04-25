import { db } from '../firebase/config';

class CommissionService {
  constructor() {
    this.commissionRate = 0.20; // 20% commission
    this.minimumRental = 10; // Minimum rental amount in dollars
  }

  calculateCommission(rentalAmount) {
    if (rentalAmount < this.minimumRental) {
      throw new Error(`Rental amount must be at least $${this.minimumRental}`);
    }

    const commission = rentalAmount * this.commissionRate;
    const lenderAmount = rentalAmount - commission;

    return {
      total: rentalAmount,
      commission: commission,
      lenderAmount: lenderAmount,
      commissionRate: this.commissionRate * 100 + '%'
    };
  }

  async processPayment(bookingId, paymentDetails) {
    try {
      const { total, commission, lenderAmount } = this.calculateCommission(paymentDetails.amount);

      // Record the transaction
      await db.collection('transactions').add({
        bookingId,
        timestamp: new Date(),
        total,
        commission,
        lenderAmount,
        status: 'completed',
        paymentId: paymentDetails.paymentId,
        lenderId: paymentDetails.lenderId,
        renterId: paymentDetails.renterId
      });

      // Update lender's balance
      await db.collection('users').doc(paymentDetails.lenderId).update({
        pendingBalance: firebase.firestore.FieldValue.increment(lenderAmount)
      });

      return {
        success: true,
        transactionDetails: {
          total,
          commission,
          lenderAmount,
          timestamp: new Date()
        }
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async getLenderEarnings(lenderId) {
    try {
      const snapshot = await db.collection('transactions')
        .where('lenderId', '==', lenderId)
        .get();

      const earnings = {
        total: 0,
        commission: 0,
        lenderAmount: 0,
        transactions: []
      };

      snapshot.forEach(doc => {
        const transaction = doc.data();
        earnings.total += transaction.total;
        earnings.commission += transaction.commission;
        earnings.lenderAmount += transaction.lenderAmount;
        earnings.transactions.push({
          id: doc.id,
          ...transaction
        });
      });

      return earnings;
    } catch (error) {
      console.error('Error getting lender earnings:', error);
      throw error;
    }
  }

  async getPlatformEarnings(startDate, endDate) {
    try {
      let query = db.collection('transactions');
      
      if (startDate && endDate) {
        query = query.where('timestamp', '>=', startDate)
                    .where('timestamp', '<=', endDate);
      }

      const snapshot = await query.get();
      
      const earnings = {
        totalTransactions: 0,
        totalCommission: 0,
        totalVolume: 0,
        transactions: []
      };

      snapshot.forEach(doc => {
        const transaction = doc.data();
        earnings.totalTransactions++;
        earnings.totalCommission += transaction.commission;
        earnings.totalVolume += transaction.total;
        earnings.transactions.push({
          id: doc.id,
          ...transaction
        });
      });

      return earnings;
    } catch (error) {
      console.error('Error getting platform earnings:', error);
      throw error;
    }
  }
}

export default new CommissionService();
