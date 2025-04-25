const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['id', 'phone', 'email', 'social'],
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  documentUrl: String
});

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    phone: String,
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address'
    }
  },
  verifications: [verificationSchema],
  verificationStatus: {
    type: String,
    enum: ['none', 'pending', 'basic', 'verified'],
    default: 'none'
  },
  trustScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  roles: {
    type: [String],
    enum: ['user', 'admin', 'moderator'],
    default: ['user']
  },
  preferences: {
    notifications: {
      email: {
        marketing: { type: Boolean, default: true },
        rentals: { type: Boolean, default: true },
        messages: { type: Boolean, default: true }
      },
      push: {
        marketing: { type: Boolean, default: true },
        rentals: { type: Boolean, default: true },
        messages: { type: Boolean, default: true }
      }
    },
    calendar: {
      provider: {
        type: String,
        enum: ['google', 'apple', 'outlook', null],
        default: null
      },
      syncEnabled: {
        type: Boolean,
        default: false
      }
    }
  },
  stats: {
    totalListings: { type: Number, default: 0 },
    totalRentals: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }
  },
  reports: [{
    type: {
      type: String,
      enum: ['inappropriate', 'spam', 'scam', 'other'],
      required: true
    },
    description: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update verification status based on verifications
UserSchema.pre('save', function(next) {
  const verifiedCount = this.verifications.filter(v => v.verified).length;
  
  if (verifiedCount === 0) {
    this.verificationStatus = 'none';
  } else if (verifiedCount === 1) {
    this.verificationStatus = 'basic';
  } else {
    this.verificationStatus = 'verified';
  }

  // Calculate trust score (example algorithm)
  this.trustScore = Math.min(100, 
    (verifiedCount * 20) + 
    (this.stats.totalRentals * 2) + 
    (this.stats.averageRating * 10)
  );

  next();
});

module.exports = mongoose.model('User', UserSchema);
