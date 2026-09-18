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
const planRoutes = require('./src/routes/planRoutes');
// const oauthRoutes = require('./src/routes/oauthRoutes'); // Temporarily disabled

// Allowed CORS origins: localhost (dev) + CLIENT_ORIGIN env (comma-separated)
// + any Render/Vercel/Netlify host.
const envOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);
function isAllowedOrigin(origin) {
  if (!origin) return true;
  const clean = origin.replace(/\/+$/, '');
  if (envOrigins.includes(clean) || envOrigins.includes(origin)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) return true;
  if (/(^https?:\/\/|:\/\/.*?\.)(kondani\.com|onrender\.com|vercel\.app|netlify\.app|duckdns\.org)(:\d+)?$/.test(clean)) return true;
  return false;
}

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use('/uploads', express.static('uploads'));

// Database Connection with automatic retry
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kondani', {
      serverSelectionTimeoutMS: 8000
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};
connectDB();

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
app.use('/api/plans', planRoutes);

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
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

const { onlineUsers } = require('./src/controllers/chatController');
const User = require('./src/models/User');

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user room for private messages & mark online
  socket.on('join', async (userId) => {
    if (!userId) return;
    const strUserId = String(userId);
    socket.userId = strUserId;
    socket.join(strUserId);
    console.log(`User ${strUserId} joined room`);

    // Mark online
    onlineUsers.set(strUserId, Date.now());

    try {
      const user = await User.findById(strUserId).select('showOnlineStatus');
      const showOnline = user ? user.showOnlineStatus !== false : true;
      if (showOnline) {
        await User.findByIdAndUpdate(strUserId, { isOnline: true, lastActive: new Date() });
        io.emit('user_status', { userId: strUserId, isOnline: true });
      }
    } catch (e) {
      console.error('Error in socket join status update:', e);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id, socket.userId);
    if (socket.userId) {
      const uid = socket.userId;
      // Check if user still has other connected sockets
      const stillConnected = Array.from(io.sockets.sockets.values()).some(s => s.userId === uid && s.id !== socket.id);
      if (!stillConnected) {
        onlineUsers.delete(uid);
        try {
          await User.findByIdAndUpdate(uid, { isOnline: false, lastActive: new Date() });
          io.emit('user_status', { userId: uid, isOnline: false });
        } catch (e) {
          console.error('Error updating offline status:', e);
        }
      }
    }
  });

  // WebRTC Signaling
  socket.on('call_user', (data) => {
    io.to(data.userToCall).emit('call_made', {
      offer: data.signalData,
      from: data.from,
      name: data.name || '',
      photo: data.photo || '',
      mode: data.mode || 'video'
    });
  });

  socket.on('answer_call', (data) => {
    io.to(data.to).emit('call_answered', {
      signal: data.signal,
      from: data.from
    });
  });

  socket.on('ice_candidate', (data) => {
    io.to(data.to).emit('ice_candidate', {
      candidate: data.candidate,
      from: data.from
    });
  });

  // Caller cancels or either side hangs up / declines
  socket.on('end_call', (data) => {
    if (data && data.to) io.to(data.to).emit('call_ended');
  });

  // Chat Messages: Real-time WhatsApp-style delivery & tick tracking
  socket.on('send_message', async (data) => {
    // data: { id, to, from, content, messageType, mediaUrl, chatId }
    const toId = String(data?.to);
    const fromId = String(data?.from);
    const isRecipientOnline = onlineUsers.has(toId);

    if (isRecipientOnline) {
      // Recipient is online -> mark delivered in DB and emit double gray tick to sender
      try {
        if (data.id) {
          const Message = require('./src/models/Message');
          await Message.findByIdAndUpdate(data.id, { delivered: true });
        }
      } catch (e) {
        console.error('Error marking message delivered:', e);
      }

      io.to(toId).emit('new_message', { ...data, delivered: true });
      io.to(fromId).emit('message_delivered', { messageId: data.id, chatId: data.chatId });
    } else {
      // Recipient is offline -> message remains single tick (✓)
      io.to(toId).emit('new_message', { ...data, delivered: false });
    }
  });

  // Read receipts: Turn double gray ticks -> double blue/cyan ticks (✓✓)
  socket.on('mark_read', async (data) => {
    // data: { chatId, readerId, senderId }
    if (!data?.chatId || !data?.senderId) return;
    try {
      const Message = require('./src/models/Message');
      await Message.updateMany(
        { chatId: data.chatId, sender: data.senderId, read: false },
        { read: true, delivered: true }
      );
      io.to(String(data.senderId)).emit('messages_read', { chatId: data.chatId });
    } catch (e) {
      console.error('Error in socket mark_read:', e);
    }
  });

  // Real-time live typing indicator
  socket.on('typing', (data) => {
    // data: { chatId, to, from, isTyping }
    if (data?.to) {
      io.to(String(data.to)).emit('user_typing', data);
    }
  });

  // Client subscribes to a specific WhatsApp verification session code
  socket.on('subscribe_whatsapp_verification', (code) => {
    if (code) {
      socket.join(`verification_${code}`);
    }
  });
});

// Make io accessible in routes
app.set('io', io);

// Initialize WhatsApp Inbound Verification Bot
const whatsappBot = require('./src/services/whatsappBotService');
whatsappBot.setIO(io);
whatsappBot.initWhatsAppBot();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
