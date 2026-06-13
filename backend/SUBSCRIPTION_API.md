# Premium Subscription API - Quick Reference

## Endpoints

### 1. Get Available Plans
```
GET /api/subscription/plans
```

**Response**:
```json
{
  "plans": [
    {
      "id": "1_month",
      "name": "1 Month",
      "price": 3000,
      "duration": 30,
      "savings": 0
    },
    {
      "id": "6_months",
      "name": "6 Months",
      "price": 15000,
      "duration": 180,
      "savings": 17
    },
    {
      "id": "12_months",
      "name": "12 Months",
      "price": 24000,
      "duration": 365,
      "savings": 33
    }
  ],
  "currency": "MWK",
  "features": [
    "See who likes you",
    "Unlimited swipes",
    "Global Passport (all regions)",
    "Priority visibility"
  ]
}
```

---

### 2. Initiate Payment
```
POST /api/subscription/initiate
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "plan": "1_month",
  "paymentMethod": "airtel_money",
  "phoneNumber": "265991234567"
}
```

**Response**:
```json
{
  "message": "Payment initiated. Please approve on your phone.",
  "referenceId": "KON-1702123456789-A1B2C3D4",
  "transactionId": "TXN123456",
  "amount": 3000,
  "paymentMethod": "airtel_money"
}
```

---

### 3. Check Payment Status
```
GET /api/subscription/payment-status/:referenceId
Authorization: Bearer <token>
```

**Response** (Completed):
```json
{
  "status": "completed",
  "message": "Payment successful! Premium activated.",
  "subscription": {
    "_id": "...",
    "userId": "...",
    "plan": "1_month",
    "status": "active",
    "startDate": "2024-12-09T10:00:00Z",
    "endDate": "2025-01-08T10:00:00Z",
    "amount": 3000
  }
}
```

**Response** (Pending):
```json
{
  "status": "processing",
  "payment": { ... }
}
```

---

### 4. Get Subscription Status
```
GET /api/subscription/status
Authorization: Bearer <token>
```

**Response**:
```json
{
  "isPremium": true,
  "premiumUntil": "2025-01-08T10:00:00Z",
  "subscription": {
    "plan": "1_month",
    "status": "active",
    "startDate": "2024-12-09T10:00:00Z",
    "endDate": "2025-01-08T10:00:00Z"
  }
}
```

---

### 5. Cancel Subscription
```
POST /api/subscription/cancel
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "Subscription cancelled successfully",
  "subscription": { ... }
}
```

---

## Payment Flow

1. **User selects plan** → Frontend calls `/api/subscription/initiate`
2. **Backend initiates payment** with Airtel Money or Mpamba
3. **User approves on phone** (USSD prompt)
4. **Frontend polls** `/api/subscription/payment-status/:referenceId` every 3-5 seconds
5. **Payment completes** → Subscription activated, user becomes premium

---

## Premium Access Middleware

Protect premium-only routes:

```javascript
const checkPremium = require('../middleware/checkPremium');

// Example: Premium-only endpoint
router.get('/likes/who-liked-me', authMiddleware, checkPremium, likesController.getWhoLikedMe);
```

---

## Environment Variables

Add to `.env`:
```env
# Airtel Money
AIRTEL_MONEY_API_KEY=your_api_key
AIRTEL_MONEY_SECRET=your_secret
AIRTEL_MONEY_BASE_URL=https://openapiuat.airtel.africa
AIRTEL_MONEY_MERCHANT_ID=your_merchant_id

# TNM Mpamba
MPAMBA_API_KEY=your_api_key
MPAMBA_SECRET=your_secret
MPAMBA_BASE_URL=https://api.mpamba.mw
MPAMBA_MERCHANT_ID=your_merchant_id
```

---

## Testing

### Mock Payment (Development)
For testing without real payment gateways, modify `paymentService.js`:

```javascript
// At the top of initiateAirtelMoney or initiateMpamba
if (process.env.NODE_ENV === 'development') {
    return {
        success: true,
        transactionId: 'MOCK-' + Date.now(),
        status: 'completed',
        message: 'Mock payment successful'
    };
}
```

---

## Files Created

- `src/models/Subscription.js` - Subscription records
- `src/models/Payment.js` - Payment transactions
- `src/services/paymentService.js` - Airtel Money & Mpamba integration
- `src/controllers/subscriptionController.js` - Business logic
- `src/routes/subscriptionRoutes.js` - API routes
- `src/middleware/checkPremium.js` - Premium access control
