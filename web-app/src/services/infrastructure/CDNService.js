import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, Timestamp } from 'firebase/firestore';
import { storage } from '../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

class CDNService {
  static CDN_TYPES = {
    IMAGE: 'image',
    VIDEO: 'video',
    STATIC: 'static',
    DOCUMENT: 'document'
  };

  static REGIONS = {
    NA: 'north-america',
    EU: 'europe',
    ASIA: 'asia',
    AU: 'australia'
  };

  static async initialize() {
    try {
      // Initialize CDN configuration
      await Promise.all([
        this.initializeImageCDN(),
        this.initializeVideoCDN(),
        this.initializeStaticCDN(),
        this.initializeRegionalEndpoints()
      ]);

      return { success: true, message: 'CDN initialized' };
    } catch (error) {
      console.error('Error initializing CDN:', error);
      throw error;
    }
  }

  static async uploadToCDN(file, type, options = {}) {
    try {
      // Validate file
      await this.validateFile(file, type);

      // Optimize file based on type
      const optimizedFile = await this.optimizeFile(file, type);

      // Determine best region
      const region = await this.determineOptimalRegion();

      // Upload to Firebase Storage with CDN configuration
      const path = this.generateCDNPath(type, options);
      const storageRef = ref(storage, path);
      
      // Upload with metadata
      const metadata = {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
        customMetadata: {
          originalName: file.name,
          optimized: 'true',
          region
        }
      };

      const snapshot = await uploadBytes(storageRef, optimizedFile, metadata);
      const url = await getDownloadURL(snapshot.ref);

      // Store CDN record
      await this.storeCDNRecord(url, type, options);

      return {
        url,
        path,
        region,
        metadata: snapshot.metadata
      };
    } catch (error) {
      console.error('Error uploading to CDN:', error);
      throw error;
    }
  }

  static async optimizeFile(file, type) {
    switch (type) {
      case this.CDN_TYPES.IMAGE:
        return this.optimizeImage(file);
      case this.CDN_TYPES.VIDEO:
        return this.optimizeVideo(file);
      case this.CDN_TYPES.STATIC:
        return this.optimizeStatic(file);
      case this.CDN_TYPES.DOCUMENT:
        return this.optimizeDocument(file);
      default:
        return file;
    }
  }

  static async optimizeImage(file) {
    try {
      const sharp = require('sharp');
      const buffer = await file.arrayBuffer();

      // Create multiple sizes
      const sizes = [
        { width: 320, height: 240 },
        { width: 640, height: 480 },
        { width: 1280, height: 960 },
        { width: 1920, height: 1440 }
      ];

      const optimizedImages = await Promise.all(
        sizes.map(size =>
          sharp(buffer)
            .resize(size.width, size.height, { fit: 'inside' })
            .webp({ quality: 80 })
            .toBuffer()
        )
      );

      return {
        original: file,
        sizes: optimizedImages
      };
    } catch (error) {
      console.error('Error optimizing image:', error);
      return file;
    }
  }

  static async optimizeVideo(file) {
    try {
      const ffmpeg = require('ffmpeg');
      const video = await ffmpeg(file.path);

      // Generate multiple formats and qualities
      await Promise.all([
        video.setVideoFormat('mp4'),
        video.setVideoCodec('libx264'),
        video.setVideoQuality(720)
      ]);

      return video.save();
    } catch (error) {
      console.error('Error optimizing video:', error);
      return file;
    }
  }

  static async determineOptimalRegion() {
    try {
      // Get user's location
      const response = await fetch('https://api.ipapi.com/check');
      const location = await response.json();

      // Map location to nearest CDN region
      return this.mapLocationToRegion(location);
    } catch (error) {
      console.error('Error determining region:', error);
      return this.REGIONS.NA; // Default to North America
    }
  }

  static mapLocationToRegion(location) {
    const continent = location.continent_code;
    switch (continent) {
      case 'NA':
        return this.REGIONS.NA;
      case 'EU':
        return this.REGIONS.EU;
      case 'AS':
        return this.REGIONS.ASIA;
      case 'OC':
        return this.REGIONS.AU;
      default:
        return this.REGIONS.NA;
    }
  }

  static generateCDNPath(type, options) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `cdn/${type}/${timestamp}_${random}`;
  }

  static async validateFile(file, type) {
    // Check file size
    const maxSizes = {
      [this.CDN_TYPES.IMAGE]: 5 * 1024 * 1024, // 5MB
      [this.CDN_TYPES.VIDEO]: 100 * 1024 * 1024, // 100MB
      [this.CDN_TYPES.STATIC]: 10 * 1024 * 1024, // 10MB
      [this.CDN_TYPES.DOCUMENT]: 20 * 1024 * 1024 // 20MB
    };

    if (file.size > maxSizes[type]) {
      throw new Error(`File size exceeds maximum allowed for ${type}`);
    }

    // Check file type
    const allowedTypes = {
      [this.CDN_TYPES.IMAGE]: ['image/jpeg', 'image/png', 'image/webp'],
      [this.CDN_TYPES.VIDEO]: ['video/mp4', 'video/webm'],
      [this.CDN_TYPES.STATIC]: ['text/javascript', 'text/css', 'text/html'],
      [this.CDN_TYPES.DOCUMENT]: ['application/pdf', 'application/msword']
    };

    if (!allowedTypes[type].includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed for ${type}`);
    }
  }

  static async storeCDNRecord(url, type, options) {
    try {
      await setDoc(doc(collection(db, 'cdn'), `${type}_${Date.now()}`), {
        url,
        type,
        options,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error storing CDN record:', error);
    }
  }

  // Cache Management
  static async invalidateCache(pattern) {
    try {
      // Implement cache invalidation logic
      await this.purgeCloudFlareCDN(pattern);
      await this.updateCacheVersion();
      
      return { success: true, message: 'Cache invalidated' };
    } catch (error) {
      console.error('Error invalidating cache:', error);
      throw error;
    }
  }

  static async purgeCloudFlareCDN(pattern) {
    try {
      const response = await fetch('https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: [pattern]
        })
      });

      return response.json();
    } catch (error) {
      console.error('Error purging CloudFlare cache:', error);
      throw error;
    }
  }

  static async updateCacheVersion() {
    try {
      await setDoc(doc(db, 'cdn', 'version'), {
        version: Date.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating cache version:', error);
    }
  }
}

export default CDNService;
