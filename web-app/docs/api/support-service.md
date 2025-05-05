# Support Service API Documentation

## Overview
The Support Service handles customer support tickets, knowledge base management, and support analytics.

## Endpoints

### Create Ticket
```javascript
POST /api/support/tickets
```

Creates a new support ticket.

**Request Body:**
```json
{
  "userId": "string",
  "type": "account|payment|rental|damage|return|technical|other",
  "subject": "string",
  "description": "string",
  "priority": "low|medium|high|urgent"
}
```

**Response:**
```json
{
  "id": "string",
  "status": "open",
  "createdAt": "timestamp",
  "...ticket details"
}
```

### Update Ticket
```javascript
PATCH /api/support/tickets/:ticketId
```

Updates an existing ticket.

**Request Body:**
```json
{
  "status": "in_progress|pending_user|resolved|closed",
  "assignedTo": "string",
  "notes": "string"
}
```

### Add Message
```javascript
POST /api/support/tickets/:ticketId/messages
```

Adds a message to a ticket.

**Request Body:**
```json
{
  "content": "string",
  "senderId": "string",
  "senderType": "user|support",
  "attachments": ["string"]
}
```

### Resolve Ticket
```javascript
POST /api/support/tickets/:ticketId/resolve
```

Resolves a ticket.

**Request Body:**
```json
{
  "resolution": {
    "summary": "string",
    "action": "string"
  }
}
```

### Get Ticket Analytics
```javascript
GET /api/support/analytics
```

**Query Parameters:**
- `timeRange`: number (seconds, default: 7 days)

**Response:**
```json
{
  "total": "number",
  "byStatus": {
    "open": "number",
    "in_progress": "number",
    "resolved": "number"
  },
  "byType": {
    "account": "number",
    "payment": "number"
  },
  "averageResolutionTime": "number",
  "satisfactionRate": "number"
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
- `400`: Bad Request
- `404`: Ticket Not Found
- `403`: Unauthorized Access
- `500`: Internal Server Error

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per user

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Examples

### Creating a Ticket
```javascript
const response = await fetch('/api/support/tickets', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user123',
    type: 'payment',
    subject: 'Refund Issue',
    description: 'Unable to process refund',
    priority: 'high'
  })
});

const ticket = await response.json();
```

### Adding a Message
```javascript
const response = await fetch('/api/support/tickets/ticket123/messages', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Thank you for your patience',
    senderId: 'agent123',
    senderType: 'support'
  })
});

const message = await response.json();
```

## Webhooks
Subscribe to ticket events:

```javascript
POST /api/support/webhooks
```

**Request Body:**
```json
{
  "url": "string",
  "events": [
    "ticket.created",
    "ticket.updated",
    "ticket.resolved"
  ]
}
```

## Best Practices
1. Always include error handling
2. Use appropriate ticket priorities
3. Keep message content professional
4. Regularly check ticket status
5. Handle webhook events asynchronously
