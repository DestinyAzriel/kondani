# Kondani Backend API Reference

This document specifies the exact API contract that the backend must implement to work with the Kondani frontend.

## Base URL
All endpoints are relative to: `VITE_API_BASE_URL` (configured in `.env`)

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "+265991234567"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+265991234567",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "phoneNumber": "+265991234567",
    "name": "John Doe"
  }
}
```

### Get Current User
```http
GET /users/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "user123",
  "phoneNumber": "+265991234567",
  "name": "John Doe",
  "age": 25,
  "bio": "...",
  "photos": ["url1", "url2"],
  "isVerified": false
}
```

### Upload ID for Verification
```http
POST /users/verify-id
Authorization: Bearer <token>
Content-Type: multipart/form-data

idDocument: <file>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ID submitted for verification"
}
```

---

## Intent (Profile) Endpoints

### Get Nearby Intents
```http
GET /intents?page=1&limit=10
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "intents": [
    {
      "id": "intent123",
      "name": "Chifundo",
      "age": 24,
      "location": "Lilongwe",
      "distance": 3,
      "bio": "Coffee enthusiast...",
      "photos": ["url1", "url2"],
      "interests": ["Music", "Travel"],
      "prompts": [
        {
          "question": "A fact about me",
          "answer": "I speak 3 languages"
        }
      ],
      "isVerified": true
    }
  ],
  "hasMore": true
}
```

### Like an Intent
```http
POST /intents/:id/like
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "isMatch": true,
  "matchData": {
    "id": "intent123",
    "name": "Chifundo",
    "photo": "url"
  }
}
```

### Pass an Intent
```http
POST /intents/:id/pass
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Likes Endpoints

### Get User Likes
```http
GET /likes
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "newLikes": [
    {
      "id": "user456",
      "name": "Thoko",
      "photo": "url",
      "isVerified": false
    }
  ],
  "mutualLikes": [
    {
      "id": "user789",
      "name": "Grace",
      "photo": "url",
      "isVerified": true
    }
  ]
}
```

---

## Chat Endpoints

### Get All Chats
```http
GET /chats
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "chats": [
    {
      "id": "chat123",
      "name": "Thoko",
      "photo": "url",
      "lastMessage": "Hey!",
      "lastMessageTime": "2m ago",
      "unread": true,
      "online": true,
      "isVerified": false
    }
  ]
}
```

### Get Chat Messages
```http
GET /chats/:id/messages
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "messages": [
    {
      "id": "msg123",
      "chatId": "chat123",
      "content": "Hello!",
      "time": "10:00 AM",
      "isMe": false
    }
  ]
}
```

### Send Message
```http
POST /chats/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello, how are you?"
}
```

**Response (200 OK):**
```json
{
  "message": {
    "id": "msg456",
    "chatId": "chat123",
    "content": "Hello, how are you?",
    "time": "10:05 AM",
    "isMe": true
  }
}
```

---

## Socket.IO Events

### Connection
```javascript
// Client connects with auth token
socket.io.connect(VITE_API_BASE_URL, {
  auth: { token: 'Bearer <token>' },
  transports: ['websocket']
})
```

### Chat Events

#### new_message (Server → Client)
Broadcast when a new message is sent to the user.

```javascript
socket.on('new_message', (data) => {
  // data: {
  //   id: "msg789",
  //   chatId: "chat123",
  //   content: "Hi there!",
  //   time: "10:10 AM",
  //   from: "user456"
  // }
})
```

### WebRTC Signaling Events

#### call_user (Client → Server)
Client initiates a video call.

```javascript
socket.emit('call_user', {
  userToCall: 'user456',
  signalData: RTCSessionDescription,
  from: 'user123'
})
```

#### call_made (Server → Client)
Server relays incoming call to recipient.

```javascript
socket.on('call_made', (data) => {
  // data: {
  //   from: "user123",
  //   offer: RTCSessionDescription
  // }
})
```

#### answer_call (Client → Server)
Client answers a call.

```javascript
socket.emit('answer_call', {
  to: 'user123',
  signal: RTCSessionDescription
})
```

#### call_answered (Server → Client)
Server relays answer to caller.

```javascript
socket.on('call_answered', (data) => {
  // data: {
  //   signal: RTCSessionDescription
  // }
})
```

#### ice_candidate (Client ↔ Server ↔ Client)
Exchange ICE candidates for WebRTC connection.

```javascript
// Client sends
socket.emit('ice_candidate', {
  to: 'user456',
  candidate: RTCIceCandidate
})

// Client receives
socket.on('ice_candidate', (data) => {
  // data: {
  //   candidate: RTCIceCandidate
  // }
})
```

---

## Error Responses

All endpoints should return appropriate HTTP status codes:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```
