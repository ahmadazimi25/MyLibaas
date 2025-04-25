import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';

class ContentViolationService {
  constructor() {
    this.violationsCollection = collection(db, 'contentViolations');
    this.userViolationsCollection = collection(db, 'userViolations');
    this.mlEndpoint = httpsCallable(functions, 'analyzeContentWithML');
  }

  // Record a new content violation
  async recordViolation({
    userId,
    contentType,
    content,
    violationType,
    detectionMethod,
    context
  }) {
    try {
      // Add to violations collection
      const violation = await addDoc(this.violationsCollection, {
        userId,
        contentType, // 'message', 'review', 'listing', etc.
        content,
        violationType, // 'personal_info', 'spam', 'evasion', etc.
        detectionMethod, // 'pattern', 'ml', 'reported'
        context,
        timestamp: new Date(),
        status: 'pending_review',
        reviewed: false,
        actionTaken: null
      });

      // Update user violation records
      await this.updateUserViolationRecord(userId);

      // Check if automated action is needed
      await this.checkForAutomatedAction(userId);

      return violation.id;
    } catch (error) {
      console.error('Error recording violation:', error);
      throw error;
    }
  }

  // Update user's violation record
  async updateUserViolationRecord(userId) {
    const userViolationsRef = doc(this.userViolationsCollection, userId);
    const violationsQuery = query(
      this.violationsCollection,
      where('userId', '==', userId)
    );

    const violations = await getDocs(violationsQuery);
    const violationCount = violations.size;

    await updateDoc(userViolationsRef, {
      totalViolations: violationCount,
      lastViolationDate: new Date(),
      status: this.determineUserStatus(violationCount)
    });
  }

  // Determine user status based on violation count
  determineUserStatus(violationCount) {
    if (violationCount >= 10) return 'banned';
    if (violationCount >= 5) return 'restricted';
    if (violationCount >= 3) return 'warned';
    return 'active';
  }

  // Check if automated action is needed
  async checkForAutomatedAction(userId) {
    const userViolationsRef = doc(this.userViolationsCollection, userId);
    const userViolations = await userViolationsRef.get();
    const data = userViolations.data();

    if (data.totalViolations >= 10) {
      await this.automateUserBan(userId);
    } else if (data.totalViolations >= 5) {
      await this.automateUserRestriction(userId);
    } else if (data.totalViolations >= 3) {
      await this.automateUserWarning(userId);
    }
  }

  // Get violation statistics
  async getViolationStats(timeframe = '30d') {
    const stats = {
      total: 0,
      byType: {},
      byContentType: {},
      byDetectionMethod: {},
      recentTrends: [],
    };

    const startDate = this.getStartDateForTimeframe(timeframe);
    const violationsQuery = query(
      this.violationsCollection,
      where('timestamp', '>=', startDate)
    );

    const violations = await getDocs(violationsQuery);
    
    violations.forEach(doc => {
      const data = doc.data();
      stats.total++;
      
      // Count by violation type
      stats.byType[data.violationType] = (stats.byType[data.violationType] || 0) + 1;
      
      // Count by content type
      stats.byContentType[data.contentType] = (stats.byContentType[data.contentType] || 0) + 1;
      
      // Count by detection method
      stats.byDetectionMethod[data.detectionMethod] = (stats.byDetectionMethod[data.detectionMethod] || 0) + 1;
    });

    return stats;
  }

  // Get user violation history
  async getUserViolationHistory(userId) {
    const violationsQuery = query(
      this.violationsCollection,
      where('userId', '==', userId),
      where('reviewed', '==', true)
    );

    const violations = await getDocs(violationsQuery);
    return violations.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Analyze content using ML
  async analyzeContentWithML(content) {
    try {
      const result = await this.mlEndpoint({ content });
      return result.data;
    } catch (error) {
      console.error('Error analyzing content with ML:', error);
      throw error;
    }
  }

  // Private helper methods
  getStartDateForTimeframe(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case '24h':
        return new Date(now.setHours(now.getHours() - 24));
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      case '90d':
        return new Date(now.setDate(now.getDate() - 90));
      default:
        return new Date(now.setDate(now.getDate() - 30));
    }
  }

  async automateUserBan(userId) {
    // Implement user banning logic
  }

  async automateUserRestriction(userId) {
    // Implement user restriction logic
  }

  async automateUserWarning(userId) {
    // Implement user warning logic
  }
}

export default new ContentViolationService();
