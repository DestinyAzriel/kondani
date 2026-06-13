import api from '@/services/api'

export const moderationService = {
    // Report a user
    async reportUser(userId, reason, description = '') {
        const response = await api.post('/moderation/report', {
            reportedUserId: userId,
            reason,
            description
        })
        return response.data
    },

    // Block a user
    async blockUser(userId, reason = '') {
        const response = await api.post('/moderation/block', {
            blockedUserId: userId,
            reason
        })
        return response.data
    },

    // Unblock a user
    async unblockUser(userId) {
        const response = await api.post('/moderation/unblock', {
            blockedUserId: userId
        })
        return response.data
    },

    // Get blocked users
    async getBlockedUsers() {
        const response = await api.get('/moderation/blocked-users')
        return response.data
    }
}
