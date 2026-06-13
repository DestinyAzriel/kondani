// src/composables/useProfile.js
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

export function useProfile() {
  const authStore = useAuthStore()

  const profile = computed(() => authStore.user || {
    name: '',
    age: null,
    location: '',
    bio: '',
    photos: [],
    interests: [],
    isVerified: false,
    isVisible: true,
    isOnline: true,
    activity: [],
    subscriptionStatus: 'free'
  })

  const isEditing = ref(false)
  const newInterest = ref('')

  // Load profile from backend and populate auth store
  const loadProfile = async () => {
    try {
      const res = await api.get('/auth/profile')
      // Backend returns user object
      if (res && res.data) {
        authStore.user = res.data
      }
      return res.data
    } catch (err) {
      console.error('Failed to load profile:', err)
      throw err
    }
  }

  // Update profile via API (PUT) and sync store
  const saveProfile = async (profileData) => {
    try {
      // If photos or files are present, caller should handle multipart
      const res = await api.put('/auth/profile', profileData)
      if (res && res.data) {
        authStore.user = { ...authStore.user, ...res.data }
      }
      return res.data
    } catch (err) {
      console.error('Failed to save profile:', err)
      throw err
    }
  }

  const cancelEdit = () => {
    isEditing.value = false
    newInterest.value = ''
  }

  const addInterest = async () => {
    const val = newInterest.value?.trim()
    if (!val) return
    if (!profile.value.interests.includes(val)) {
      const updated = [...profile.value.interests, val]
      // Optimistically update UI
      authStore.user = { ...authStore.user, interests: updated }
      newInterest.value = ''
      // Persist change
      try { await saveProfile({ interests: updated }) } catch (e) { /* swallow — UI already updated */ }
    }
  }

  const removeInterest = async (index) => {
    const updated = [...profile.value.interests]
    updated.splice(index, 1)
    authStore.user = { ...authStore.user, interests: updated }
    try { await saveProfile({ interests: updated }) } catch (e) { }
  }

  const toggleVisibility = async () => {
    const updated = { ...authStore.user, isVisible: !authStore.user.isVisible }
    authStore.user = updated
    try { await saveProfile({ isVisible: updated.isVisible }) } catch (e) { }
  }

  const postIntent = () => {
    console.log('Post intent clicked')
  }

  const getVerified = () => {
    console.log('Get verified clicked')
  }

  onMounted(() => {
    // Try to load profile when composable mounts if store is empty
    if (!authStore.user) {
      loadProfile().catch(() => {})
    }
  })

  return {
    profile,
    isEditing: computed(() => isEditing.value),
    newInterest: computed(() => newInterest.value),
    setNewInterest: (value) => { newInterest.value = value },
    setIsEditing: (value) => { isEditing.value = value },
    loadProfile,
    saveProfile,
    cancelEdit,
    addInterest,
    removeInterest,
    toggleVisibility,
    postIntent,
    getVerified
  }
}