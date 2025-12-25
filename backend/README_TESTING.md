# Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run Unit Tests
```bash
npm test
```

### 3. Run Tests in Watch Mode
```bash
npm run test:watch
```

### 4. Seed Test Data
```bash
npm run seed
```

## Test Structure

### Unit Tests
- `src/tests/subscriptions.test.js` - Tests for subscription data layer
- `src/tests/alerts.test.js` - Tests for alerts detection logic

### Test Data
- `src/scripts/seedTestData.js` - Script to populate test users and subscriptions
- `src/scripts/testProfiles.md` - Documentation of test profiles and scenarios

## Test Users

After running `npm run seed`, you can login with:

1. **Fatima Ahmed** - `fatima.ahmed@example.com` / `test123`
2. **Omar Khalid** - `omar.khalid@example.com` / `test123`
3. **Reem Sultan** - `reem.sultan@example.com` / `test123`
4. **Amna Hassan** - `amna.hassan@example.com` / `test123`

## Test Scenarios

### Scenario 1: Low Usage Detection
1. Login as `omar.khalid@example.com`
2. Navigate to Alerts tab
3. Should see 3+ low usage subscriptions
4. Test cancellation flow

### Scenario 2: Renewal Alerts
1. Login as `reem.sultan@example.com`
2. Check Dashboard for renewal alerts
3. Navigate to Alerts tab
4. Should see upcoming renewals

### Scenario 3: Cancellation
1. Login as any test user
2. Go to Subscriptions
3. Click cancel button
4. Verify status changes

### Scenario 4: Privacy Settings
1. Login as any user
2. Click Settings in header
3. Test data export
4. Test email disconnection

## Manual API Testing

### Get All Subscriptions
```bash
curl http://localhost:3000/api/subscriptions
```

### Create Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Service",
    "provider": "Test",
    "amount": 10.0,
    "nextBilling": "2024-02-20"
  }'
```

### Cancel Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions/1/cancel
```

### Get Alerts
```bash
curl http://localhost:3000/api/subscriptions/alerts
```

### Get Privacy Overview (requires auth token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/privacy/overview
```

## Test Coverage

Current test coverage includes:
- ✅ Subscription CRUD operations
- ✅ Status updates
- ✅ Cancellation
- ✅ Low usage detection (14+ days)
- ✅ Upcoming renewal detection (7 days)
- ✅ Combined alert scenarios

## Running Specific Tests

```bash
# Run only subscription tests
npm test subscriptions

# Run only alert tests
npm test alerts
```

## Continuous Testing

For development, use watch mode:
```bash
npm run test:watch
```

This will automatically re-run tests when files change.

