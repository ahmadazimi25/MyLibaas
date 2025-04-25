/**
 * @typedef {Object} Address
 * @property {string} street
 * @property {string} city
 * @property {string} province
 * @property {string} postalCode
 * @property {string} country - Will always be "Canada"
 */

/**
 * @typedef {Object} Size
 * @property {string} category - Women's, Men's, Kids'
 * @property {string} standard - Standard size (S, M, L, XL, etc. or numeric)
 * @property {Object} measurements
 * @property {number} measurements.bust - in centimeters
 * @property {number} measurements.waist - in centimeters
 * @property {number} measurements.hips - in centimeters
 * @property {number} measurements.length - in centimeters
 * @property {string} [measurements.inseam] - in centimeters, for pants
 */

/**
 * @typedef {Object} PricingDetails
 * @property {number} dailyRate
 * @property {number} weeklyRate
 * @property {number} eventRate - 3-4 day rate
 * @property {number} securityDeposit
 * @property {number} cleaningFee
 */

/**
 * @typedef {Object} ShippingOption
 * @property {boolean} localPickup
 * @property {boolean} shipping
 * @property {number} [shippingFee]
 * @property {string[]} availableProvinces
 */

/**
 * @typedef {Object} Condition
 * @property {'New'|'Like New'|'Very Good'|'Good'|'Fair'} rating
 * @property {boolean} altered
 * @property {string} alterationDetails
 * @property {Date} lastCleaned
 * @property {string[]} flaws
 */

/**
 * @typedef {Object} Availability
 * @property {Date} startDate
 * @property {Date} endDate
 * @property {boolean} isBooked
 */

/**
 * @typedef {Object} ListingImage
 * @property {string} url
 * @property {string} alt
 * @property {boolean} isPrimary
 */

/**
 * @typedef {Object} Listing
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category - Dress, Suit, etc.
 * @property {string[]} occasion - Wedding, Party, Business, etc.
 * @property {string[]} style - Modern, Traditional, etc.
 * @property {string} season
 * @property {string} brand
 * @property {Size} size
 * @property {PricingDetails} pricing
 * @property {ShippingOption} shipping
 * @property {Condition} condition
 * @property {ListingImage[]} images
 * @property {Availability[]} availability
 * @property {string} lenderId
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {Address} address
 * @property {boolean} isVerified
 * @property {boolean} isLender
 * @property {'Individual'|'Business'} [lenderType]
 * @property {string} [businessName]
 * @property {number} rating
 * @property {number} responseRate
 * @property {Size[]} [preferredSizes]
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} reviewerId
 * @property {string} targetId - ID of user or listing being reviewed
 * @property {'User'|'Listing'} targetType
 * @property {number} rating - 1 to 5
 * @property {string} comment
 * @property {Date} createdAt
 */

export const PROVINCES = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Nova Scotia',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Northwest Territories',
  'Nunavut',
  'Yukon'
];

export const CATEGORIES = [
  'Dresses',
  'Suits',
  'Formal Wear',
  'Traditional Wear',
  'Accessories',
  'Outerwear',
  'Evening Wear',
  'Business Attire'
];

export const OCCASIONS = [
  'Wedding',
  'Party',
  'Business',
  'Casual',
  'Formal',
  'Cultural Event',
  'Prom',
  'Graduation'
];

export const SEASONS = [
  'Spring',
  'Summer',
  'Fall',
  'Winter',
  'All Season'
];

export const CONDITION_RATINGS = [
  'New',
  'Like New',
  'Very Good',
  'Good',
  'Fair'
];
