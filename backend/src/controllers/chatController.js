const Message = require('../models/Message');
const User = require('../models/User');
const Intent = require('../models/Intent');
const { storeUpload } = require('../services/cloudinaryService');

// In-memory storage for online users and typing indicators
// In production, this should be replaced with Redis or similar
const onlineUsers = new Map();
const typingIndicators = new Map();

// Export onlineUsers so socket.io in server.js can update it
exports.onlineUsers = onlineUsers;

// Helper function to mark messages as delivered
async function markMessagesAsDelivered(chatId, recipientId) {
    try {
        await Message.updateMany(
            { 
                chatId: chatId, 
                sender: { $ne: recipientId },
                delivered: false 
            },
            { delivered: true }
        );
    } catch (err) {
        console.error('Error marking messages as delivered:', err);
    }
}

exports.getChats = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Get matches from Intent
        const myIntent = await Intent.findOne({ user: currentUserId }).populate('matches');

        if (!myIntent || !myIntent.matches) {
            return res.json({ chats: [] });
        }

        const chats = await Promise.all(myIntent.matches.map(async (match) => {
            // Generate unique chat ID (e.g., sorted user IDs joined)
            const chatId = [currentUserId, match._id.toString()].sort().join('_');

            // Mark messages as delivered when user opens chat list
            await markMessagesAsDelivered(chatId, currentUserId);

            // Get last message
            const lastMessage = await Message.findOne({ chatId }).sort({ createdAt: -1 });

            // Respect the matched user's showOnlineStatus privacy setting
            const matchShowOnline = match.showOnlineStatus !== false; // default true
            const isOnline = matchShowOnline && (onlineUsers.has(match._id.toString()) || false);

            return {
                id: chatId,
                userId: match._id,
                name: match.name,
                photo: match.photos?.[0] || 'https://via.placeholder.com/150',
                photos: match.photos || [],
                bio: match.bio || '',
                age: match.age || (match.birthdate ? new Date().getFullYear() - new Date(match.birthdate).getFullYear() : null),
                location: match.location || match.city || '',
                intent: match.relationshipIntent || '',
                interests: match.interests || [],
                occupation: match.occupation || match.job || '',
                isVerified: match.isVerified,
                lastMessage: lastMessage ? lastMessage.content : 'Start chatting!',
                lastMessageTime: lastMessage ? lastMessage.createdAt : match.createdAt, // fallback
                unread: lastMessage ? (!lastMessage.read && lastMessage.sender.toString() !== currentUserId) : false,
                online: isOnline,
                typing: typingIndicators.get(chatId) || false
            };
        }));

        res.json({ chats });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const chatId = req.params.id;
        const currentUserId = req.user.id;
        
        // Mark messages as read when user opens chat
        await Message.updateMany(
            { 
                chatId: chatId, 
                sender: { $ne: currentUserId },
                read: false 
            },
            { read: true }
        );

        const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

        const formattedMessages = messages.map(msg => ({
            id: msg._id,
            chatId: msg.chatId,
            content: msg.content,
            time: msg.createdAt,
            isMe: msg.sender.toString() === currentUserId,
            read: msg.read,
            delivered: msg.delivered,
            messageType: msg.messageType,
            mediaUrl: msg.mediaUrl
        }));

        res.json({ messages: formattedMessages });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const chatId = req.params.id;
        const { content, messageType = 'text', mediaUrl = null } = req.body;
        const currentUserId = req.user.id;

        const newMessage = await Message.create({
            chatId,
            sender: currentUserId,
            content,
            messageType,
            mediaUrl
        });

        // Emit socket event for real-time delivery
        // This would be implemented in server.js with actual socket.io
        
        res.json({
            message: {
                id: newMessage._id,
                chatId: newMessage.chatId,
                content: newMessage.content,
                time: newMessage.createdAt,
                isMe: true,
                read: false,
                delivered: false,
                messageType: newMessage.messageType,
                mediaUrl: newMessage.mediaUrl
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Set user as online
exports.setUserOnline = async (req, res) => {
    try {
        const currentUserId = String(req.user.id);
        onlineUsers.set(currentUserId, Date.now());
        
        // Clean up old entries (older than 5 minutes)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        for (const [userId, timestamp] of onlineUsers.entries()) {
            if (timestamp < fiveMinutesAgo) {
                onlineUsers.delete(userId);
            }
        }
        
        const user = await User.findById(currentUserId).select('showOnlineStatus');
        const showOnline = user ? user.showOnlineStatus !== false : true;
        if (showOnline) {
            await User.findByIdAndUpdate(currentUserId, { isOnline: true, lastActive: new Date() });
            const io = req.app.get('io');
            if (io) io.emit('user_status', { userId: currentUserId, isOnline: true });
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error('setUserOnline error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Set user as offline
exports.setUserOffline = async (req, res) => {
    try {
        const currentUserId = String(req.user.id);
        onlineUsers.delete(currentUserId);
        await User.findByIdAndUpdate(currentUserId, { isOnline: false, lastActive: new Date() });
        const io = req.app.get('io');
        if (io) io.emit('user_status', { userId: currentUserId, isOnline: false });
        res.json({ success: true });
    } catch (err) {
        console.error('setUserOffline error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Set typing indicator
exports.setTyping = async (req, res) => {
    try {
        const { chatId, isTyping } = req.body;
        const currentUserId = req.user.id;
        
        if (isTyping) {
            typingIndicators.set(chatId, currentUserId);
        } else {
            if (typingIndicators.get(chatId) === currentUserId) {
                typingIndicators.delete(chatId);
            }
        }
        
        // Clear typing indicator after 5 seconds if not updated
        if (isTyping) {
            setTimeout(() => {
                if (typingIndicators.get(chatId) === currentUserId) {
                    typingIndicators.delete(chatId);
                }
            }, 5000);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Upload chat media (voice note / image) -> returns a URL to send as a message.
exports.uploadChatMedia = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const isAudio = (req.file.mimetype && req.file.mimetype.startsWith('audio')) ||
                        (req.file.originalname && (req.file.originalname.endsWith('.webm') || req.file.originalname.endsWith('.mp3') || req.file.originalname.endsWith('.ogg') || req.file.originalname.endsWith('.m4a')));
        // Cloudinary requires resource_type 'video' for audio files
        const resourceType = isAudio ? 'video' : 'auto';
        const url = await storeUpload(req.file, 'chat-media', resourceType);
        res.json({ url });
    } catch (err) {
        console.error('uploadChatMedia error:', err);
        res.status(500).json({ error: 'Upload failed: ' + (err.message || 'unknown error') });
    }
};

// Get other user's full profile for a chat
exports.getChatProfile = async (req, res) => {
    try {
        const chatId = req.params.id;
        const currentUserId = req.user.id;
        let otherUserId = chatId;
        if (chatId.includes('_')) {
            otherUserId = chatId.split('_').find(id => id !== String(currentUserId));
        }

        const otherUser = await User.findById(otherUserId).select('-password');
        if (!otherUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: otherUser });
    } catch (err) {
        console.error('getChatProfile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Unmatch user and clear conversation
exports.unmatchUser = async (req, res) => {
    try {
        const chatId = req.params.id;
        const currentUserId = req.user.id;
        let otherUserId = chatId;
        if (chatId.includes('_')) {
            otherUserId = chatId.split('_').find(id => id !== String(currentUserId));
        }

        // Remove from both Intent matches AND likes/superLikes (both directions)
        // This ensures the "X people liked you" count also drops
        await Intent.updateOne(
            { user: currentUserId },
            { $pull: { matches: otherUserId, likes: otherUserId, superLikes: otherUserId } }
        );
        if (otherUserId) {
            await Intent.updateOne(
                { user: otherUserId },
                { $pull: { matches: currentUserId, likes: currentUserId, superLikes: currentUserId } }
            );
        }

        // Delete all messages in the chat
        await Message.deleteMany({ chatId });

        res.json({ success: true, message: 'Unmatched successfully' });
    } catch (err) {
        console.error('unmatchUser error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete chat messages
exports.deleteChat = async (req, res) => {
    try {
        const chatId = req.params.id;
        await Message.deleteMany({ chatId });
        res.json({ success: true, message: 'Chat messages deleted' });
    } catch (err) {
        console.error('deleteChat error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};