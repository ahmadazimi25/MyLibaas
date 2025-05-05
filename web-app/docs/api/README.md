# MyLibaas API Documentation

## Overview

MyLibaas is a premium clothing rental platform that provides a RESTful API for managing rentals, users, payments, and inventory. This documentation provides detailed information about available endpoints, authentication, and usage examples.

## Base URL

- Production: `https://api.mylibaas.com/v1`
- Staging: `https://staging-api.mylibaas.com/v1`

## Authentication

All API requests require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

To obtain a token, use the `/auth` endpoint with your credentials.

## Rate Limiting

- Free tier: 100 requests per minute
- Premium tier: 1000 requests per minute
- Enterprise tier: Custom limits

## Endpoints

### Authentication

#### POST /auth/login
Authenticate user and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Items

#### GET /items
Get a list of rental items.

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `category` (optional): Filter by category
- `available` (optional): Filter by availability

**Response:**
```json
{
  "items": [
    {
      "id": "item123",
      "name": "Designer Dress",
      "description": "Beautiful evening dress",
      "price": 99.99,
      "category": "dresses",
      "available": true
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

### Rentals

#### POST /rentals
Create a new rental.

**Request:**
```json
{
  "itemId": "item123",
  "startDate": "2025-05-01",
  "endDate": "2025-05-03"
}
```

**Response:**
```json
{
  "id": "rental123",
  "status": "pending",
  "item": {
    "id": "item123",
    "name": "Designer Dress"
  },
  "dates": {
    "start": "2025-05-01",
    "end": "2025-05-03"
  },
  "price": {
    "base": 99.99,
    "insurance": 9.99,
    "total": 109.98
  }
}
```

### Payments

#### POST /payments
Process a payment for rental.

**Request:**
```json
{
  "rentalId": "rental123",
  "paymentMethod": {
    "type": "card",
    "token": "tok_visa"
  }
}
```

**Response:**
```json
{
  "id": "payment123",
  "status": "succeeded",
  "amount": 109.98,
  "currency": "usd",
  "rental": "rental123"
}
```

## Error Handling

The API uses conventional HTTP response codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

Error responses include:
```json
{
  "error": {
    "code": "invalid_request",
    "message": "Detailed error message"
  }
}
```

## Security

- All requests must use HTTPS
- JWT tokens expire after 24 hours
- API keys are rate limited per IP
- OAuth2 support for third-party integrations

## SDKs

Official SDKs are available for:
- JavaScript/TypeScript
- Python
- Ruby
- PHP

## Support

For API support:
- Email: api@mylibaas.com
- Documentation: docs.mylibaas.com
- Status: status.mylibaas.com
