# MyLibaas Developer Guide

## Getting Started 🚀

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase CLI
- Git

### Setup Instructions

1. **Clone the Repository**
```bash
git clone https://github.com/mylibaas/web-app.git
cd web-app
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```
Edit `.env` with your configuration values.

4. **Firebase Setup**
```bash
npm install -g firebase-tools
firebase login
firebase init
```

5. **Start Development Server**
```bash
npm run dev
```

## Project Structure 📁

```
web-app/
├── src/
│   ├── services/           # Core services
│   │   ├── support/       # Support system
│   │   ├── logistics/     # Shipping & logistics
│   │   ├── quality/       # Quality control
│   │   ├── monitoring/    # Monitoring services
│   │   └── firebase/      # Firebase configuration
│   ├── components/        # React components
│   ├── pages/            # Page components
│   └── utils/            # Utility functions
├── tests/
│   ├── integration/      # Integration tests
│   └── unit/            # Unit tests
├── docs/
│   ├── api/             # API documentation
│   └── guides/          # Additional guides
└── scripts/            # Build & deployment scripts
```

## Development Workflow 🔄

### 1. Branch Management
- `main`: Production-ready code
- `develop`: Development branch
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-name`

### 2. Code Style
We follow the Airbnb JavaScript Style Guide with some modifications:

```javascript
// Good
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// Bad
const calculateTotal = items => items.reduce((sum, item) => sum + item.price, 0);
```

### 3. Testing
Run tests before committing:
```bash
npm run test
```

For specific test suites:
```bash
npm run test -- --pattern=SupportService
```

### 4. Code Review Process
1. Create a pull request
2. Ensure all tests pass
3. Get at least one review
4. Address feedback
5. Merge when approved

## Core Services 🛠️

### Support Service
Handles customer support tickets and inquiries.

```javascript
import SupportService from '@/services/support/SupportService';

// Create a ticket
const ticket = await SupportService.createTicket({
  userId: 'user123',
  type: 'payment',
  subject: 'Refund Issue',
  description: 'Unable to process refund'
});
```

### Shipping Service
Manages logistics and delivery.

```javascript
import ShippingService from '@/services/logistics/ShippingService';

// Create a shipment
const shipment = await ShippingService.createShipment({
  rentalId: 'rental123',
  from: fromAddress,
  to: toAddress,
  items: items
});
```

### Quality Control Service
Handles item inspections and quality assurance.

```javascript
import QualityControlService from '@/services/quality/QualityControlService';

// Perform inspection
const inspection = await QualityControlService.performInspection({
  itemId: 'item123',
  type: 'new_item',
  inspectorId: 'inspector123'
});
```

## Monitoring & Metrics 📊

### Setting Up Monitoring
```javascript
import MonitoringService from '@/services/monitoring/MonitoringService';

// Start monitoring
await MonitoringService.startMonitoring();

// Register alert handler
MonitoringService.registerAlertHandler('critical', async (alert) => {
  // Handle critical alert
});
```

### Viewing Metrics
```javascript
// Get support metrics dashboard
const metrics = await MonitoringService.getMetricsDashboard('support');
```

## Deployment 🚀

### 1. Staging Deployment
```bash
npm run deploy:staging
```

### 2. Production Deployment
```bash
npm run deploy:prod
```

### 3. Monitoring Deployment
```bash
npm run monitor:deployment
```

## Troubleshooting 🔧

### Common Issues

1. **Firebase Connection Issues**
```javascript
// Check Firebase connection
import { db } from '@/services/firebase/firebaseConfig';
const status = await db.collection('health').doc('status').get();
```

2. **API Rate Limiting**
- Check rate limits in `.env`
- Use exponential backoff for retries

3. **Memory Leaks**
- Monitor memory usage through dashboard
- Check for unsubscribed listeners

## Best Practices 👌

1. **Error Handling**
```javascript
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // Handle specific error types
  if (error instanceof ValidationError) {
    // Handle validation error
  }
}
```

2. **Async Operations**
```javascript
// Good
const result = await asyncOperation();

// Bad
asyncOperation().then(result => {
  // Handle result
});
```

3. **State Management**
- Use immutable patterns
- Avoid global state
- Use React Context for shared state

4. **Performance**
- Lazy load components
- Implement proper caching
- Use pagination for large datasets

## Additional Resources 📚

1. [API Documentation](./api/)
2. [Architecture Guide](./guides/architecture.md)
3. [Testing Guide](./guides/testing.md)
4. [Security Guidelines](./guides/security.md)

## Support & Contact 📧

- Technical Issues: tech-support@mylibaas.com
- Architecture Questions: architecture@mylibaas.com
- Security Concerns: security@mylibaas.com
