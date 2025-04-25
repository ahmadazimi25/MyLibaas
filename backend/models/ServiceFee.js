const mongoose = require('mongoose');

const serviceFeeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['host', 'guest'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  flatFee: {
    type: Number,
    default: 0
  },
  conditions: {
    minRentalAmount: {
      type: Number,
      default: 0
    },
    maxRentalAmount: Number,
    applicableCategories: [String],
    applicableRegions: [String]
  },
  active: {
    type: Boolean,
    default: true
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

// Example fee calculation method
serviceFeeSchema.methods.calculateFee = function(rentalAmount) {
  let fee = 0;
  
  // Check if rental amount meets minimum requirement
  if (rentalAmount < this.conditions.minRentalAmount) {
    return 0;
  }

  // Calculate percentage-based fee
  if (this.percentage > 0) {
    fee += (rentalAmount * (this.percentage / 100));
  }

  // Add flat fee if applicable
  if (this.flatFee > 0) {
    fee += this.flatFee;
  }

  // Apply maximum rental amount cap if specified
  if (this.conditions.maxRentalAmount && fee > this.conditions.maxRentalAmount) {
    fee = this.conditions.maxRentalAmount;
  }

  return Math.round(fee * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model('ServiceFee', serviceFeeSchema);
