const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String,
  photos: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const rentalHistorySchema = new mongoose.Schema({
  user: {
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
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  review: reviewSchema
});

const clothingItemSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  deposit: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  occasion: {
    type: [String],
    required: true,
    enum: ['Wedding', 'Eid', 'Party', 'Casual', 'Traditional']
  },
  style: {
    type: [String],
    required: true,
    enum: ['Afghan', 'Pakistani', 'Arabic', 'Boho', 'Modern']
  },
  color: {
    type: [String],
    required: true
  },
  fabric: {
    type: String,
    required: true
  },
  modestWear: {
    type: Boolean,
    default: false
  },
  minRentalDays: {
    type: Number,
    required: true,
    default: 3
  },
  maxRentalDays: {
    type: Number,
    required: true,
    default: 14
  },
  availability: [{
    startDate: Date,
    endDate: Date
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: String
  },
  deliveryOptions: {
    shipping: {
      type: Boolean,
      default: true
    },
    pickup: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalRentals: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  rentalHistory: [rentalHistorySchema],
  reviews: [reviewSchema],
  featured: {
    type: Boolean,
    default: false
  },
  collection: {
    type: String,
    default: null
  },
  sustainabilityMetrics: {
    waterSaved: Number,
    carbonSaved: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
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

// Add indexes for better search performance
clothingItemSchema.index({ 
  title: 'text', 
  description: 'text',
  occasion: 1,
  style: 1,
  size: 1,
  color: 1,
  fabric: 1,
  modestWear: 1,
  'location.coordinates': '2dsphere'
});

// Update timestamps on save
clothingItemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate sustainability metrics before save
clothingItemSchema.pre('save', function(next) {
  // Average water usage for new clothing production (in liters)
  const avgWaterUsage = 2700;
  // Average carbon footprint for new clothing production (in kg CO2)
  const avgCarbonFootprint = 10;

  this.sustainabilityMetrics = {
    waterSaved: this.stats.totalRentals * avgWaterUsage,
    carbonSaved: this.stats.totalRentals * avgCarbonFootprint
  };

  next();
});

module.exports = mongoose.model('ClothingItem', clothingItemSchema);
