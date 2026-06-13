// src/composables/useMatches.js
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

// Mock user data (replace with API in real app)
const mockUser = {
  id: 'current-user',
  name: 'Sarah',
  avatar: 'https://i.pravatar.cc/150?img=1'
}

// Mock matches (in real app: from WebSocket or API)
const mockMatches = ref([
  {
    id: 'match-1',
    userId: 'u2',
    name: 'James',
    age: 30,
    distance: '2.5 km',
    location: 'Lilongwe',
    isVerified: true,
    avatar: 'https://i.pravatar.cc/150?img=2',
    intentContext: 'Looking for hiking partner',
    matchedAt: new Date()
  }
])

// Current match modal state
const showMatchModal = ref(false)
const currentMatch = ref(null)

export function useMatches() {
  const router = useRouter()

  const matches = computed(() => mockMatches.value)
  const hasNewMatch = computed(() => showMatchModal.value)

  // Simulate match detection
  const checkForMatch = (intentId, targetUserId) => {
    // In real app: call API to record like, then check for mutual
    console.log('Checking for match:', intentId, targetUserId)
    
    // Simulate match (every 3rd interaction)
    const shouldMatch = Math.random() > 0.7
    
    if (shouldMatch) {
      // Create match data
      const match = {
        id: `match-${Date.now()}`,
        userId: targetUserId,
        name: 'Grace',
        age: 28,
        distance: '0.8 km',
        location: 'Mzuzu',
        isVerified: true,
        avatar: 'https://i.pravatar.cc/150?img=3',
        intentContext: 'Afrobeats night this weekend',
        matchedAt: new Date()
      }
      
      // Add to matches
      mockMatches.value.push(match)
      
      // Show celebration modal
      currentMatch.value = match
      showMatchModal.value = true
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        showMatchModal.value = false
      }, 3000)
    }
  }

  const openChat = (matchId) => {
    console.log('Open chat with match:', matchId)
    showMatchModal.value = false
    // In real app: navigate to chat
    router.push(`/chat/${matchId}`)
  }

  const dismissModal = () => {
    showMatchModal.value = false
  }

  return {
    matches,
    hasNewMatch,
    checkForMatch,
    openChat,
    dismissModal,
    showMatchModal,
    currentMatch
  }
}