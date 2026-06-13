const Message = require('../models/Message');
const User = require('../models/User');
const Intent = require('../models/Intent');

// In-memory storage for online users and typing indicators
// In production, this should be replaced with Redis or similar
const onlineUsers = new Map();
const typingIndicators = new Map();

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

            return {
                id: chatId,
                userId: match._id,
                name: match.name,
                photo: match.photos[0] || 'https://via.placeholder.com/150',
                lastMessage: lastMessage ? lastMessage.content : 'Start chatting!',
                lastMessageTime: lastMessage ? lastMessage.createdAt : match.createdAt, // fallback
                unread: lastMessage ? (!lastMessage.read && lastMessage.sender.toString() !== currentUserId) : false,
                online: onlineUsers.has(match._id.toString()) || false,
                isVerified: match.isVerified,
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
        const currentUserId = req.user.id;
        onlineUsers.set(currentUserId, Date.now());
        
        // Clean up old entries (older than 5 minutes)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        for (const [userId, timestamp] of onlineUsers.entries()) {
            if (timestamp < fiveMinutesAgo) {
                onlineUsers.delete(userId);
            }
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Set user as offline
exports.setUserOffline = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        onlineUsers.delete(currentUserId);
        res.json({ success: true });
    } catch (err) {
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
        const url = `/uploads/chat-media/${req.file.filename}`;
        res.json({ url });
    } catch (err) {
        console.error('uploadChatMedia error:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
};