const mongoose = require('mongoose');

const cancellationPolicySchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rules: [{
    timeFrame: {
      type: String,
      enum: ['before_pickup', 'after_pickup', 'during_rental'],
      required: true
    },
    hoursThreshold: {
      type: Number,
      required: true
    },
    refundPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    refundItems: [{
      type: String,
      enum: ['rental_fee', 'service_fee', 'deposit', 'insurance']
    }]
  }],
  hostPayout: {
    conditions: [{
      timeFrame: String,
      percentage: Number
    }]
  },
  active: {
    type: Boolean,
    default: true
  },
  defaultFor: [{
    itemCategory: String,
    rentalDuration: {
      min: Number,
      max: Number
    },
    price: {
      min: Number,
      max: Number
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Example policies
const defaultPolicies = [
  {
    name: 'flexible',
    description: 'Full refund up to 24 hours before pickup, no refund afterward',
    rules: [
      {
        timeFrame: 'before_pickup',
        hoursThreshold: 24,
        refundPercentage: 100,
        refundItems: ['rental_fee', 'service_fee', 'insurance']
      },
      {
        timeFrame: 'before_pickup',
        hoursThreshold: 0,
        refundPercentage: 0,
        refundItems: []
      }
    ],
    hostPayout: {
      conditions: [
        { timeFrame: '24h_before', percentage: 0 },
        { timeFrame: 'after_pickup', percentage: 100 }
      ]
    }
  },
  {
    name: 'moderate',
    description: 'Full refund up to 72 hours before pickup, 50% refund up to 24 hours before pickup',
    rules: [
      {
        timeFrame: 'before_pickup',
        hoursThreshold: 72,
        refundPercentage: 100,
        refundItems: ['rental_fee', 'service_fee', 'insurance']
      },
      {
        timeFrame: 'before_pickup',
        hoursThreshold: 24,
        refundPercentage: 50,
        refundItems: ['rental_fee']
      }
    ],
    hostPayout: {
      conditions: [
        { timeFrame: '72h_before', percentage: 0 },
        { timeFrame: '24h_before', percentage: 50 },
        { timeFrame: 'after_pickup', percentage: 100 }
      ]
    }
  },
  {
    name: 'strict',
    description: 'Full refund up to 5 days before pickup, 50% refund up to 72 hours before pickup',
    rules: [
      {
        timeFrame: 'before_pickup',
        hoursThreshold: 120,
        refundPercentage: 100,
        refundItems: ['rental_fee', 'service_fee', 'insurance']
      },
      {
        timeFrame: 'before_pickup',
        hoursThreshold: 72,
        refundPercentage: 50,
        refundItems: ['rental_fee']
      }
    ],
    hostPayout: {
      conditions: [
        { timeFrame: '120h_before', percentage: 0 },
        { timeFrame: '72h_before', percentage: 50 },
        { timeFrame: 'after_pickup', percentage: 100 }
      ]
    }
  }
];

// Calculate refund amount based on cancellation time
cancellationPolicySchema.methods.calculateRefund = function(booking, cancellationTime) {
  const hoursBeforePickup = (booking.startDate - cancellationTime) / (1000 * 60 * 60);
  
  // Find applicable rule
  const rule = this.rules
    .filter(r => r.timeFrame === 'before_pickup' && hoursBeforePickup >= r.hoursThreshold)
    .sort((a, b) => b.hoursThreshold - a.hoursThreshold)[0];

  if (!rule) {
    return 0;
  }

  let refundAmount = 0;
  
  rule.refundItems.forEach(item => {
    switch (item) {
      case 'rental_fee':
        refundAmount += booking.pricing.basePrice * (rule.refundPercentage / 100);
        break;
      case 'service_fee':
        refundAmount += booking.pricing.serviceFee.guest;
        break;
      case 'insurance':
        refundAmount += booking.insurance.cost;
        break;
    }
  });

  // Deposit is always refunded
  refundAmount += booking.pricing.deposit;

  return Math.round(refundAmount * 100) / 100;
};

// Calculate host payout for cancellation
cancellationPolicySchema.methods.calculateHostPayout = function(booking, cancellationTime) {
  const hoursBeforePickup = (booking.startDate - cancellationTime) / (1000 * 60 * 60);
  
  const condition = this.hostPayout.conditions
    .filter(c => {
      switch (c.timeFrame) {
        case '120h_before':
          return hoursBeforePickup >= 120;
        case '72h_before':
          return hoursBeforePickup >= 72;
        case '24h_before':
          return hoursBeforePickup >= 24;
        case 'after_pickup':
          return hoursBeforePickup < 0;
        default:
          return false;
      }
    })
    .sort((a, b) => {
      const timeFrameOrder = {
        '120h_before': 1,
        '72h_before': 2,
        '24h_before': 3,
        'after_pickup': 4
      };
      return timeFrameOrder[a.timeFrame] - timeFrameOrder[b.timeFrame];
    })[0];

  if (!condition) {
    return 0;
  }

  return Math.round(booking.pricing.basePrice * (condition.percentage / 100) * 100) / 100;
};

const CancellationPolicy = mongoose.model('CancellationPolicy', cancellationPolicySchema);

// Initialize default policies if they don't exist
CancellationPolicy.insertMany(defaultPolicies).catch(err => {
  if (err.code !== 11000) { // Ignore duplicate key errors
    console.error('Error initializing cancellation policies:', err);
  }
});

module.exports = CancellationPolicy;
