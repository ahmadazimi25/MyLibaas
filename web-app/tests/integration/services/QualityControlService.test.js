import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { db } from '../../../src/services/firebase/firebaseConfig';
import QualityControlService from '../../../src/services/quality/QualityControlService';
import NotificationService from '../../../src/services/NotificationService';
import { Timestamp } from 'firebase/firestore';

jest.mock('../../../src/services/NotificationService');

// Mock Firestore Timestamp
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  Timestamp: {
    now: () => ({
      toDate: () => new Date(),
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0
    })
  }
}));

describe('QualityControlService Integration Tests', () => {
  const mockInspectionData = {
    itemId: 'test-item-1',
    type: QualityControlService.INSPECTION_TYPES.NEW_ITEM,
    inspectorId: 'inspector-1',
    photos: ['photo1.jpg', 'photo2.jpg'],
    notes: 'Initial inspection notes'
  };

  beforeEach(async () => {
    await clearTestData();
  });

  afterEach(async () => {
    await clearTestData();
    jest.clearAllMocks();
  });

  test('should perform inspection', async () => {
    const inspection = await QualityControlService.performInspection(mockInspectionData);

    expect(inspection).toBeDefined();
    expect(inspection.id).toMatch(/^INSP_/);
    expect(inspection.status).toBe('in_progress');
    
    // Verify database entry
    const storedInspection = await db.collection('inspections').doc(inspection.id).get();
    expect(storedInspection.exists).toBe(true);
    expect(storedInspection.data()).toMatchObject(mockInspectionData);
  });

  test('should complete inspection', async () => {
    const inspection = await QualityControlService.performInspection(mockInspectionData);
    const results = {
      criteria: {
        [QualityControlService.QUALITY_CRITERIA.CONDITION]: QualityControlService.CONDITION_RATINGS.EXCELLENT,
        [QualityControlService.QUALITY_CRITERIA.CLEANLINESS]: QualityControlService.CONDITION_RATINGS.GOOD,
        [QualityControlService.QUALITY_CRITERIA.AUTHENTICITY]: QualityControlService.CONDITION_RATINGS.EXCELLENT
      },
      issues: [],
      recommendations: ['Store in cool, dry place'],
      notes: 'Final inspection notes'
    };

    const completedInspection = await QualityControlService.completeInspection(inspection.id, results);

    expect(completedInspection.status).toBe('completed');
    expect(completedInspection.criteria).toEqual(results.criteria);
    expect(completedInspection.overallRating).toBeGreaterThan(0);

    // Verify notifications
    expect(NotificationService.notifyUser).toHaveBeenCalled();
  });

  test('should verify authenticity', async () => {
    const brandInfo = {
      name: 'Designer Brand',
      serialPattern: '^[A-Z]{2}\\d{6}$',
      materials: ['silk', 'cotton']
    };

    const result = await QualityControlService.verifyAuthenticity(mockInspectionData.itemId, brandInfo);

    expect(result).toBeDefined();
    expect(result.authentic).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  test('should assess damage', async () => {
    const damageReport = {
      description: 'Small tear on seam',
      photos: ['damage1.jpg'],
      location: 'Bottom hem',
      severity: 'minor',
      reportedBy: 'user-1'
    };

    const assessment = await QualityControlService.assessDamage('rental-1', damageReport);

    expect(assessment).toBeDefined();
    expect(assessment.id).toMatch(/^DAMAGE_/);
    expect(assessment.status).toBe('pending');
    expect(assessment.inspectionId).toBeDefined();

    // Verify inspection created
    const inspection = await db.collection('inspections').doc(assessment.inspectionId).get();
    expect(inspection.exists).toBe(true);
  });

  test('should validate photos', async () => {
    const photos = ['photo1.jpg', 'photo2.jpg'];
    const results = await QualityControlService.validatePhotos(photos, mockInspectionData.itemId);

    expect(results).toBeDefined();
    expect(results.valid).toBeDefined();
    expect(results.validations).toHaveLength(photos.length);
    expect(results.recommendations).toBeDefined();
  });

  test('should validate listing accuracy', async () => {
    const result = await QualityControlService.validateListingAccuracy(mockInspectionData.itemId);

    expect(result).toBeDefined();
    expect(result.accurate).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.checks).toBeDefined();
    expect(result.recommendations).toBeDefined();
  });

  test('should run automated checks', async () => {
    const inspection = await QualityControlService.performInspection(mockInspectionData);
    const results = await QualityControlService.runAutomatedChecks(inspection);

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  test('should calculate overall rating', async () => {
    const criteria = {
      [QualityControlService.QUALITY_CRITERIA.CONDITION]: QualityControlService.CONDITION_RATINGS.EXCELLENT,
      [QualityControlService.QUALITY_CRITERIA.CLEANLINESS]: QualityControlService.CONDITION_RATINGS.GOOD,
      [QualityControlService.QUALITY_CRITERIA.AUTHENTICITY]: QualityControlService.CONDITION_RATINGS.EXCELLENT,
      [QualityControlService.QUALITY_CRITERIA.ACCURACY]: QualityControlService.CONDITION_RATINGS.GOOD,
      [QualityControlService.QUALITY_CRITERIA.PACKAGING]: QualityControlService.CONDITION_RATINGS.EXCELLENT
    };

    const rating = QualityControlService.calculateOverallRating(criteria);

    expect(rating).toBeGreaterThan(0);
    expect(rating).toBeLessThanOrEqual(5);
  });
});

async function clearTestData() {
  const collections = [
    'inspections',
    'authenticity_verifications',
    'damage_assessments',
    'photo_validations',
    'listing_accuracy'
  ];
  await Promise.all(
    collections.map(async collection => {
      const snapshot = await db.collection(collection).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    })
  );
}
