// src/composables/useLikes.js — real "who likes you" data
import { ref, computed, onMounted } from 'vue'
import { intentService } from '@/services/intentService'

export function useLikes() {
  const newLikes = ref([])
  const mutualLikes = ref([])
  const activeTab = ref('new')
  const isLoading = ref(true)
  const likesCount = ref(0)        // how many people like you (visible to all)
  const canSeeLikers = ref(false)  // only Gold gets identities

  const load = async () => {
    isLoading.value = true
    try {
      const d = await intentService.getLikes()
      newLikes.value = (d?.newLikes || []).map(x => ({ ...x, isMutual: false }))
      mutualLikes.value = (d?.mutualLikes || []).map(x => ({ ...x, isMutual: true }))
      canSeeLikers.value = !!d?.isPremium
      likesCount.value = d?.likesCount ?? newLikes.value.length
    } catch (e) {
      console.error('Failed to load likes', e)
      newLikes.value = []
      mutualLikes.value = []
      likesCount.value = 0
    } finally {
      isLoading.value = false
    }
  }

  const likes = computed(() => (activeTab.value === 'mutual' ? mutualLikes.value : newLikes.value))
  const unreadCount = computed(() => likesCount.value)
  const setActiveTab = (tab) => { activeTab.value = tab }
  const sayHi = () => {}

  onMounted(load)

  return { likes, activeTab, unreadCount, isLoading, setActiveTab, sayHi, reload: load, likesCount, canSeeLikers }
}
