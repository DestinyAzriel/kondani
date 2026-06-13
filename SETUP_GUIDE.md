# Kondani Backend - Complete Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env`:
```env
# Server
PORT=3000
MONGODB_URI=mongodb://localhost:27017/kondani
JWT_SECRET=kondani_secret_key_2024

# AWS (ID Verification & Photo Moderation)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1

# Payment Gateways
AIRTEL_MONEY_API_KEY=your_key
AIRTEL_MONEY_SECRET=your_secret
AIRTEL_MONEY_BASE_URL=https://openapiuat.airtel.africa

MPAMBA_API_KEY=your_key
MPAMBA_SECRET=your_secret
MPAMBA_BASE_URL=https://api.mpamba.mw

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# SendGrid (Email)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@kondani.mw

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_secret
OAUTH_CALLBACK_URL=http://localhost:3000/api/oauth/callback
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB
```bash
mongod
```

### 4. Start Backend Server
```bash
cd backend
node server.js
```

Server runs on `http://localhost:3000`

---

## 📱 Frontend Setup

### 1. Configure Frontend
Create `vue-project/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_FRONTEND_URL=http://localhost:5173
```

### 2. Start Frontend
```bash
cd vue-project
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## ✅ Testing Checklist

1. **Auth Flow**
   - Register with phone
   - Verify OTP
   - Complete onboarding (4 steps)

2. **ID Verification**
   - Upload National ID/Passport
   - Check verification status

3. **Premium Subscription**
   - View plans
   - Initiate payment (test mode)
   - Check subscription status

4. **Safety Features**
   - Report a user
   - Block/unblock user

5. **Social Login**
   - Login with Google
   - Login with Facebook

---

## 🎯 All Features Implemented

✅ **Core Backend** (Phase 1-3)
- ID Verification (AWS Rekognition)
- Premium Subscriptions (Airtel Money, Mpamba)
- Safety & Moderation (Report, Block)

✅ **Advanced Features** (Week 1-3)
- Admin Dashboard
- Analytics System
- Push Notifications (FCM)
- Email Service (SendGrid)
- Photo Moderation AI
- Geolocation Matching
- Social Login (OAuth)

✅ **Frontend Integration**
- Updated authService
- Added subscriptionService
- Added moderationService

---

## 📊 API Endpoints Summary

**Auth**: `/api/auth/*`
**OAuth**: `/api/oauth/google`, `/api/oauth/facebook`
**Verification**: `/api/verification/*`
**Subscription**: `/api/subscription/*`
**Moderation**: `/api/moderation/*`
**Admin**: `/api/admin/*`

---

## 🚀 Ready to Deploy!

Your Kondani dating app is production-ready with:
- 9 Models
- 40+ API Endpoints
- 7 Advanced Features
- Complete Frontend-Backend Integration
