const admin = require('firebase-admin');

// Initialize Firebase Admin (call this once in server.js)
function initializeFirebase() {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
            })
        });
    }
}

class NotificationService {
    constructor() {
        initializeFirebase();
    }

    /**
     * Send push notification to a user
     */
    async sendToUser(userId, notification) {
        try {
            const User = require('../models/User');
            const user = await User.findById(userId).select('fcmToken');

            if (!user || !user.fcmToken) {
                console.log(`No FCM token for user ${userId}`);
                return { success: false, reason: 'No FCM token' };
            }

            const message = {
                token: user.fcmToken,
                notification: {
                    title: notification.title,
                    body: notification.body,
                    imageUrl: notification.image
                },
                data: notification.data || {},
                webpush: {
                    fcmOptions: {
                        link: notification.link || 'https://kondani.mw'
                    }
                }
            };

            const response = await admin.messaging().send(message);
            return { success: true, messageId: response };

        } catch (error) {
            console.error('Send notification error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send notification for new match
     */
    async sendMatchNotification(userId, matchedUser) {
        return await this.sendToUser(userId, {
            title: '💝 New Match!',
            body: `You matched with ${matchedUser.name}!`,
            image: matchedUser.photos[0],
            link: '/chats',
            data: {
                type: 'match',
                matchedUserId: matchedUser._id.toString()
            }
        });
    }

    /**
     * Send notification for new message
     */
    async sendMessageNotification(userId, sender, messagePreview) {
        return await this.sendToUser(userId, {
            title: `💬 ${sender.name}`,
            body: messagePreview,
            image: sender.photos[0],
            link: `/chat/${sender._id}`,
            data: {
                type: 'message',
                senderId: sender._id.toString()
            }
        });
    }

    /**
     * Send notification for new like (premium only)
     */
    async sendLikeNotification(userId, liker) {
        return await this.sendToUser(userId, {
            title: '❤️ Someone Likes You!',
            body: `${liker.name} liked your profile`,
            image: liker.photos[0],
            link: '/likes',
            data: {
                type: 'like',
                likerId: liker._id.toString()
            }
        });
    }

    /**
     * Send subscription expiring notification
     */
    async sendSubscriptionExpiringNotification(userId, daysLeft) {
        return await this.sendToUser(userId, {
            title: '⚠️ Premium Expiring Soon',
            body: `Your premium subscription expires in ${daysLeft} days`,
            link: '/premium',
            data: {
                type: 'subscription_expiring',
                daysLeft: daysLeft.toString()
            }
        });
    }

    /**
     * Send to multiple users (batch)
     */
    async sendToMultiple(userIds, notification) {
        const promises = userIds.map(userId => this.sendToUser(userId, notification));
        return await Promise.allSettled(promises);
    }
}

module.exports = new NotificationService();
