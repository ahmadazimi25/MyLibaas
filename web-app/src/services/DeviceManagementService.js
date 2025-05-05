import { db } from './firebase/firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import NotificationService from './NotificationService';
import UAParser from 'ua-parser-js';

class DeviceManagementService {
  static async registerDevice(userId) {
    try {
      const deviceInfo = this.getDeviceInfo();
      const deviceId = `${deviceInfo.browser.name}_${deviceInfo.os.name}_${Date.now()}`;

      await setDoc(doc(db, 'devices', deviceId), {
        userId,
        deviceId,
        ...deviceInfo,
        trusted: false,
        lastActive: Timestamp.now(),
        registeredAt: Timestamp.now(),
        status: 'active',
        location: await this.getLocationInfo()
      });

      // Notify user of new device
      await NotificationService.sendEmail(
        (await getDoc(doc(db, 'users', userId))).data().email,
        'new-device-login',
        {
          deviceInfo,
          timestamp: new Date().toISOString(),
          location: await this.getLocationInfo()
        }
      );

      return {
        deviceId,
        message: 'Device registered successfully'
      };
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  static async trustDevice(deviceId) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be logged in');
      }

      await updateDoc(doc(db, 'devices', deviceId), {
        trusted: true,
        trustedAt: Timestamp.now()
      });

      return {
        success: true,
        message: 'Device marked as trusted'
      };
    } catch (error) {
      console.error('Error trusting device:', error);
      throw error;
    }
  }

  static async revokeDevice(deviceId) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be logged in');
      }

      const deviceDoc = await getDoc(doc(db, 'devices', deviceId));
      const deviceData = deviceDoc.data();

      // Update device status
      await updateDoc(doc(db, 'devices', deviceId), {
        status: 'revoked',
        revokedAt: Timestamp.now()
      });

      // Log security event
      await setDoc(doc(db, 'securityLogs', `device_revoke_${Date.now()}`), {
        userId: user.uid,
        deviceId,
        action: 'device_revoked',
        deviceInfo: deviceData,
        timestamp: Timestamp.now()
      });

      // Notify user
      await NotificationService.sendEmail(
        user.email,
        'device-revoked',
        {
          deviceInfo: deviceData,
          timestamp: new Date().toISOString()
        }
      );

      return {
        success: true,
        message: 'Device revoked successfully'
      };
    } catch (error) {
      console.error('Error revoking device:', error);
      throw error;
    }
  }

  static async getUserDevices(userId) {
    try {
      const devicesQuery = query(
        collection(db, 'devices'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );

      const devices = [];
      const snapshot = await getDocs(devicesQuery);
      
      snapshot.forEach(doc => {
        devices.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return devices;
    } catch (error) {
      console.error('Error getting user devices:', error);
      throw error;
    }
  }

  static async updateDeviceActivity(deviceId) {
    try {
      await updateDoc(doc(db, 'devices', deviceId), {
        lastActive: Timestamp.now(),
        lastLocation: await this.getLocationInfo()
      });
    } catch (error) {
      console.error('Error updating device activity:', error);
      throw error;
    }
  }

  static async detectSuspiciousActivity(userId) {
    try {
      const devices = await this.getUserDevices(userId);
      const suspiciousActivities = [];

      for (const device of devices) {
        // Check for multiple locations
        if (device.lastLocation?.country !== device.location?.country) {
          suspiciousActivities.push({
            type: 'location_change',
            deviceId: device.deviceId,
            oldLocation: device.location,
            newLocation: device.lastLocation,
            timestamp: Timestamp.now()
          });
        }

        // Check for unusual times
        const lastActiveHour = device.lastActive.toDate().getHours();
        if (lastActiveHour >= 2 && lastActiveHour <= 5) {
          suspiciousActivities.push({
            type: 'unusual_time',
            deviceId: device.deviceId,
            timestamp: device.lastActive
          });
        }
      }

      if (suspiciousActivities.length > 0) {
        // Log suspicious activities
        await setDoc(doc(db, 'securityLogs', `suspicious_${Date.now()}`), {
          userId,
          activities: suspiciousActivities,
          timestamp: Timestamp.now()
        });

        // Notify user
        await NotificationService.sendEmail(
          (await getDoc(doc(db, 'users', userId))).data().email,
          'suspicious-activity',
          {
            activities: suspiciousActivities,
            timestamp: new Date().toISOString()
          }
        );
      }

      return suspiciousActivities;
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      throw error;
    }
  }

  // Utility methods
  static getDeviceInfo() {
    const parser = new UAParser();
    const result = parser.getResult();

    return {
      browser: {
        name: result.browser.name,
        version: result.browser.version
      },
      os: {
        name: result.os.name,
        version: result.os.version
      },
      device: {
        type: result.device.type || 'desktop',
        model: result.device.model,
        vendor: result.device.vendor
      },
      userAgent: navigator.userAgent
    };
  }

  static async getLocationInfo() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }
}

export default DeviceManagementService;
