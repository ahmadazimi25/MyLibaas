const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['rental', 'deposit', 'service_fee', 'tax', 'insurance', 'refund'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal'],
    required: true
  },
  transactionId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const bookingSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem',
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'picked_up',
      'in_use',
      'returned',
      'completed',
      'cancelled',
      'declined'
    ],
    default: 'pending'
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    deposit: {
      type: Number,
      required: true
    },
    serviceFee: {
      guest: Number,
      host: Number
    },
    tax: Number,
    insurance: Number,
    total: Number
  },
  payments: [paymentSchema],
  delivery: {
    method: {
      type: String,
      enum: ['pickup', 'shipping', 'local_delivery'],
      required: true
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address'
    },
    instructions: String,
    trackingNumber: String,
    cost: Number
  },
  insurance: {
    type: {
      type: String,
      enum: ['basic', 'premium', 'none'],
      default: 'basic'
    },
    coverage: Number,
    cost: Number,
    terms: String
  },
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    cancelledAt: Date,
    refundAmount: Number,
    policy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    }
  },
  timeline: [{
    status: {
      type: String,
      enum: [
        'booking_created',
        'payment_completed',
        'host_confirmed',
        'picked_up',
        'in_use',
        'return_reminder',
        'returned',
        'completed',
        'cancelled',
        'declined'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  review: {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total booking amount
bookingSchema.methods.calculateTotal = async function() {
  const ServiceFee = mongoose.model('ServiceFee');
  
  // Get service fees
  const guestFee = await ServiceFee.findOne({ type: 'guest', active: true });
  const hostFee = await ServiceFee.findOne({ type: 'host', active: true });
  
  // Calculate rental duration in days
  const days = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  
  // Calculate base rental amount
  const baseAmount = this.pricing.basePrice * days;
  
  // Calculate fees
  this.pricing.serviceFee = {
    guest: guestFee ? guestFee.calculateFee(baseAmount) : 0,
    host: hostFee ? hostFee.calculateFee(baseAmount) : 0
  };
  
  // Calculate tax (example: 13% HST)
  this.pricing.tax = Math.round(baseAmount * 0.13 * 100) / 100;
  
  // Calculate insurance cost based on type
  if (this.insurance.type === 'premium') {
    this.insurance.cost = Math.round(baseAmount * 0.10 * 100) / 100;
    this.insurance.coverage = baseAmount * 2;
  } else if (this.insurance.type === 'basic') {
    this.insurance.cost = Math.round(baseAmount * 0.05 * 100) / 100;
    this.insurance.coverage = baseAmount;
  }
  
  // Calculate total
  this.pricing.total = 
    baseAmount + 
    this.pricing.deposit +
    this.pricing.serviceFee.guest +
    this.pricing.tax +
    this.insurance.cost +
    (this.delivery.cost || 0);
    
  return this.pricing.total;
};

// Update booking status and timeline
bookingSchema.methods.updateStatus = function(newStatus, note) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    note: note
  });
  return this.save();
};

// Check if booking can be cancelled
bookingSchema.methods.canCancel = function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  
  const now = new Date();
  const hoursUntilStart = (this.startDate - now) / (1000 * 60 * 60);
  
  switch (this.cancellation.policy) {
    case 'flexible':
      return hoursUntilStart >= 24;
    case 'moderate':
      return hoursUntilStart >= 72;
    case 'strict':
      return hoursUntilStart >= 120;
    default:
      return false;
  }
};

// Calculate refund amount based on cancellation policy
bookingSchema.methods.calculateRefund = function() {
  const now = new Date();
  const hoursUntilStart = (this.startDate - now) / (1000 * 60 * 60);
  let refundPercentage = 0;
  
  switch (this.cancellation.policy) {
    case 'flexible':
      if (hoursUntilStart >= 24) {
        refundPercentage = 100;
      }
      break;
    case 'moderate':
      if (hoursUntilStart >= 72) {
        refundPercentage = 100;
      } else if (hoursUntilStart >= 24) {
        refundPercentage = 50;
      }
      break;
    case 'strict':
      if (hoursUntilStart >= 120) {
        refundPercentage = 100;
      } else if (hoursUntilStart >= 72) {
        refundPercentage = 50;
      }
      break;
  }
  
  return Math.round((this.pricing.total * (refundPercentage / 100)) * 100) / 100;
};

module.exports = mongoose.model('Booking', bookingSchema);
