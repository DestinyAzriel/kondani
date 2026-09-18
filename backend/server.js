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

app.set('io', io);

const { onlineUsers } = require('./src/controllers/chatController');
const User = require('./src/models/User');
const Message = require('./src/models/Message');
const mongoose = require('mongoose');

// Track in-flight call attempts: key = sorted(caller_callee), value = { callerId, calleeId, mode, answered: false, createdAt }
const activeCalls = new Map();

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

      // Automatically mark pending undelivered messages to this user as delivered!
      const userObjId = mongoose.Types.ObjectId.isValid(strUserId) ? new mongoose.Types.ObjectId(strUserId) : strUserId;
      const pendingDeliveries = await Message.find({
        chatId: { $regex: strUserId },
        sender: { $ne: userObjId },
        delivered: false
      }).select('_id chatId sender');

      if (pendingDeliveries.length > 0) {
        await Message.updateMany(
          { _id: { $in: pendingDeliveries.map(m => m._id) } },
          { delivered: true }
        );
        pendingDeliveries.forEach(m => {
          io.to(String(m.sender)).emit('message_delivered', { messageId: m._id, chatId: m.chatId });
        });
      }
    } catch (e) {
      console.error('Error in socket join status update:', e);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id, socket.userId);
    if (socket.userId) {
      const uid = socket.userId;
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
    const callerId = String(data.from);
    const calleeId = String(data.userToCall);
    const callKey = [callerId, calleeId].sort().join('_');
    activeCalls.set(callKey, {
      callerId,
      calleeId,
      mode: data.mode || 'video',
      answered: false,
      createdAt: Date.now()
    });

    io.to(calleeId).emit('call_made', {
      offer: data.signalData,
      from: callerId,
      name: data.name || '',
      photo: data.photo || '',
      mode: data.mode || 'video'
    });
  });

  socket.on('answer_call', (data) => {
    const fromId = String(data.from);
    const toId = String(data.to);
    const callKey = [fromId, toId].sort().join('_');
    const existing = activeCalls.get(callKey);
    if (existing) {
      existing.answered = true;
    }

    io.to(toId).emit('call_answered', {
      signal: data.signal,
      from: fromId
    });
  });

  socket.on('ice_candidate', (data) => {
    io.to(data.to).emit('ice_candidate', {
      candidate: data.candidate,
      from: data.from
    });
  });

  // Caller cancels or either side hangs up / declines
  socket.on('end_call', async (data) => {
    if (data && data.to) io.to(String(data.to)).emit('call_ended');

    const toId = data?.to ? String(data.to) : '';
    const fromId = data?.from ? String(data.from) : (socket.userId || '');
    const callKey = (toId && fromId) ? [fromId, toId].sort().join('_') : null;
    const trackedCall = callKey ? activeCalls.get(callKey) : null;

    const isAnswered = data?.connected === true || (trackedCall && trackedCall.answered);

    if (!isAnswered && (trackedCall || (fromId && toId))) {
      try {
        const callerId = trackedCall?.callerId || (data?.initiator ? fromId : (data?.callerId || fromId));
        const calleeId = trackedCall?.calleeId || (callerId === fromId ? toId : fromId);
        const mode = (trackedCall?.mode || data?.mode || 'video') === 'audio' ? 'voice' : 'video';
        const chatId = [callerId, calleeId].sort().join('_');
        const messageType = mode === 'voice' ? 'missed_voice_call' : 'missed_video_call';
        const content = mode === 'voice' ? 'Missed voice call' : 'Missed video call';

        // Check recent missed call in last 5 seconds to prevent duplicates
        const recentMissed = await Message.findOne({
          chatId,
          messageType,
          createdAt: { $gte: new Date(Date.now() - 5000) }
        });

        if (!recentMissed) {
          const missedMsg = await Message.create({
            chatId,
            sender: callerId,
            content,
            messageType,
            read: false,
            delivered: onlineUsers.has(calleeId)
          });

          const payload = {
            id: missedMsg._id,
            chatId,
            sender: callerId,
            from: callerId,
            to: calleeId,
            content,
            messageType,
            time: missedMsg.createdAt,
            read: false,
            delivered: missedMsg.delivered
          };

          // Deliver missed call card to callee and caller
          io.to(calleeId).emit('new_message', { ...payload, isMe: false });
          io.to(callerId).emit('new_message', { ...payload, isMe: true });
        }
      } catch (err) {
        console.error('Error creating missed call message:', err);
      }
    }

    if (callKey) activeCalls.delete(callKey);
  });

  // Chat Messages: Real-time WhatsApp-style delivery & tick tracking
  socket.on('send_message', async (data) => {
    // data: { id, to, from, content, messageType, mediaUrl, chatId }
    const toId = String(data?.to);
    const fromId = String(data?.from);
    const isRecipientOnline = onlineUsers.has(toId);

    // Auto-mark prior messages from recipient in this chat as delivered and read since sender is replying
    try {
      const fromObjId = mongoose.Types.ObjectId.isValid(fromId) ? new mongoose.Types.ObjectId(fromId) : fromId;
      await Message.updateMany(
        { chatId: data.chatId, sender: { $ne: fromObjId }, $or: [{ read: false }, { delivered: false }] },
        { read: true, delivered: true }
      );
      io.to(fromId).emit('messages_read', { chatId: data.chatId });
      io.to(toId).emit('messages_read', { chatId: data.chatId });
    } catch (e) {
      console.error('Error auto-marking read on reply:', e);
    }

    const messagePayload = {
      ...data,
      sender: fromId,
      from: fromId,
      isMe: false,
      delivered: isRecipientOnline
    };

    if (isRecipientOnline) {
      try {
        if (data.id) {
          await Message.findByIdAndUpdate(data.id, { delivered: true });
        }
      } catch (e) {
        console.error('Error marking message delivered:', e);
      }

      io.to(toId).emit('new_message', messagePayload);
      io.to(fromId).emit('message_delivered', { messageId: data.id, chatId: data.chatId });
    } else {
      io.to(toId).emit('new_message', { ...messagePayload, delivered: false });
    }
  });

  // Read receipts: Turn gray ticks -> double sky-blue ticks (✓✓)
  socket.on('mark_read', async (data) => {
    // data: { chatId, readerId, senderId }
    if (!data?.chatId) return;
    try {
      const query = { chatId: data.chatId, $or: [{ read: false }, { delivered: false }] };
      if (data.senderId && mongoose.Types.ObjectId.isValid(data.senderId)) {
        query.sender = new mongoose.Types.ObjectId(data.senderId);
      } else if (data.readerId && mongoose.Types.ObjectId.isValid(data.readerId)) {
        query.sender = { $ne: new mongoose.Types.ObjectId(data.readerId) };
      }

      await Message.updateMany(query, { read: true, delivered: true });

      const targetId = data.senderId || (String(data.chatId).includes('_') ? String(data.chatId).split('_').find(id => id !== String(data.readerId)) : null);
      if (targetId) {
        io.to(String(targetId)).emit('messages_read', { chatId: data.chatId });
      }
      io.to(String(data.chatId)).emit('messages_read', { chatId: data.chatId });
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
