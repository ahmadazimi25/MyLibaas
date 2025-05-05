import { db, storage } from '../services/firebase/firebaseConfig';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class ListingReviewService {
  static async validateImage(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const validation = {
          resolution: {
            passed: img.width >= 1920 && img.height >= 1080,
            message: 'Image must be at least 1920x1080 pixels'
          },
          fileSize: {
            passed: file.size <= 5 * 1024 * 1024, // 5MB
            message: 'Image must be under 5MB'
          }
        };
        resolve(validation);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  static async uploadListingImage(file, listingId, photoType) {
    const imageValidation = await this.validateImage(file);
    if (!imageValidation.resolution.passed || !imageValidation.fileSize.passed) {
      throw new Error('Image validation failed');
    }

    const storageRef = ref(storage, `listings/${listingId}/${photoType}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    return {
      url,
      type: photoType,
      width: imageValidation.width,
      height: imageValidation.height,
      size: file.size
    };
  }

  static validateDescription(description) {
    const minLength = 100;
    const requiredFields = [
      'title',
      'description',
      'category',
      'brand',
      'size',
      'color',
      'fabric',
      'measurements',
      'careInstructions',
      'originalPrice'
    ];

    return {
      length: {
        passed: description.length >= minLength,
        message: `Description must be at least ${minLength} characters`
      },
      requiredFields: {
        passed: requiredFields.every(field => description[field]),
        message: 'All required fields must be filled'
      }
    };
  }

  static validatePricing(pricing, originalPrice) {
    const maxDailyRentalPercent = 15; // 15% of original price
    const maxRentalPrice = (originalPrice * maxDailyRentalPercent) / 100;

    return {
      passed: pricing.daily <= maxRentalPrice,
      message: `Daily rental price cannot exceed ${maxDailyRentalPercent}% of original price`
    };
  }

  static async performAutomatedChecks(listing) {
    const checks = {
      photoCount: {
        passed: listing.photos.length >= 4,
        message: 'Minimum 4 photos required'
      },
      photoQuality: {
        resolution: { passed: true, message: '' },
        fileSize: { passed: true, message: '' },
        lighting: { passed: true, message: '' }, // Would require ML for accurate check
        background: { passed: true, message: '' } // Would require ML for accurate check
      },
      descriptionQuality: this.validateDescription(listing.details),
      pricingValidation: this.validatePricing(listing.pricing, listing.details.originalPrice)
    };

    // Update listing status based on checks
    const allChecksPassed = Object.values(checks).every(check => 
      typeof check === 'object' 
        ? Object.values(check).every(subCheck => subCheck.passed)
        : check.passed
    );

    return {
      checks,
      status: allChecksPassed ? 'in_review' : 'needs_changes'
    };
  }

  static calculateQualityScore(listing) {
    let score = 0;
    const weights = {
      photos: 40,
      description: 30,
      condition: 20,
      safety: 10
    };

    // Photo score (40 points max)
    const photoScore = Math.min(listing.photos.length * 8, 40);
    score += photoScore;

    // Description score (30 points max)
    const descLength = listing.details.description.length;
    const descScore = Math.min(descLength / 20, 30);
    score += descScore;

    // Condition score (20 points max)
    const conditionScores = {
      new: 20,
      like_new: 18,
      excellent: 15,
      good: 12,
      fair: 8
    };
    score += conditionScores[listing.details.condition] || 0;

    // Safety score (10 points max)
    if (listing.safetyInfo.allergenFree) score += 5;
    if (listing.safetyInfo.storageMethod) score += 5;

    return Math.round(score);
  }

  static async submitForReview(listingId) {
    const listingRef = doc(db, 'listings', listingId);
    const listing = (await getDoc(listingRef)).data();

    const { checks, status } = await this.performAutomatedChecks(listing);
    const qualityScore = this.calculateQualityScore(listing);

    await updateDoc(listingRef, {
      status,
      automatedChecks: checks,
      qualityScore,
      updated: new Date()
    });

    return { status, checks, qualityScore };
  }

  static async approveListing(listingId, moderatorReview) {
    const listingRef = doc(db, 'listings', listingId);
    
    await updateDoc(listingRef, {
      status: 'approved',
      moderatorReview: {
        ...moderatorReview,
        timestamp: new Date()
      },
      published: new Date(),
      updated: new Date()
    });
  }

  static async rejectListing(listingId, moderatorReview) {
    const listingRef = doc(db, 'listings', listingId);
    
    await updateDoc(listingRef, {
      status: 'rejected',
      moderatorReview: {
        ...moderatorReview,
        timestamp: new Date()
      },
      updated: new Date()
    });
  }

  static async requestChanges(listingId, moderatorReview) {
    const listingRef = doc(db, 'listings', listingId);
    
    await updateDoc(listingRef, {
      status: 'needs_changes',
      moderatorReview: {
        ...moderatorReview,
        timestamp: new Date()
      },
      updated: new Date()
    });
  }
}

export default ListingReviewService;
