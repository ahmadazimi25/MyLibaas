class OptimizationService {
  // Image optimization settings
  static IMAGE_SETTINGS = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    thumbnailSize: 200,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
  };

  // Cache settings
  static CACHE_SETTINGS = {
    listings: 5 * 60 * 1000, // 5 minutes
    userProfiles: 10 * 60 * 1000, // 10 minutes
    reviews: 15 * 60 * 1000 // 15 minutes
  };

  static async optimizeImage(file) {
    return new Promise((resolve, reject) => {
      // Check file type
      if (!this.IMAGE_SETTINGS.acceptedTypes.includes(file.type)) {
        reject(new Error('Unsupported image type'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > this.IMAGE_SETTINGS.maxWidth) {
            height = (this.IMAGE_SETTINGS.maxWidth / width) * height;
            width = this.IMAGE_SETTINGS.maxWidth;
          }
          if (height > this.IMAGE_SETTINGS.maxHeight) {
            width = (this.IMAGE_SETTINGS.maxHeight / height) * width;
            height = this.IMAGE_SETTINGS.maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP if supported
          const quality = this.IMAGE_SETTINGS.quality;
          canvas.toBlob((blob) => {
            resolve({
              optimizedBlob: blob,
              width,
              height,
              size: blob.size
            });
          }, 'image/webp', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  static async createThumbnail(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = this.IMAGE_SETTINGS.thumbnailSize;
          
          // Maintain aspect ratio
          let width = size;
          let height = size;
          if (img.width > img.height) {
            height = (size / img.width) * img.height;
          } else {
            width = (size / img.height) * img.width;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve({
              thumbnailBlob: blob,
              width,
              height
            });
          }, 'image/webp', 0.7);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Cache management
  static cache = new Map();
  static cacheTimestamps = new Map();

  static setCacheItem(key, data, type) {
    const expiryTime = this.CACHE_SETTINGS[type] || 5 * 60 * 1000; // Default 5 minutes
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now() + expiryTime);
  }

  static getCacheItem(key) {
    const timestamp = this.cacheTimestamps.get(key);
    if (timestamp && timestamp > Date.now()) {
      return this.cache.get(key);
    }
    // Remove expired item
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
    return null;
  }

  static clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  // Query optimization
  static optimizeQuery(query = {}) {
    const optimizedQuery = { ...query };

    // Add pagination if not present
    if (!optimizedQuery.limit) {
      optimizedQuery.limit = 20;
    }

    // Add field selection if not present
    if (!optimizedQuery.select) {
      optimizedQuery.select = ['id', 'title', 'price', 'thumbnailUrl'];
    }

    // Add ordering if not present
    if (!optimizedQuery.orderBy) {
      optimizedQuery.orderBy = 'createdAt';
    }

    return optimizedQuery;
  }
}

export default OptimizationService;
