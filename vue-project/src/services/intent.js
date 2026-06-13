// src/services/intent.js

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock intents data
const mockIntents = [
  {
    id: '1',
    name: 'Sarah M.',
    age: 28,
    distance: 3,
    bio: 'Looking for genuine connections. Love hiking and photography.',
    photos: ['/avatars/sarah.jpg'],
    verified: true,
    lastActive: '2 hours ago'
  },
  {
    id: '2',
    name: 'James K.',
    age: 32,
    distance: 5,
    bio: 'Software developer. Enjoy board games and cooking.',
    photos: ['/avatars/james.jpg'],
    verified: true,
    lastActive: '1 day ago'
  },
  {
    id: '3',
    name: 'Grace L.',
    age: 25,
    distance: 2,
    bio: 'Teacher and artist. Love dancing and trying new restaurants.',
    photos: ['/avatars/grace.jpg'],
    verified: true,
    lastActive: '3 hours ago'
  }
]

export const intentService = {
  // Get nearby intents
  async getIntents(page = 1, limit = 10) {
    await delay(800)
    
    // For pagination simulation
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const pageIntents = mockIntents.slice(startIndex, endIndex)
    
    return {
      intents: pageIntents,
      hasMore: endIndex < mockIntents.length
    }
  },

  // Like an intent
  async likeIntent(intentId) {
    await delay(500)
    // Simulate 30% chance of match
    const isMatch = Math.random() < 0.3
    return {
      isMatch,
      matchData: isMatch ? {
        id: 'match-' + intentId,
        userId: intentId,
        name: mockIntents.find(i => i.id === intentId)?.name || 'Unknown',
        photo: mockIntents.find(i => i.id === intentId)?.photos[0] || ''
      } : null
    }
  },

  // Pass an intent
  async passIntent(intentId) {
    await delay(300)
    // Nothing to return for pass action
  },

  // Create new intent
  async createIntent(intentData) {
    await delay(600)
    return {
      id: 'new-' + Date.now(),
      ...intentData,
      createdAt: new Date().toISOString()
    }
  },

  // Get user's likes
  async getLikes() {
    await delay(700)
    return {
      newLikes: 3,
      mutualLikes: [
        {
          id: 'mutual-1',
          name: 'Emma T.',
          photo: '/avatars/emma.jpg',
          lastMessage: 'Hey! How are you?',
          timestamp: '2 hours ago'
        }
      ]
    }
  },

  // Get user's chats
  async getChats() {
    await delay(700)
    return {
      chats: [
        {
          id: 'chat-1',
          name: 'David M.',
          photo: '/avatars/david.jpg',
          lastMessage: 'See you tomorrow!',
          timestamp: '5 mins ago',
          unread: 0
        },
        {
          id: 'chat-2',
          name: 'Lisa K.',
          photo: '/avatars/lisa.jpg',
          lastMessage: 'That restaurant was amazing!',
          timestamp: '1 hour ago',
          unread: 2
        }
      ]
    }
  }
}