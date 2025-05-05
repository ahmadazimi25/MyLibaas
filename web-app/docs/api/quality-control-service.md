# Quality Control Service API Documentation

## Overview
The Quality Control Service manages item inspections, authenticity verification, and quality assurance processes.

## Endpoints

### Perform Inspection
```javascript
POST /api/quality/inspections
```

Creates a new inspection.

**Request Body:**
```json
{
  "itemId": "string",
  "type": "new_item|pre_rental|post_rental|damage_claim",
  "inspectorId": "string",
  "photos": ["string"],
  "notes": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "status": "in_progress",
  "criteria": {},
  "issues": [],
  "recommendations": [],
  "createdAt": "timestamp",
  "...inspection details"
}
```

### Complete Inspection
```javascript
POST /api/quality/inspections/:inspectionId/complete
```

Completes an inspection with results.

**Request Body:**
```json
{
  "criteria": {
    "condition": 1-5,
    "cleanliness": 1-5,
    "authenticity": 1-5,
    "accuracy": 1-5,
    "packaging": 1-5
  },
  "issues": ["string"],
  "recommendations": ["string"],
  "notes": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "status": "completed",
  "overallRating": "number",
  "completedAt": "timestamp",
  "...inspection details"
}
```

### Verify Authenticity
```javascript
POST /api/quality/verify-authenticity
```

Verifies item authenticity.

**Request Body:**
```json
{
  "itemId": "string",
  "brandInfo": {
    "name": "string",
    "serialPattern": "string",
    "materials": ["string"]
  }
}
```

**Response:**
```json
{
  "authentic": "boolean",
  "confidence": "number",
  "checks": [{
    "type": "string",
    "passed": "boolean",
    "details": "string"
  }]
}
```

### Assess Damage
```javascript
POST /api/quality/damage-assessment
```

Assesses reported damage.

**Request Body:**
```json
{
  "rentalId": "string",
  "description": "string",
  "photos": ["string"],
  "location": "string",
  "severity": "minor|moderate|major",
  "reportedBy": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "status": "pending",
  "inspectionId": "string",
  "...assessment details"
}
```

### Validate Photos
```javascript
POST /api/quality/validate-photos
```

Validates item photos.

**Request Body:**
```json
{
  "photos": ["string"],
  "itemId": "string"
}
```

**Response:**
```json
{
  "valid": "boolean",
  "validations": [{
    "photo": "string",
    "valid": "boolean",
    "issues": ["string"]
  }],
  "recommendations": ["string"]
}
```

### Validate Listing Accuracy
```javascript
GET /api/quality/listings/:itemId/accuracy
```

**Response:**
```json
{
  "accurate": "boolean",
  "score": "number",
  "checks": [{
    "aspect": "string",
    "accurate": "boolean",
    "details": "string"
  }],
  "recommendations": ["string"]
}
```

## Error Handling

### Error Responses
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

Common error codes:
- `400`: Invalid Inspection Data
- `404`: Item/Inspection Not Found
- `403`: Unauthorized Inspector
- `500`: Internal Server Error

## Rate Limiting
- 30 requests per minute per IP
- 300 requests per hour per user

## Authentication
All endpoints require a valid JWT token:
```
Authorization: Bearer <token>
```

## Examples

### Creating an Inspection
```javascript
const response = await fetch('/api/quality/inspections', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    itemId: 'item123',
    type: 'new_item',
    inspectorId: 'inspector123',
    photos: ['photo1.jpg', 'photo2.jpg'],
    notes: 'Initial inspection notes'
  })
});

const inspection = await response.json();
```

### Completing an Inspection
```javascript
const response = await fetch('/api/quality/inspections/inspection123/complete', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    criteria: {
      condition: 5,
      cleanliness: 4,
      authenticity: 5,
      accuracy: 4,
      packaging: 5
    },
    issues: [],
    recommendations: ['Store in cool, dry place'],
    notes: 'Final inspection notes'
  })
});

const completedInspection = await response.json();
```

## Webhooks
Subscribe to quality control events:

```javascript
POST /api/quality/webhooks
```

**Request Body:**
```json
{
  "url": "string",
  "events": [
    "inspection.created",
    "inspection.completed",
    "authenticity.verified",
    "damage.reported"
  ]
}
```

## Best Practices
1. Always include clear photos
2. Document all issues found
3. Be specific in recommendations
4. Regular inspector training
5. Maintain consistent rating criteria
