// src/composables/useChats.js
import { ref, computed } from 'vue'

// Mock chat data (replace with API in real app)
const mockChats = [
  {
    id: 1,
    userId: 'u1',
    name: 'Sarah',
    age: 25,
    distance: '1.2 km',
    location: 'Blantyre',
    isOnline: true,
    isVerified: true,
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Hey! I saw your coffee intent — I know a great spot in Blantyre!',
    timeSent: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    unreadCount: 2,
    intentContext: 'Free for coffee?'
  },
  {
    id: 2,
    userId: 'u2',
    name: 'James',
    age: 30,
    distance: '2.5 km',
    location: 'Lilongwe',
    isOnline: false,
    isVerified: true,
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'Looking forward to the hiking trip this weekend!',
    timeSent: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unreadCount: 0,
    intentContext: 'Looking for hiking partner'
  },
  {
    id: 3,
    userId: 'u3',
    name: 'Grace',
    age: 28,
    distance: '0.8 km',
    location: 'Mzuzu',
    isOnline: true,
    isVerified: true,
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Can’t wait for Afrobeats night! What time are you planning to go?',
    timeSent: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unreadCount: 1,
    intentContext: 'Afrobeats night this weekend'
  }
]

export function useChats() {
  const chats = ref([...mockChats])

  const unreadCount = computed(() => {
    return chats.value.reduce((total, chat) => total + chat.unreadCount, 0)
  })

  const sortedChats = computed(() => {
    return [...chats.value].sort((a, b) => b.timeSent - a.timeSent)
  })

  const openChat = (chatId) => {
    console.log('Open chat:', chatId)
    // In real app: navigate to chat detail
  }

  return {
    chats: sortedChats,
    unreadCount,
    openChat
  }
}