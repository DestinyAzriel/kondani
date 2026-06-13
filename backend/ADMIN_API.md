# Admin Dashboard API

## Endpoints

### Dashboard Stats
```
GET /api/admin/dashboard/stats
Authorization: Bearer <admin_token>
```

**Response**: User stats, reports, subscriptions, revenue, pending verifications

### Revenue Analytics
```
GET /api/admin/dashboard/revenue?period=30d
```

**Response**: Revenue by day and by plan

### User Management
```
GET /api/admin/users?page=1&limit=20&search=&role=&isPremium=&isBanned=
PUT /api/admin/users/:userId
DELETE /api/admin/users/:userId
```

## Make User Admin

Update user in MongoDB:
```javascript
db.users.updateOne(
  { phoneNumber: "+265991234567" },
  { $set: { role: "admin" } }
)
```
