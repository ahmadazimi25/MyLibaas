import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, Timestamp } from 'firebase/firestore';
import NotificationService from '../NotificationService';

class QualityControlService {
  static INSPECTION_TYPES = {
    NEW_ITEM: 'new_item',
    PRE_RENTAL: 'pre_rental',
    POST_RENTAL: 'post_rental',
    DAMAGE_CLAIM: 'damage_claim'
  };

  static CONDITION_RATINGS = {
    EXCELLENT: 5,
    GOOD: 4,
    FAIR: 3,
    POOR: 2,
    UNACCEPTABLE: 1
  };

  static QUALITY_CRITERIA = {
    CONDITION: 'condition',
    CLEANLINESS: 'cleanliness',
    AUTHENTICITY: 'authenticity',
    ACCURACY: 'accuracy',
    PACKAGING: 'packaging'
  };

  static async performInspection(data) {
    try {
      const {
        itemId,
        type,
        inspectorId,
        photos = [],
        notes = ''
      } = data;

      const inspectionId = `INSP_${Date.now()}`;
      const inspection = {
        id: inspectionId,
        itemId,
        type,
        inspectorId,
        status: 'in_progress',
        photos,
        notes,
        criteria: {},
        issues: [],
        recommendations: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        completedAt: null
      };

      // Store inspection
      await setDoc(doc(db, 'inspections', inspectionId), inspection);

      // Start automated checks
      await this.runAutomatedChecks(inspection);

      return inspection;
    } catch (error) {
      console.error('Error performing inspection:', error);
      throw error;
    }
  }

  static async completeInspection(inspectionId, results) {
    try {
      const inspection = await this.getInspection(inspectionId);
      if (!inspection) {
        throw new Error('Inspection not found');
      }

      const {
        criteria,
        issues = [],
        recommendations = [],
        notes = ''
      } = results;

      const updatedInspection = {
        ...inspection,
        status: 'completed',
        criteria,
        issues,
        recommendations,
        notes: inspection.notes + '\n' + notes,
        completedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Calculate overall rating
      updatedInspection.overallRating = this.calculateOverallRating(criteria);

      // Store results
      await setDoc(doc(db, 'inspections', inspectionId), updatedInspection);

      // Update item status
      await this.updateItemStatus(inspection.itemId, updatedInspection);

      // Notify relevant parties
      await this.notifyInspectionComplete(updatedInspection);

      return updatedInspection;
    } catch (error) {
      console.error('Error completing inspection:', error);
      throw error;
    }
  }

  static async verifyAuthenticity(itemId, brandInfo) {
    try {
      // Perform authenticity checks
      const checks = await Promise.all([
        this.checkSerialNumber(itemId, brandInfo),
        this.checkBrandMarkers(itemId, brandInfo),
        this.checkMaterials(itemId, brandInfo)
      ]);

      const result = {
        authentic: checks.every(check => check.passed),
        confidence: this.calculateConfidence(checks),
        checks
      };

      // Store verification result
      await setDoc(doc(db, 'authenticity_verifications', itemId), {
        ...result,
        verifiedAt: Timestamp.now()
      });

      return result;
    } catch (error) {
      console.error('Error verifying authenticity:', error);
      throw error;
    }
  }

  static async assessDamage(rentalId, damageReport) {
    try {
      const {
        description,
        photos,
        location,
        severity,
        reportedBy
      } = damageReport;

      const assessmentId = `DAMAGE_${Date.now()}`;
      const assessment = {
        id: assessmentId,
        rentalId,
        description,
        photos,
        location,
        severity,
        reportedBy,
        status: 'pending',
        createdAt: Timestamp.now()
      };

      // Create inspection for damage
      const inspection = await this.performInspection({
        itemId: assessment.itemId,
        type: this.INSPECTION_TYPES.DAMAGE_CLAIM,
        notes: description,
        photos
      });

      assessment.inspectionId = inspection.id;

      // Store assessment
      await setDoc(doc(db, 'damage_assessments', assessmentId), assessment);

      // Notify relevant parties
      await this.notifyDamageReport(assessment);

      return assessment;
    } catch (error) {
      console.error('Error assessing damage:', error);
      throw error;
    }
  }

  static async validatePhotos(photos, itemId) {
    try {
      const validations = await Promise.all(
        photos.map(photo => this.validatePhoto(photo, itemId))
      );

      const results = {
        valid: validations.every(v => v.valid),
        validations,
        recommendations: this.getPhotoRecommendations(validations)
      };

      // Store validation results
      await setDoc(doc(db, 'photo_validations', `${itemId}_${Date.now()}`), {
        ...results,
        validatedAt: Timestamp.now()
      });

      return results;
    } catch (error) {
      console.error('Error validating photos:', error);
      throw error;
    }
  }

  static async validateListingAccuracy(itemId) {
    try {
      const item = await this.getItem(itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      // Check various aspects of the listing
      const checks = await Promise.all([
        this.checkPhotosAccuracy(item),
        this.checkDescriptionAccuracy(item),
        this.checkPricingAccuracy(item),
        this.checkSizeAccuracy(item)
      ]);

      const result = {
        accurate: checks.every(check => check.accurate),
        score: this.calculateAccuracyScore(checks),
        checks,
        recommendations: this.getAccuracyRecommendations(checks)
      };

      // Store accuracy results
      await setDoc(doc(db, 'listing_accuracy', itemId), {
        ...result,
        validatedAt: Timestamp.now()
      });

      return result;
    } catch (error) {
      console.error('Error validating listing accuracy:', error);
      throw error;
    }
  }

  static async runAutomatedChecks(inspection) {
    try {
      // Run relevant automated checks based on inspection type
      const checks = [];

      switch (inspection.type) {
        case this.INSPECTION_TYPES.NEW_ITEM:
          checks.push(
            this.checkPhotosQuality(inspection),
            this.checkDescriptionCompleteness(inspection),
            this.checkBrandAuthenticity(inspection)
          );
          break;

        case this.INSPECTION_TYPES.PRE_RENTAL:
          checks.push(
            this.checkItemCondition(inspection),
            this.checkCleanliness(inspection),
            this.checkPackaging(inspection)
          );
          break;

        case this.INSPECTION_TYPES.POST_RENTAL:
          checks.push(
            this.checkForDamage(inspection),
            this.checkForWearAndTear(inspection),
            this.checkForCleanliness(inspection)
          );
          break;

        case this.INSPECTION_TYPES.DAMAGE_CLAIM:
          checks.push(
            this.assessDamageExtent(inspection),
            this.checkRepairability(inspection),
            this.estimateRepairCost(inspection)
          );
          break;
      }

      const results = await Promise.all(checks);

      // Update inspection with automated check results
      await this.updateInspectionChecks(inspection.id, results);

      return results;
    } catch (error) {
      console.error('Error running automated checks:', error);
      throw error;
    }
  }

  static calculateOverallRating(criteria) {
    const weights = {
      [this.QUALITY_CRITERIA.CONDITION]: 0.3,
      [this.QUALITY_CRITERIA.CLEANLINESS]: 0.2,
      [this.QUALITY_CRITERIA.AUTHENTICITY]: 0.2,
      [this.QUALITY_CRITERIA.ACCURACY]: 0.15,
      [this.QUALITY_CRITERIA.PACKAGING]: 0.15
    };

    let totalWeight = 0;
    let weightedSum = 0;

    for (const [criterion, rating] of Object.entries(criteria)) {
      if (weights[criterion]) {
        weightedSum += rating * weights[criterion];
        totalWeight += weights[criterion];
      }
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  static async updateItemStatus(itemId, inspection) {
    try {
      const status = this.determineItemStatus(inspection);
      
      await setDoc(doc(db, 'items', itemId), {
        status,
        lastInspection: {
          id: inspection.id,
          rating: inspection.overallRating,
          date: inspection.completedAt
        }
      }, { merge: true });

      return status;
    } catch (error) {
      console.error('Error updating item status:', error);
      throw error;
    }
  }

  static determineItemStatus(inspection) {
    if (inspection.overallRating >= this.CONDITION_RATINGS.GOOD) {
      return 'available';
    } else if (inspection.overallRating >= this.CONDITION_RATINGS.FAIR) {
      return 'needs_attention';
    } else {
      return 'unavailable';
    }
  }

  static async notifyInspectionComplete(inspection) {
    const item = await this.getItem(inspection.itemId);
    if (!item) return;

    await NotificationService.notifyUser(item.ownerId, 'INSPECTION_COMPLETE', {
      itemId: inspection.itemId,
      status: inspection.status,
      rating: inspection.overallRating
    });
  }

  static async notifyDamageReport(assessment) {
    const rental = await this.getRental(assessment.rentalId);
    if (!rental) return;

    await NotificationService.notifyUser(rental.ownerId, 'DAMAGE_REPORTED', {
      rentalId: assessment.rentalId,
      itemId: rental.itemId,
      severity: assessment.severity
    });
  }
}

export default QualityControlService;
