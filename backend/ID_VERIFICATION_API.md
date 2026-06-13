# ID Verification API - Quick Reference

## Endpoints

### 1. Submit ID Verification
```
POST /api/verification/submit-id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body**:
- `document` (file): ID document image (JPEG/PNG, max 5MB)
- `documentType` (string): `national_id` or `passport`

**Response** (Success):
```json
{
  "message": "ID verification approved automatically",
  "status": "approved",
  "faceMatchScore": 87.5
}
```

**Response** (Pending Review):
```json
{
  "message": "ID verification submitted successfully. Our team will review it within 24 hours.",
  "status": "pending",
  "faceMatchScore": 72.3
}
```

---

### 2. Get Verification Status
```
GET /api/verification/status
Authorization: Bearer <token>
```

**Response**:
```json
{
  "phone": {
    "verified": true,
    "verifiedAt": "2024-12-09T10:30:00Z"
  },
  "id": {
    "verified": false,
    "status": "pending",
    "documentType": "national_id",
    "submittedAt": "2024-12-09T12:00:00Z",
    "faceMatchScore": 72.3,
    "isRealPhoto": true
  }
}
```

---

### 3. Review Verification (Admin)
```
POST /api/verification/review/:verificationId
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "status": "approved",
  "rejectionReason": "Optional reason if rejected"
}
```

---

## Auto-Approval Logic

ID verification is **automatically approved** if:
- Face match score ≥ 85%
- Real photo detected (not cartoon/AI)
- Document has readable text

Otherwise, it goes to **manual review** (pending status).

---

## Testing

### Frontend Integration
Update `authService.js`:
```javascript
async uploadID(file, documentType) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);
  
  const response = await api.post('/verification/submit-id', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

async getVerificationStatus() {
  const response = await api.get('/verification/status');
  return response.data;
}
```

### Test Without AWS (Mock Mode)
Add to `.env`:
```
USE_MOCK_AI=true
```

Then modify `faceDetectionService.js` to check this flag.

---

## Files Created

**Backend**:
- `src/models/IDVerification.js` - Verification records
- `src/routes/verificationRoutes.js` - API routes
- `src/controllers/verificationController.js` - Business logic
- `src/services/faceDetectionService.js` - AWS Rekognition integration
- `uploads/id-documents/` - Document storage

**Updated**:
- `src/models/User.js` - Added verification fields
- `server.js` - Added verification routes
