# Test Profiles & Scenarios

## Test Users

### 1. Fatima Ahmed - Active User
- **Email**: `fatima.ahmed@example.com`
- **Password**: `test123`
- **Profile**: Active user with multiple subscriptions, some recently used
- **Use Case**: Test normal operations, active subscriptions

### 2. Omar Khalid - Low Usage User
- **Email**: `omar.khalid@example.com`
- **Password**: `test123`
- **Profile**: User with subscriptions that haven't been used in 14+ days
- **Use Case**: Test low usage detection and cancellation reminders

### 3. Reem Sultan - Upcoming Renewals
- **Email**: `reem.sultan@example.com`
- **Password**: `test123`
- **Profile**: User with subscriptions renewing within 7 days
- **Use Case**: Test renewal alerts and trial expiration warnings

### 4. Amna Hassan - Cancelled Subscriptions
- **Email**: `amna.hassan@example.com`
- **Password**: `test123`
- **Profile**: User with some cancelled subscriptions
- **Use Case**: Test cancelled subscription display and history

## Test Subscription Scenarios

### Active Subscriptions (Recent Usage)
- **Netflix Premium** - AED 55.00 - Used 2 days ago - Renews in 20 days
- **Spotify Premium** - AED 25.00 - Used yesterday - Renews in 15 days

### Low Usage Subscriptions (14+ days unused)
- **Adobe Creative Cloud** - AED 120.00 - Not used in 20 days - Renews in 25 days
- **Disney+** - AED 30.00 - Not used in 18 days - Renews in 30 days
- **Amazon Prime** - AED 16.00 - Not used in 25 days - Renews in 22 days

### Upcoming Renewals (Within 7 days)
- **Starzplay** - AED 35.00 - Renews in 3 days
- **Apple Music** - AED 19.99 - Renews in 5 days
- **YouTube Premium** - AED 29.00 - Trial expires in 2 days

### Cancelled Subscriptions
- **HBO Max** - AED 45.00 - Cancelled
- **Shahid VIP** - AED 40.00 - Cancelled

### Paused Subscriptions
- **Etisalat Mobile** - AED 150.00 - Paused

## Testing Scenarios

### Scenario 1: Low Usage Detection
1. Login as Omar Khalid
2. Navigate to Alerts tab
3. Should see 3 low usage subscriptions
4. Click "Cancel & Save" on one
5. Verify subscription is cancelled
6. Verify alert is removed

### Scenario 2: Renewal Alerts
1. Login as Reem Sultan
2. Navigate to Dashboard
3. Should see upcoming renewal alerts
4. Navigate to Alerts tab
5. Should see 3 upcoming renewals
6. Cancel one subscription
7. Verify alert is removed

### Scenario 3: Cancellation Flow
1. Login as any user
2. Navigate to Subscriptions
3. Click cancel button on active subscription
4. Confirm cancellation
5. Verify status changes to "Cancelled"
6. Verify cancelledAt timestamp is set
7. Verify cancel button disappears

### Scenario 4: Privacy Settings
1. Login as any user
2. Navigate to Settings (from header)
3. View connected accounts
4. Export data - verify JSON download
5. Disconnect email account
6. Verify email connection is removed

### Scenario 5: Alerts Badge
1. Login as user with alerts
2. Verify Alerts tab shows badge with count
3. Cancel subscriptions to reduce alerts
4. Verify badge count updates

### Scenario 6: Combined Alerts
1. Create subscription that is both:
   - Low usage (14+ days)
   - Upcoming renewal (within 7 days)
2. Verify it appears in both alert sections
3. Cancel subscription
4. Verify it's removed from both sections

## Running Tests

### Unit Tests
```bash
cd backend
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Seed Test Data
```bash
npm run seed
```

## API Testing

### Test Cancel Endpoint
```bash
curl -X POST http://localhost:3000/api/subscriptions/1/cancel
```

### Test Alerts Endpoint
```bash
curl http://localhost:3000/api/subscriptions/alerts
```

### Test Privacy Overview
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/privacy/overview
```

