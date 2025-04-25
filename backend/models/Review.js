const mongoose = require('mongoose');

const ratingCriteriaSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
});

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem',
    required: true
  },
  type: {
    type: String,
    enum: ['guest_to_host', 'host_to_guest'],
    required: true
  },
  ratings: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    criteria: [ratingCriteriaSchema]
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  photos: [{
    url: String,
    caption: String
  }],
  response: {
    content: String,
    createdAt: Date
  },
  flags: [{
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'other']
    },
    description: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'published', 'hidden', 'removed'],
    default: 'pending'
  },
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
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

// Define rating criteria for different review types
const ratingCriteria = {
  guest_to_host: [
    'item_accuracy',
    'item_quality',
    'communication',
    'pickup_dropoff',
    'value'
  ],
  host_to_guest: [
    'communication',
    'cleanliness',
    'rules_respect',
    'return_condition',
    'timeliness'
  ]
};

// Validate rating criteria based on review type
reviewSchema.pre('save', function(next) {
  const requiredCriteria = ratingCriteria[this.type];
  
  // Ensure all required criteria are present
  const hasAllCriteria = requiredCriteria.every(required =>
    this.ratings.criteria.some(criterion => criterion.category === required)
  );
  
  if (!hasAllCriteria) {
    next(new Error(`Missing required rating criteria for ${this.type}`));
    return;
  }
  
  // Calculate overall rating as average of criteria
  const sum = this.ratings.criteria.reduce((acc, curr) => acc + curr.score, 0);
  this.ratings.overall = Math.round((sum / this.ratings.criteria.length) * 10) / 10;
  
  this.updatedAt = new Date();
  next();
});

// Update user and item statistics after review is published
reviewSchema.post('save', async function(doc) {
  if (doc.status === 'published') {
    const User = mongoose.model('User');
    const ClothingItem = mongoose.model('ClothingItem');
    
    // Update reviewee's stats
    const reviewee = await User.findById(doc.reviewee);
    if (reviewee) {
      const reviews = await this.model('Review')
        .find({ 
          reviewee: doc.reviewee,
          status: 'published'
        });
      
      const totalRatings = reviews.reduce((acc, review) => acc + review.ratings.overall, 0);
      reviewee.stats.averageRating = Math.round((totalRatings / reviews.length) * 10) / 10;
      await reviewee.save();
    }
    
    // Update item's stats if it's a guest review
    if (doc.type === 'guest_to_host') {
      const item = await ClothingItem.findById(doc.item);
      if (item) {
        const itemReviews = await this.model('Review')
          .find({
            item: doc.item,
            type: 'guest_to_host',
            status: 'published'
          });
        
        const totalItemRatings = itemReviews.reduce((acc, review) => acc + review.ratings.overall, 0);
        item.stats.averageRating = Math.round((totalItemRatings / itemReviews.length) * 10) / 10;
        item.stats.totalReviews = itemReviews.length;
        await item.save();
      }
    }
  }
});

module.exports = mongoose.model('Review', reviewSchema);
