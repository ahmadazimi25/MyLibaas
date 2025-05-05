import { db } from './firebase/firebaseConfig';
import { doc, setDoc, getDoc, getDocs, query, where, collection, Timestamp, deleteDoc } from 'firebase/firestore';
import NotificationService from './NotificationService';

class IPBlockingService {
  static BLOCK_REASONS = {
    RATE_LIMIT: 'rate_limit_exceeded',
    SUSPICIOUS: 'suspicious_activity',
    MANUAL: 'manual_block',
    ABUSE: 'abuse_detected',
    SPAM: 'spam_activity'
  };

  static BLOCK_DURATIONS = {
    TEMPORARY: 24 * 60 * 60 * 1000, // 24 hours
    MEDIUM: 7 * 24 * 60 * 60 * 1000, // 7 days
    LONG: 30 * 24 * 60 * 60 * 1000, // 30 days
    PERMANENT: -1 // Permanent block
  };

  static async blockIP(ip, reason, duration, metadata = {}) {
    try {
      const blockId = `block_${ip.replace(/\./g, '_')}_${Date.now()}`;
      const now = Date.now();
      
      await setDoc(doc(db, 'ipBlocks', blockId), {
        ip,
        reason,
        createdAt: Timestamp.now(),
        expiresAt: duration === this.BLOCK_DURATIONS.PERMANENT ? null : 
                  Timestamp.fromDate(new Date(now + duration)),
        metadata: {
          ...metadata,
          userAgent: navigator.userAgent,
          timestamp: now
        },
        status: 'active'
      });

      // Log security event
      await this.logSecurityEvent(ip, 'ip_blocked', {
        reason,
        duration,
        blockId
      });

      // Notify admins for certain block reasons
      if (reason === this.BLOCK_REASONS.SUSPICIOUS || reason === this.BLOCK_REASONS.ABUSE) {
        await NotificationService.notifyAdmins(
          'IP_BLOCKED',
          {
            ip,
            reason,
            duration,
            metadata
          },
          'high'
        );
      }

      return {
        blockId,
        message: 'IP blocked successfully'
      };
    } catch (error) {
      console.error('Error blocking IP:', error);
      throw error;
    }
  }

  static async unblockIP(ip) {
    try {
      const blocks = await this.getIPBlocks(ip);
      
      for (const block of blocks) {
        await updateDoc(doc(db, 'ipBlocks', block.id), {
          status: 'inactive',
          unblockReason: 'manual_unblock',
          unblockTimestamp: Timestamp.now()
        });
      }

      // Log security event
      await this.logSecurityEvent(ip, 'ip_unblocked', {
        timestamp: Date.now()
      });

      return {
        success: true,
        message: 'IP unblocked successfully'
      };
    } catch (error) {
      console.error('Error unblocking IP:', error);
      throw error;
    }
  }

  static async isIPBlocked(ip) {
    try {
      const blocks = await this.getIPBlocks(ip);
      const now = Date.now();

      // Check for any active blocks
      const activeBlock = blocks.find(block => {
        if (block.status !== 'active') return false;
        
        // Check if block is permanent or not expired
        return !block.expiresAt || block.expiresAt.toDate() > now;
      });

      if (activeBlock) {
        return {
          blocked: true,
          reason: activeBlock.reason,
          expiresAt: activeBlock.expiresAt?.toDate() || null,
          blockId: activeBlock.id
        };
      }

      return {
        blocked: false
      };
    } catch (error) {
      console.error('Error checking IP block status:', error);
      throw error;
    }
  }

  static async getIPBlocks(ip) {
    try {
      const blocksQuery = query(
        collection(db, 'ipBlocks'),
        where('ip', '==', ip),
        where('status', '==', 'active')
      );

      const blocks = [];
      const snapshot = await getDocs(blocksQuery);
      
      snapshot.forEach(doc => {
        blocks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return blocks;
    } catch (error) {
      console.error('Error getting IP blocks:', error);
      throw error;
    }
  }

  static async cleanupExpiredBlocks() {
    try {
      const now = Timestamp.now();
      const blocksQuery = query(
        collection(db, 'ipBlocks'),
        where('status', '==', 'active'),
        where('expiresAt', '<', now)
      );

      const snapshot = await getDocs(blocksQuery);
      const batch = db.batch();

      snapshot.forEach(doc => {
        batch.update(doc.ref, {
          status: 'expired',
          expiredAt: now
        });
      });

      await batch.commit();

      return {
        success: true,
        cleanedBlocks: snapshot.size
      };
    } catch (error) {
      console.error('Error cleaning up expired blocks:', error);
      throw error;
    }
  }

  static async logSecurityEvent(ip, action, details) {
    try {
      const eventId = `security_${Date.now()}`;
      await setDoc(doc(db, 'securityEvents', eventId), {
        ip,
        action,
        timestamp: Timestamp.now(),
        details: {
          ...details,
          userAgent: navigator.userAgent,
          location: await this.getIPLocation(ip)
        }
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  static async getIPLocation(ip) {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      
      return {
        city: data.city,
        region: data.region,
        country: data.country_name,
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      console.error('Error getting IP location:', error);
      return null;
    }
  }

  static async getBlockStatistics(ip) {
    try {
      const blocks = await this.getIPBlocks(ip);
      
      return {
        totalBlocks: blocks.length,
        activeBlocks: blocks.filter(b => b.status === 'active').length,
        lastBlock: blocks[0] || null,
        reasons: blocks.reduce((acc, block) => {
          acc[block.reason] = (acc[block.reason] || 0) + 1;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error getting block statistics:', error);
      throw error;
    }
  }
}

export default IPBlockingService;
