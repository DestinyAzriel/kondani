// src/composables/useIntents.js
import { ref, computed } from 'vue'
import { intentService } from '@/services/intentService'

export function useIntents() {
  const intents = ref([])
  const loading = ref(false)
  const page = ref(1)
  const hasMore = ref(true)

  const fetchIntents = async (pageNum = 1) => {
    if (loading.value || (pageNum > 1 && !hasMore.value)) return

    loading.value = true
    try {
      const response = await intentService.getIntents(pageNum, 10)
      
      if (pageNum === 1) {
        intents.value = response.intents
      } else {
        intents.value = [...intents.value, ...response.intents]
      }

      hasMore.value = response.hasMore
    } catch (err) {
      console.error('Failed to fetch intents:', err)
      if (pageNum === 1) {
        intents.value = []
      }
    } finally {
      loading.value = false
    }
  }

  const likeIntent = async (intentId) => {
    try {
      const response = await intentService.likeIntent(intentId)
      
      // Remove liked intent from list
      intents.value = intents.value.filter(i => i.id !== intentId)
      
      return response
    } catch (err) {
      console.error('Failed to like intent:', err)
      throw err
    }
  }

  const passIntent = async (intentId) => {
    try {
      await intentService.passIntent(intentId)
      
      // Remove passed intent from list
      intents.value = intents.value.filter(i => i.id !== intentId)
    } catch (err) {
      console.error('Failed to pass intent:', err)
      throw err
    }
  }

  const refresh = () => {
    page.value = 1
    hasMore.value = true
    fetchIntents(1)
  }

  const loadMore = () => {
    if (hasMore.value) {
      page.value++
      fetchIntents(page.value)
    }
  }

  // Mock data as fallback
  const getMockIntents = () => [
    {
      id: 1,
      name: 'Chifundo',
      age: 24,
      distance: '1.2 km',
      location: 'Lilongwe',
      intentTitle: 'Coffee at Mamma Mia this afternoon?',
      isOnline: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: 2,
      name: 'Thoko',
      age: 27,
      distance: '2.5 km',
      location: 'Blantyre',
      intentTitle: 'Looking for hiking partner at Mulanje',
      isOnline: false,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: 3,
      name: 'Yamikani',
      age: 22,
      distance: '0.8 km',
      location: 'Zomba',
      intentTitle: 'Afrobeats night at Club 101 tonight!',
      isOnline: true,
      isVerified: false,
      avatar: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: 4,
      name: 'Kondwani',
      age: 26,
      distance: '3.2 km',
      location: 'Mzuzu',
      intentTitle: 'Anyone up for football at Kamuzu Stadium?',
      isOnline: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: 5,
      name: 'Grace',
      age: 25,
      distance: '1.5 km',
      location: 'Lilongwe',
      intentTitle: 'Trying the new restaurant on City Centre',
      isOnline: false,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: 6,
      name: 'Mphatso',
      age: 23,
      distance: '4.1 km',
      location: 'Blantyre',
      intentTitle: 'Art exhibition at Kumbukumbu Centre',
      isOnline: true,
      isVerified: false,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60'
    }
  ]

  // Start with data
  fetchIntents()

  return {
    intents: computed(() => intents.value),
    loading: computed(() => loading.value),
    hasMore: computed(() => hasMore.value),
    refresh,
    loadMore,
    likeIntent,
    passIntent
  }
}