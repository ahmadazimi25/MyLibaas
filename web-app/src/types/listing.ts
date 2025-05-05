export type ListingStatus = 
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'needs_changes'
  | 'approved'
  | 'rejected';

export interface ListingPhoto {
  url: string;
  type: 'front' | 'back' | 'detail' | 'tag' | 'other';
  width: number;
  height: number;
  size: number; // in bytes
}

export interface ListingMeasurements {
  bust?: number;
  waist?: number;
  hips?: number;
  length?: number;
  shoulders?: number;
  sleeves?: number;
  inseam?: number;
}

export interface ListingDetails {
  title: string;
  description: string;
  category: string;
  subCategory: string;
  brand: string;
  size: string;
  color: string;
  fabric: string;
  measurements: ListingMeasurements;
  careInstructions: string;
  originalPrice: number;
  itemAge: string; // e.g., "0-3 months", "3-6 months", "6-12 months", "1-2 years", "2+ years"
  condition: 'new' | 'like_new' | 'excellent' | 'good' | 'fair';
}

export interface ListingPricing {
  rentalPrice: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  securityDeposit: number;
  insuranceRequired: boolean;
}

export interface ListingSafetyInfo {
  allergenFree: boolean;
  allergenNotes?: string;
  storageMethod: string;
}

export interface AutomatedCheckResult {
  passed: boolean;
  message: string;
}

export interface ListingAutomatedChecks {
  photoCount: AutomatedCheckResult;
  photoQuality: {
    resolution: AutomatedCheckResult;
    fileSize: AutomatedCheckResult;
    lighting: AutomatedCheckResult;
    background: AutomatedCheckResult;
  };
  descriptionQuality: {
    length: AutomatedCheckResult;
    requiredFields: AutomatedCheckResult;
  };
  pricingValidation: AutomatedCheckResult;
}

export interface ModeratorReview {
  reviewerId: string;
  timestamp: Date;
  status: ListingStatus;
  notes: string;
  checklist: {
    photoAuthenticity: boolean;
    itemCondition: boolean;
    priceFairness: boolean;
    descriptionAccuracy: boolean;
    safetyCompliance: boolean;
  };
}

export interface Listing {
  id: string;
  userId: string;
  status: ListingStatus;
  details: ListingDetails;
  photos: ListingPhoto[];
  pricing: ListingPricing;
  safetyInfo: ListingSafetyInfo;
  automatedChecks?: ListingAutomatedChecks;
  moderatorReview?: ModeratorReview;
  qualityScore: number;
  created: Date;
  updated: Date;
  published?: Date;
}
