import { db, functions } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import mlContentDetector from '../utils/mlContentDetector';

class BatchProcessingService {
  constructor() {
    this.batchCollection = collection(db, 'contentBatches');
    this.contentCollection = collection(db, 'content');
    this.violationsCollection = collection(db, 'contentViolations');
    this.processingFunction = httpsCallable(functions, 'processBatch');
  }

  async processBatch(options = {}) {
    const {
      contentTypes = ['messages', 'reviews', 'listings'],
      timeframe = '24h',
      batchSize = 100,
      priority = 'normal'
    } = options;

    try {
      // Create batch record
      const batchId = await this.createBatchRecord(options);

      // Get content for processing
      const content = await this.getContentForBatch(contentTypes, timeframe, batchSize);

      // Process content in chunks
      const results = await this.processContentChunks(content, batchId);

      // Update batch record with results
      await this.updateBatchResults(batchId, results);

      // Take actions based on results
      await this.handleBatchResults(results);

      return {
        batchId,
        processed: results.length,
        violations: results.filter(r => r.isViolation).length,
        status: 'completed'
      };
    } catch (error) {
      console.error('Error processing batch:', error);
      throw error;
    }
  }

  async createBatchRecord(options) {
    const batch = {
      ...options,
      status: 'processing',
      startTime: new Date(),
      progress: 0,
      results: [],
    };

    const doc = await addDoc(this.batchCollection, batch);
    return doc.id;
  }

  async getContentForBatch(contentTypes, timeframe, batchSize) {
    const startTime = this.getStartTime(timeframe);
    const content = [];

    for (const type of contentTypes) {
      const typeContent = await this.getContentByType(type, startTime, batchSize);
      content.push(...typeContent);
    }

    return content;
  }

  async processContentChunks(content, batchId) {
    const chunkSize = 10; // Process 10 items at a time
    const results = [];

    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize);
      
      // Process chunk
      const chunkResults = await Promise.all(
        chunk.map(item => this.processContentItem(item))
      );
      
      results.push(...chunkResults);

      // Update progress
      await this.updateBatchProgress(batchId, {
        processed: i + chunk.length,
        total: content.length
      });
    }

    return results;
  }

  async processContentItem(item) {
    // Initialize ML detector if needed
    await mlContentDetector.initialize();

    // Analyze content
    const mlResult = await mlContentDetector.analyzeContent(item.content);

    // Process results
    return {
      itemId: item.id,
      contentType: item.type,
      userId: item.userId,
      timestamp: item.timestamp,
      isViolation: mlResult.isViolation,
      confidence: mlResult.confidence,
      categories: mlResult.categories,
      riskLevel: mlResult.riskLevel
    };
  }

  async updateBatchProgress(batchId, progress) {
    const batchRef = doc(this.batchCollection, batchId);
    await updateDoc(batchRef, {
      progress: (progress.processed / progress.total) * 100,
      lastUpdate: new Date()
    });
  }

  async updateBatchResults(batchId, results) {
    const batchRef = doc(this.batchCollection, batchId);
    await updateDoc(batchRef, {
      status: 'completed',
      endTime: new Date(),
      results: this.summarizeResults(results)
    });
  }

  async handleBatchResults(results) {
    const violations = results.filter(r => r.isViolation);
    
    if (violations.length > 0) {
      // Create violation records
      await this.createViolationRecords(violations);
      
      // Update user risk scores
      await this.updateUserRiskScores(violations);
      
      // Send notifications if needed
      await this.sendViolationNotifications(violations);
    }
  }

  async createViolationRecords(violations) {
    const batch = writeBatch(db);

    violations.forEach(violation => {
      const violationRef = doc(this.violationsCollection);
      batch.set(violationRef, {
        ...violation,
        status: 'pending_review',
        created: new Date()
      });
    });

    await batch.commit();
  }

  async updateUserRiskScores(violations) {
    // Group violations by user
    const userViolations = violations.reduce((acc, v) => {
      acc[v.userId] = acc[v.userId] || [];
      acc[v.userId].push(v);
      return acc;
    }, {});

    // Update each user's risk score
    for (const [userId, userViolations] of Object.entries(userViolations)) {
      await this.updateUserRiskScore(userId, userViolations);
    }
  }

  async sendViolationNotifications(violations) {
    // Group high-risk violations
    const highRiskViolations = violations.filter(v => v.riskLevel === 'high');
    
    if (highRiskViolations.length > 0) {
      await this.notifySecurityTeam({
        type: 'batch_violations',
        violations: highRiskViolations,
        timestamp: new Date()
      });
    }
  }

  async getContentByType(type, startTime, limit) {
    const contentQuery = query(
      this.contentCollection,
      where('type', '==', type),
      where('timestamp', '>=', startTime)
    );

    const snapshot = await getDocs(contentQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).slice(0, limit);
  }

  getStartTime(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case '1h':
        return new Date(now.setHours(now.getHours() - 1));
      case '24h':
        return new Date(now.setHours(now.getHours() - 24));
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      default:
        return new Date(now.setHours(now.getHours() - 24));
    }
  }

  summarizeResults(results) {
    return {
      total: results.length,
      violations: results.filter(r => r.isViolation).length,
      byRiskLevel: this.groupByRiskLevel(results),
      byCategory: this.groupByCategory(results),
      byContentType: this.groupByContentType(results)
    };
  }

  groupByRiskLevel(results) {
    return results.reduce((acc, r) => {
      acc[r.riskLevel] = (acc[r.riskLevel] || 0) + 1;
      return acc;
    }, {});
  }

  groupByCategory(results) {
    return results.reduce((acc, r) => {
      r.categories.forEach(c => {
        acc[c] = (acc[c] || 0) + 1;
      });
      return acc;
    }, {});
  }

  groupByContentType(results) {
    return results.reduce((acc, r) => {
      acc[r.contentType] = (acc[r.contentType] || 0) + 1;
      return acc;
    }, {});
  }

  async updateUserRiskScore(userId, violations) {
    const userRef = doc(db, 'users', userId);
    const userData = await userRef.get();
    const currentScore = userData.data().riskScore || 0;

    const newScore = this.calculateNewRiskScore(currentScore, violations);
    
    await updateDoc(userRef, {
      riskScore: newScore,
      lastRiskUpdate: new Date()
    });
  }

  calculateNewRiskScore(currentScore, violations) {
    const violationImpact = violations.reduce((total, v) => {
      return total + (this.getRiskLevelWeight(v.riskLevel) * v.confidence);
    }, 0);

    // Decay old score and add new violations
    const decayFactor = 0.9;
    return (currentScore * decayFactor) + (violationImpact * (1 - decayFactor));
  }

  getRiskLevelWeight(riskLevel) {
    switch (riskLevel) {
      case 'high': return 1.0;
      case 'medium': return 0.6;
      case 'low': return 0.3;
      default: return 0.1;
    }
  }
}

export default new BatchProcessingService();
