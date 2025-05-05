# Shipping Service API Documentation

## Overview
The Shipping Service manages logistics, shipment tracking, and delivery operations for the clothing rental platform.

## Endpoints

### Create Shipment
```javascript
POST /api/shipping/shipments
```

Creates a new shipment.

**Request Body:**
```json
{
  "rentalId": "string",
  "from": {
    "userId": "string",
    "name": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zip": "string"
  },
  "to": {
    "userId": "string",
    "name": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zip": "string"
  },
  "items": [{
    "id": "string",
    "name": "string",
    "weight": "number",
    "dimensions": {
      "length": "number",
      "width": "number",
      "height": "number"
    }
  }],
  "method": "standard|express|same_day",
  "carrier": "fedex|ups|usps|dhl"
}
```

**Response:**
```json
{
  "id": "string",
  "status": "pending",
  "tracking": "string",
  "label": {
    "url": "string",
    "trackingNumber": "string"
  },
  "estimatedDelivery": "date",
  "...shipment details"
}
```

### Track Shipment
```javascript
GET /api/shipping/shipments/:shipmentId/track
```

**Response:**
```json
{
  "status": "pending|picked_up|in_transit|out_for_delivery|delivered|returned|failed",
  "currentLocation": {
    "city": "string",
    "state": "string",
    "timestamp": "date"
  },
  "events": [{
    "status": "string",
    "location": "string",
    "timestamp": "date",
    "description": "string"
  }],
  "estimatedDelivery": "date"
}
```

### Calculate Shipping
```javascript
POST /api/shipping/calculate
```

**Request Body:**
```json
{
  "from": {
    "zip": "string",
    "state": "string"
  },
  "to": {
    "zip": "string",
    "state": "string"
  },
  "items": [{
    "weight": "number",
    "dimensions": {
      "length": "number",
      "width": "number",
      "height": "number"
    }
  }],
  "method": "standard|express|same_day"
}
```

**Response:**
```json
{
  "cost": "number",
  "estimatedDelivery": "date",
  "rates": {
    "baseCost": "number",
    "fuelSurcharge": "number",
    "taxes": "number"
  }
}
```

### Handle Return
```javascript
POST /api/shipping/returns
```

**Request Body:**
```json
{
  "rentalId": "string"
}
```

**Response:**
```json
{
  "returnShipment": {
    "id": "string",
    "label": {
      "url": "string",
      "trackingNumber": "string"
    },
    "...shipment details"
  }
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
- `400`: Invalid Address/Package Details
- `404`: Shipment Not Found
- `422`: Carrier Service Unavailable
- `500`: Internal Server Error

## Rate Limiting
- 50 requests per minute per IP
- 500 requests per hour per user

## Authentication
All endpoints require a valid JWT token:
```
Authorization: Bearer <token>
```

## Examples

### Creating a Shipment
```javascript
const response = await fetch('/api/shipping/shipments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rentalId: 'rental123',
    from: {
      userId: 'owner123',
      name: 'John Doe',
      address: '123 Sender St',
      city: 'SenderCity',
      state: 'SS',
      zip: '12345'
    },
    to: {
      userId: 'renter123',
      name: 'Jane Smith',
      address: '456 Receiver Ave',
      city: 'ReceiverCity',
      state: 'RS',
      zip: '67890'
    },
    items: [{
      id: 'item123',
      name: 'Designer Dress',
      weight: 1.5,
      dimensions: {
        length: 20,
        width: 15,
        height: 5
      }
    }],
    method: 'standard',
    carrier: 'fedex'
  })
});

const shipment = await response.json();
```

### Tracking a Shipment
```javascript
const response = await fetch('/api/shipping/shipments/shipment123/track', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
});

const tracking = await response.json();
```

## Webhooks
Subscribe to shipping events:

```javascript
POST /api/shipping/webhooks
```

**Request Body:**
```json
{
  "url": "string",
  "events": [
    "shipment.created",
    "shipment.in_transit",
    "shipment.delivered",
    "shipment.exception"
  ]
}
```

## Best Practices
1. Validate addresses before creating shipments
2. Handle carrier service disruptions gracefully
3. Implement webhook retry logic
4. Store tracking numbers securely
5. Regular status polling for active shipments
