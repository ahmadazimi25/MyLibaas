import { db, functions } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

class IPTrackingService {
  constructor() {
    this.ipCollection = collection(db, 'ipTracking');
    this.violationsCollection = collection(db, 'contentViolations');
    this.userCollection = collection(db, 'users');
    this.geoIPFunction = httpsCallable(functions, 'geolocateIP');
    this.vpnDetectionFunction = httpsCallable(functions, 'detectVPN');
  }

  async trackIP(userId, ip) {
    try {
      // Get IP information
      const ipInfo = await this.getIPInfo(ip);
      
      // Check if IP is suspicious
      const suspicious = await this.checkSuspiciousIP(ip);
      
      // Record IP usage
      await this.recordIPUsage(userId, ip, ipInfo, suspicious);
      
      // Check for multiple accounts
      await this.checkMultipleAccounts(ip);
      
      return ipInfo;
    } catch (error) {
      console.error('Error tracking IP:', error);
      throw error;
    }
  }

  async getIPInfo(ip) {
    try {
      // Get geolocation data
      const geoData = await this.geoIPFunction({ ip });
      
      // Check if IP is using VPN/proxy
      const vpnData = await this.vpnDetectionFunction({ ip });
      
      return {
        ip,
        geolocation: geoData.data,
        isVPN: vpnData.data.isVPN,
        isProxy: vpnData.data.isProxy,
        isTor: vpnData.data.isTor,
        riskScore: this.calculateIPRiskScore(geoData.data, vpnData.data),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting IP info:', error);
      throw error;
    }
  }

  async checkSuspiciousIP(ip) {
    // Query for violations associated with this IP
    const violationsQuery = query(
      this.violationsCollection,
      where('ip', '==', ip)
    );
    
    const violations = await getDocs(violationsQuery);
    
    // Calculate suspicion score
    const suspicionScore = this.calculateSuspicionScore(violations.docs);
    
    return {
      isSuspicious: suspicionScore > 0.7,
      score: suspicionScore,
      violations: violations.size,
      lastViolation: violations.size > 0 ? 
        Math.max(...violations.docs.map(doc => doc.data().timestamp.toDate())) :
        null
    };
  }

  async recordIPUsage(userId, ip, ipInfo, suspicious) {
    const usage = {
      userId,
      ip,
      ...ipInfo,
      suspicious,
      timestamp: new Date()
    };

    await addDoc(this.ipCollection, usage);

    // If IP is suspicious, update user risk score
    if (suspicious.isSuspicious) {
      await this.updateUserRiskScore(userId, suspicious.score);
    }
  }

  async checkMultipleAccounts(ip) {
    // Find all users who have used this IP
    const usageQuery = query(
      this.ipCollection,
      where('ip', '==', ip)
    );
    
    const usages = await getDocs(usageQuery);
    
    // Group by unique users
    const userIds = new Set(usages.docs.map(doc => doc.data().userId));
    
    // If multiple users found, investigate connections
    if (userIds.size > 1) {
      await this.investigateUserConnections(Array.from(userIds), ip);
    }
  }

  async investigateUserConnections(userIds, ip) {
    const connectionData = {
      userIds,
      ip,
      timestamp: new Date(),
      status: 'pending_review'
    };

    // Record the connection for investigation
    await addDoc(collection(db, 'userConnections'), connectionData);

    // If high risk, notify security team
    if (await this.isHighRiskConnection(userIds)) {
      await this.notifySecurityTeam({
        type: 'multiple_accounts',
        data: connectionData
      });
    }
  }

  async isHighRiskConnection(userIds) {
    // Check violation history for all users
    const violations = await Promise.all(
      userIds.map(userId => this.getUserViolations(userId))
    );

    // Calculate risk based on violation patterns
    return violations.some(v => v.length > 0);
  }

  async getUserViolations(userId) {
    const violationsQuery = query(
      this.violationsCollection,
      where('userId', '==', userId)
    );
    
    const violations = await getDocs(violationsQuery);
    return violations.docs.map(doc => doc.data());
  }

  calculateIPRiskScore(geoData, vpnData) {
    let score = 0;

    // Factor 1: VPN/Proxy usage
    if (vpnData.isVPN) score += 0.3;
    if (vpnData.isProxy) score += 0.3;
    if (vpnData.isTor) score += 0.4;

    // Factor 2: Location risk
    score += this.getLocationRiskScore(geoData);

    // Normalize score to 0-1 range
    return Math.min(score, 1);
  }

  calculateSuspicionScore(violations) {
    if (violations.length === 0) return 0;

    let score = 0;
    const now = new Date();

    violations.forEach(violation => {
      const data = violation.data();
      const age = now - data.timestamp.toDate();
      const ageWeight = Math.exp(-age / (30 * 24 * 60 * 60 * 1000)); // Decay over 30 days

      score += ageWeight * this.getViolationWeight(data.type);
    });

    return Math.min(score, 1);
  }

  getLocationRiskScore(geoData) {
    // Implement location-based risk scoring
    return 0;
  }

  getViolationWeight(type) {
    const weights = {
      'personal_info': 0.7,
      'platform_evasion': 0.8,
      'spam': 0.5,
      'suspicious': 0.6
    };
    return weights[type] || 0.5;
  }

  async updateUserRiskScore(userId, suspicionScore) {
    const userRef = doc(this.userCollection, userId);
    
    // Get current user data
    const userData = await userRef.get();
    const currentScore = userData.data().riskScore || 0;

    // Calculate new risk score with decay
    const newScore = this.calculateNewRiskScore(currentScore, suspicionScore);

    // Update user document
    await updateDoc(userRef, {
      riskScore: newScore,
      lastRiskUpdate: new Date()
    });
  }

  calculateNewRiskScore(currentScore, newSuspicion) {
    // Implement exponential decay for old score
    const decayFactor = 0.9;
    return (currentScore * decayFactor) + (newSuspicion * (1 - decayFactor));
  }
}

export default new IPTrackingService();
