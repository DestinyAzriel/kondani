# Backend Environment Variables Setup

Add these to your `backend/.env` file:

```env
# Existing
PORT=3000
MONGODB_URI=mongodb://localhost:27017/kondani
JWT_SECRET=kondani_secret_key_2024

# AWS Configuration (for ID Verification)
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1

# Optional: AWS S3 (for photo storage)
AWS_S3_BUCKET=kondani-uploads

# Future: Payment Gateways (Phase 2)
# AIRTEL_MONEY_API_KEY=
# AIRTEL_MONEY_SECRET=
# MPAMBA_API_KEY=
# MPAMBA_SECRET=

# Future: SMS/OTP Service
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
```

## How to Get AWS Credentials

1. **Sign up for AWS**: https://aws.amazon.com/
2. **Create IAM User**:
   - Go to IAM Console
   - Create new user with programmatic access
   - Attach policies: `AmazonRekognitionFullAccess`
3. **Get Credentials**:
   - Copy Access Key ID and Secret Access Key
   - Add to `.env` file

## Testing Without AWS (Development)

For testing without AWS credentials, you can modify the face detection service to return mock results:

```javascript
// In faceDetectionService.js, add at the top:
const USE_MOCK = !process.env.AWS_ACCESS_KEY_ID;

if (USE_MOCK) {
    return { similarity: 85, isMatch: true }; // Mock approval
}
```
