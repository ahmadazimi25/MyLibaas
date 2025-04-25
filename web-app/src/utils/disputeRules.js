// Dispute resolution rules engine
const LATE_RETURN_PENALTY_RATE = 1.5; // 1.5x daily rate for late returns
const MAX_AUTO_REFUND_AMOUNT = 500; // Maximum amount for automatic refunds
const MINOR_DAMAGE_THRESHOLD = 100; // Threshold for minor damage in dollars

export const disputeRules = {
  // Late return rules
  lateReturn: {
    calculatePenalty: (dailyRate, daysLate) => {
      return dailyRate * LATE_RETURN_PENALTY_RATE * daysLate;
    },
    canAutoResolve: (daysLate, penalty) => {
      return daysLate <= 3 && penalty <= MAX_AUTO_REFUND_AMOUNT;
    },
    getResolution: (daysLate, penalty) => ({
      type: 'late_return',
      action: 'charge_penalty',
      amount: penalty,
      description: `Late return fee for ${daysLate} days`
    })
  },

  // Cancellation rules
  cancellation: {
    getRefundAmount: (bookingAmount, daysBeforeStart) => {
      if (daysBeforeStart >= 7) return bookingAmount; // Full refund
      if (daysBeforeStart >= 3) return bookingAmount * 0.5; // 50% refund
      return 0; // No refund
    },
    canAutoResolve: (daysBeforeStart) => {
      return daysBeforeStart >= 3; // Auto-resolve if cancelled 3+ days before
    },
    getResolution: (bookingAmount, daysBeforeStart) => {
      const refundAmount = this.getRefundAmount(bookingAmount, daysBeforeStart);
      return {
        type: 'cancellation',
        action: 'process_refund',
        amount: refundAmount,
        description: `Cancellation refund (${daysBeforeStart} days before start)`
      };
    }
  },

  // Item condition rules
  itemCondition: {
    assessDamage: (reportedDamage) => {
      const { type, estimatedCost, evidence } = reportedDamage;
      
      // Require evidence for any damage claim
      if (!evidence || evidence.length === 0) {
        return { requiresReview: true, reason: 'No evidence provided' };
      }

      // Auto-approve minor damages with clear evidence
      if (estimatedCost <= MINOR_DAMAGE_THRESHOLD && evidence.length >= 2) {
        return {
          canAutoResolve: true,
          resolution: {
            type: 'damage',
            action: 'charge_damage_fee',
            amount: estimatedCost,
            description: `Damage fee for ${type}`
          }
        };
      }

      return { requiresReview: true, reason: 'Damage exceeds auto-resolution threshold' };
    }
  },

  // Payment dispute rules
  payment: {
    canAutoResolve: (amount, evidence) => {
      return amount <= MAX_AUTO_REFUND_AMOUNT && evidence && evidence.length > 0;
    },
    getResolution: (amount, reason) => ({
      type: 'payment',
      action: 'process_refund',
      amount,
      description: `Payment dispute resolution: ${reason}`
    })
  },

  // General dispute assessment
  assessDispute: (dispute) => {
    const {
      type,
      amount,
      evidence,
      daysBeforeStart,
      daysLate,
      damageReport,
      bookingAmount
    } = dispute;

    switch (type) {
      case 'late_return':
        const penalty = disputeRules.lateReturn.calculatePenalty(amount, daysLate);
        return {
          canAutoResolve: disputeRules.lateReturn.canAutoResolve(daysLate, penalty),
          resolution: disputeRules.lateReturn.getResolution(daysLate, penalty)
        };

      case 'cancellation':
        return {
          canAutoResolve: disputeRules.cancellation.canAutoResolve(daysBeforeStart),
          resolution: disputeRules.cancellation.getResolution(bookingAmount, daysBeforeStart)
        };

      case 'item_condition':
        return disputeRules.itemCondition.assessDamage(damageReport);

      case 'payment':
        return {
          canAutoResolve: disputeRules.payment.canAutoResolve(amount, evidence),
          resolution: disputeRules.payment.getResolution(amount, dispute.reason)
        };

      default:
        return { requiresReview: true, reason: 'Dispute type requires manual review' };
    }
  }
};
