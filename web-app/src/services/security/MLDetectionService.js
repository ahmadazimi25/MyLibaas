import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import NotificationService from '../NotificationService';

class MLDetectionService {
  static MODEL_TYPES = {
    SPAM: 'spam_detection',
    FRAUD: 'fraud_detection',
    BEHAVIOR: 'behavior_analysis',
    ANOMALY: 'anomaly_detection'
  };

  static async initialize() {
    try {
      // Load pre-trained models
      this.models = {
        spamDetector: await this.loadModel('spam_detector'),
        fraudDetector: await this.loadModel('fraud_detector'),
        behaviorAnalyzer: await this.loadModel('behavior_analyzer'),
        anomalyDetector: await this.loadModel('anomaly_detector')
      };

      // Load Universal Sentence Encoder
      this.encoder = await use.load();

      return {
        success: true,
        message: 'ML models initialized successfully'
      };
    } catch (error) {
      console.error('Error initializing ML models:', error);
      throw error;
    }
  }

  static async detectSpam(content) {
    try {
      // Encode text
      const features = await this.encoder.embed(content);
      
      // Run through spam detector
      const predictions = await this.models.spamDetector.predict(features).array();
      
      const spamScore = predictions[0][0];
      const spamThreshold = 0.7;

      const result = {
        isSpam: spamScore > spamThreshold,
        score: spamScore,
        confidence: this.calculateConfidence(predictions),
        features: {
          keywords: await this.extractKeywords(content),
          patterns: await this.detectPatterns(content)
        }
      };

      // Log detection
      await this.logDetection('spam', result);

      return result;
    } catch (error) {
      console.error('Error detecting spam:', error);
      throw error;
    }
  }

  static async detectFraud(transaction) {
    try {
      // Extract features from transaction
      const features = this.extractTransactionFeatures(transaction);
      
      // Run through fraud detector
      const predictions = await this.models.fraudDetector.predict(features).array();
      
      const fraudScore = predictions[0][0];
      const fraudThreshold = 0.8;

      const result = {
        isFraudulent: fraudScore > fraudThreshold,
        score: fraudScore,
        confidence: this.calculateConfidence(predictions),
        anomalies: this.detectTransactionAnomalies(transaction)
      };

      // Log detection
      await this.logDetection('fraud', result);

      return result;
    } catch (error) {
      console.error('Error detecting fraud:', error);
      throw error;
    }
  }

  static async analyzeBehavior(userId, actions) {
    try {
      // Extract behavior features
      const features = await this.extractBehaviorFeatures(userId, actions);
      
      // Run through behavior analyzer
      const predictions = await this.models.behaviorAnalyzer.predict(features).array();
      
      const behaviorScore = predictions[0][0];
      const anomalyThreshold = 0.75;

      const result = {
        isAnomalous: behaviorScore > anomalyThreshold,
        score: behaviorScore,
        confidence: this.calculateConfidence(predictions),
        patterns: await this.analyzeBehaviorPatterns(actions)
      };

      // Log analysis
      await this.logDetection('behavior', result);

      return result;
    } catch (error) {
      console.error('Error analyzing behavior:', error);
      throw error;
    }
  }

  static async detectAnomalies(data, context) {
    try {
      // Prepare data for anomaly detection
      const features = this.prepareAnomalyFeatures(data);
      
      // Run through anomaly detector
      const predictions = await this.models.anomalyDetector.predict(features).array();
      
      const anomalyScores = predictions[0];
      const anomalyThreshold = 0.8;

      const anomalies = anomalyScores
        .map((score, index) => ({
          feature: Object.keys(data)[index],
          score,
          isAnomalous: score > anomalyThreshold
        }))
        .filter(a => a.isAnomalous);

      const result = {
        hasAnomalies: anomalies.length > 0,
        anomalies,
        overallScore: Math.max(...anomalyScores),
        context
      };

      // Log detection
      await this.logDetection('anomaly', result);

      return result;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      throw error;
    }
  }

  // Model management methods
  static async loadModel(modelName) {
    try {
      // Load model from Firebase Storage or CDN
      return await tf.loadLayersModel(`${process.env.MODEL_BASE_URL}/${modelName}/model.json`);
    } catch (error) {
      console.error(`Error loading model ${modelName}:`, error);
      throw error;
    }
  }

  static async updateModel(modelName, newWeights) {
    try {
      const model = this.models[modelName];
      await model.setWeights(newWeights);
      
      // Log model update
      await this.logModelUpdate(modelName);

      return {
        success: true,
        message: `Model ${modelName} updated successfully`
      };
    } catch (error) {
      console.error(`Error updating model ${modelName}:`, error);
      throw error;
    }
  }

  // Feature extraction methods
  static extractTransactionFeatures(transaction) {
    return tf.tensor2d([[
      transaction.amount,
      transaction.frequency,
      transaction.timeOfDay,
      transaction.deviceRiskScore,
      transaction.locationRiskScore
    ]]);
  }

  static async extractBehaviorFeatures(userId, actions) {
    const features = [
      actions.frequency,
      actions.timingVariance,
      actions.patternScore,
      actions.deviceConsistency,
      actions.locationConsistency
    ];

    return tf.tensor2d([features]);
  }

  static prepareAnomalyFeatures(data) {
    return tf.tensor2d([Object.values(data)]);
  }

  // Utility methods
  static calculateConfidence(predictions) {
    const mainPrediction = predictions[0][0];
    return Math.abs(mainPrediction - 0.5) * 2; // Scale to 0-1
  }

  static async extractKeywords(content) {
    // Simple keyword extraction
    const words = content.toLowerCase().split(/\W+/);
    const frequencies = {};
    
    words.forEach(word => {
      if (word.length > 3) {
        frequencies[word] = (frequencies[word] || 0) + 1;
      }
    });

    return Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  }

  static async detectPatterns(content) {
    const patterns = {
      urls: (content.match(/https?:\/\/\S+/g) || []).length,
      emails: (content.match(/\S+@\S+\.\S+/g) || []).length,
      numbers: (content.match(/\d+/g) || []).length,
      specialChars: (content.match(/[^a-zA-Z0-9\s]/g) || []).length
    };

    return patterns;
  }

  static async analyzeBehaviorPatterns(actions) {
    const patterns = {
      hourlyDistribution: this.calculateHourlyDistribution(actions),
      actionTypes: this.countActionTypes(actions),
      devicePatterns: this.analyzeDevicePatterns(actions),
      locationPatterns: this.analyzeLocationPatterns(actions)
    };

    return patterns;
  }

  // Logging methods
  static async logDetection(type, result) {
    try {
      await setDoc(doc(db, 'mlDetections', `${type}_${Date.now()}`), {
        type,
        timestamp: Timestamp.now(),
        result,
        modelVersion: this.models[type]?.version || '1.0'
      });
    } catch (error) {
      console.error('Error logging ML detection:', error);
    }
  }

  static async logModelUpdate(modelName) {
    try {
      await setDoc(doc(db, 'modelUpdates', `${modelName}_${Date.now()}`), {
        modelName,
        timestamp: Timestamp.now(),
        version: this.models[modelName]?.version || '1.0'
      });
    } catch (error) {
      console.error('Error logging model update:', error);
    }
  }
}

export default MLDetectionService;
