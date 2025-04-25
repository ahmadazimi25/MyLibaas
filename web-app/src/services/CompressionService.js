import { compress, decompress } from 'lz-string';

class CompressionService {
  constructor() {
    this.compressionThreshold = 1024; // 1KB
    this.imageQualityThreshold = 0.7;
  }

  async compressData(data) {
    try {
      const jsonString = JSON.stringify(data);
      
      // Only compress if data is larger than threshold
      if (jsonString.length < this.compressionThreshold) {
        return {
          data: jsonString,
          compressed: false,
          originalSize: jsonString.length,
          compressedSize: jsonString.length,
        };
      }

      const compressed = compress(jsonString);
      
      return {
        data: compressed,
        compressed: true,
        originalSize: jsonString.length,
        compressedSize: compressed.length,
      };
    } catch (error) {
      console.error('Error compressing data:', error);
      return { data, compressed: false };
    }
  }

  async decompressData(compressedData) {
    try {
      if (!compressedData.compressed) {
        return JSON.parse(compressedData.data);
      }

      const decompressed = decompress(compressedData.data);
      return JSON.parse(decompressed);
    } catch (error) {
      console.error('Error decompressing data:', error);
      return null;
    }
  }

  async compressImage(imageFile, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob
          canvas.toBlob(
            (blob) => {
              resolve({
                blob,
                width,
                height,
                originalSize: imageFile.size,
                compressedSize: blob.size,
              });
            },
            'image/jpeg',
            quality
          );
        };

        img.onerror = (error) => {
          reject(error);
        };
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  async compressVideo(videoFile) {
    // Video compression requires a more complex setup with WebAssembly
    // This is a placeholder for future implementation
    console.warn('Video compression not yet implemented');
    return {
      file: videoFile,
      compressed: false,
    };
  }

  getCompressionStats(original, compressed) {
    const ratio = (compressed / original) * 100;
    const saved = original - compressed;
    const percentage = ((saved / original) * 100).toFixed(1);

    return {
      originalSize: this.formatSize(original),
      compressedSize: this.formatSize(compressed),
      compressionRatio: ratio.toFixed(1) + '%',
      savedSpace: this.formatSize(saved),
      savedPercentage: percentage + '%',
    };
  }

  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  shouldCompress(data) {
    if (data instanceof File) {
      return data.size > this.compressionThreshold;
    }
    
    const size = new Blob([JSON.stringify(data)]).size;
    return size > this.compressionThreshold;
  }
}

export default new CompressionService();
