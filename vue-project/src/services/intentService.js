// src/services/intentService.js
import api from '@/services/api'

export const intentService = {
  // Get nearby intents
  async getIntents(page = 1, limit = 10) {
    const response = await api.get('/intents', {
      params: { page, limit }
    })
    return response.data // { intents, hasMore }
  },

  // Like an intent
  async likeIntent(intentId) {
    const response = await api.post(`/intents/${intentId}/like`)
    return response.data // { isMatch, matchData, likesRemaining }
  },

  // Super Like an intent
  async superLikeIntent(intentId) {
    const response = await api.post(`/intents/${intentId}/superlike`)
    return response.data // { isMatch, matchData, superLikesRemaining }
  },

  // Pass an intent
  async passIntent(intentId) {
    await api.post(`/intents/${intentId}/pass`)
  },

  // Rewind (undo) a swipe — Gold only
  async rewindIntent(intentId) {
    const response = await api.post(`/intents/${intentId}/rewind`)
    return response.data
  },

  // Boost yourself for 30 minutes — Gold only
  async boost() {
    const response = await api.post('/intents/boost')
    return response.data // { boostUntil, boostsRemaining, alreadyActive? }
  },

  // Create new intent
  async createIntent(intentData) {
    const response = await api.post('/intents', intentData)
    return response.data
  },

  // Get user's likes
  async getLikes() {
    const response = await api.get('/likes')
    return response.data // { newLikes, mutualLikes }
  },

  // Get user's chats
  async getChats() {
    const response = await api.get('/chats')
    return response.data // { chats }
  },

  // Get messages for a specific chat
  async getChatMessages(chatId) {
    const response = await api.get(`/chats/${chatId}/messages`)
    return response.data // { messages }
  },

  // Send a message
  async sendMessage(chatId, content, messageType = 'text', mediaUrl = null) {
    const response = await api.post(`/chats/${chatId}/messages`, { content, messageType, mediaUrl })
    return response.data // { message }
  },

  // Upload a voice note / image for a chat, returns { url }
  async uploadChatMedia(file, filename = 'voice.webm') {
    const formData = new FormData()
    formData.append('file', file, filename)
    const response = await api.post('/chats/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data // { url }
  },

  // Set user as online
  async setUserOnline() {
    await api.post('/chats/online')
  },

  // Set user as offline
  async setUserOffline() {
    await api.post('/chats/offline')
  },

  // Set typing indicator
  async setTyping(chatId, isTyping) {
    await api.post('/chats/typing', { chatId, isTyping })
  },

  // Get other user's profile in a chat
  async getChatProfile(chatId) {
    const response = await api.get(`/chats/${chatId}/profile`)
    return response.data // { user }
  },

  // Unmatch a user in a chat
  async unmatchUser(chatId) {
    const response = await api.post(`/chats/${chatId}/unmatch`)
    return response.data
  },

  // Delete chat conversation
  async deleteChat(chatId) {
    const response = await api.delete(`/chats/${chatId}`)
    return response.data
  },

  // Block a user
  async blockUser(blockedUserId, reason = 'Blocked by user') {
    const response = await api.post('/moderation/block', { blockedUserId, reason })
    return response.data
  },

  // Report a user
  async reportUser(reportedUserId, reason, description = '') {
    const response = await api.post('/moderation/report', { reportedUserId, reason, description })
    return response.data
  }
}