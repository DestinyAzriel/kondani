const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const intentRoutes = require('./src/routes/intentRoutes');
const likesRoutes = require('./src/routes/likesRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const verificationRoutes = require('./src/routes/verificationRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const moderationRoutes = require('./src/routes/moderationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
// const oauthRoutes = require('./src/routes/oauthRoutes'); // Temporarily disabled

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  // Allow frontend dev server on default 5173 and alternate 5174, plus any localhost host
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const allowed = [
      'http://localhost:5173', 'http://127.0.0.1:5173',
      'http://localhost:5174', 'http://127.0.0.1:5174'
    ]
    if (allowed.includes(origin)) return callback(null, true)
    // allow other localhost origins (different ports)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true)
    return callback(new Error('CORS policy: origin not allowed'), false)
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kondani')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
// New competitive feature routes
const profileRoutes = require('./src/routes/profileRoutes');
const activityRoutes = require('./src/routes/activityRoutes');

app.use('/api/auth', authRoutes);
// app.use('/api/oauth', oauthRoutes); // Temporarily disabled
app.use('/api/intents', intentRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/activity', activityRoutes);

// Test endpoint for diagnostics (no authentication required)
app.get('/api/test-db', async (req, res) => {
  try {
    // Try to connect to the database
    const dbState = mongoose.connection.readyState;
    let status;

    switch (dbState) {
      case 0:
        status = 'disconnected';
        break;
      case 1:
        status = 'connected';
        break;
      case 2:
        status = 'connecting';
        break;
      case 3:
        status = 'disconnecting';
        break;
      default:
        status = 'unknown';
    }

    // Try to fetch a sample user count
    const User = require('./src/models/User');
    const userCount = await User.countDocuments({});

    res.json({
      database: 'MongoDB',
      status: status,
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database connection test failed',
      message: error.message
    });
  }
});

// Health check endpoint (no authentication required)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Kondani Backend'
  });
});

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    // Mirror the express cors policy for socket connections
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      const allowed = [
        'http://localhost:5173', 'http://127.0.0.1:5173',
        'http://localhost:5174', 'http://127.0.0.1:5174'
      ]
      if (allowed.includes(origin)) return callback(null, true)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true)
      return callback(new Error('CORS policy: origin not allowed'), false)
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user room for private messages
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // WebRTC Signaling
  socket.on('call_user', (data) => {
    io.to(data.userToCall).emit('call_made', {
      offer: data.signalData,
      from: data.from,
      name: data.name || '',
      mode: data.mode || 'video'
    });
  });

  socket.on('answer_call', (data) => {
    io.to(data.to).emit('call_answered', {
      signal: data.signal
    });
  });

  socket.on('ice_candidate', (data) => {
    io.to(data.to).emit('ice_candidate', {
      candidate: data.candidate
    });
  });

  // Caller cancels or either side hangs up / declines
  socket.on('end_call', (data) => {
    if (data && data.to) io.to(data.to).emit('call_ended');
  });

  // Chat Messages
  socket.on('send_message', (data) => {
    // data: { to, from, content, type }
    io.to(data.to).emit('new_message', data);
  });
});

// Make io accessible in routes
app.set('io', io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
