# Safety & Moderation API - Quick Reference

## User Actions

### 1. Report User
```
POST /api/moderation/report
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "reportedUserId": "user_id_here",
  "reason": "harassment",
  "description": "Optional detailed description"
}
```

**Reasons**: `harassment`, `fake_profile`, `inappropriate_content`, `scam`, `spam`, `other`

**Response**:
```json
{
  "message": "Report submitted successfully. Our team will review it within 24 hours.",
  "report": { ... }
}
```

**Auto-Review**: If a user receives 3+ reports, status automatically changes to `under_review`.

---

### 2. Block User
```
POST /api/moderation/block
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "blockedUserId": "user_id_here",
  "reason": "Optional reason"
}
```

**Response**:
```json
{
  "message": "User blocked successfully",
  "block": { ... }
}
```

**Effects**:
- Blocked user won't appear in your feed
- Can't send you messages
- Can't see your profile

---

### 3. Unblock User
```
POST /api/moderation/unblock
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "blockedUserId": "user_id_here"
}
```

---

### 4. Get Blocked Users
```
GET /api/moderation/blocked-users
Authorization: Bearer <token>
```

**Response**:
```json
{
  "blocks": [
    {
      "_id": "...",
      "blockedUserId": {
        "name": "John Doe",
        "photos": ["..."]
      },
      "createdAt": "2024-12-09T10:00:00Z"
    }
  ]
}
```

---

## Admin Actions

### 5. Get All Reports
```
GET /api/moderation/reports?status=pending&page=1&limit=20
Authorization: Bearer <admin_token>
```

**Query Params**:
- `status` (optional): `pending`, `under_review`, `resolved`, `dismissed`
- `page` (default: 1)
- `limit` (default: 20)

**Response**:
```json
{
  "reports": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### 6. Review Report (Admin)
```
POST /api/moderation/reports/:reportId/review
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "status": "resolved",
  "action": "warning",
  "actionNotes": "User warned about inappropriate behavior"
}
```

**Actions**: `none`, `warning`, `temporary_ban`, `permanent_ban`, `account_deleted`

**Auto-Ban**: If action is `temporary_ban` or `permanent_ban`, user is automatically banned.

---

## Integration with Other Features

### Filter Blocked Users in Feed
```javascript
// In intentController.js
const blockedUsers = await Block.find({ blockerId: userId }).select('blockedUserId');
const blockedIds = blockedUsers.map(b => b.blockedUserId);

const profiles = await User.find({
  _id: { $nin: [...blockedIds, userId] },
  isBanned: false
});
```

### Check if User is Banned (Middleware)
```javascript
const checkBan = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (user.isBanned) {
    const isPermanent = !user.bannedUntil;
    const isStillBanned = user.bannedUntil && user.bannedUntil > new Date();
    
    if (isPermanent || isStillBanned) {
      return res.status(403).json({ 
        error: 'Account banned',
        reason: user.banReason,
        until: user.bannedUntil
      });
    } else {
      // Temporary ban expired
      user.isBanned = false;
      user.banReason = null;
      user.bannedUntil = null;
      await user.save();
    }
  }
  
  next();
};
```

---

## Files Created

- `src/models/Report.js` - Report records
- `src/models/Block.js` - Block relationships
- `src/controllers/moderationController.js` - Business logic
- `src/routes/moderationRoutes.js` - API routes

**Updated**:
- `src/models/User.js` - Added ban tracking fields
- `server.js` - Added moderation routes
