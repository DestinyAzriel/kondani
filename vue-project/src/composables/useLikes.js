// src/composables/useLikes.js — real "who likes you" data
import { ref, computed, onMounted } from 'vue'
import { intentService } from '@/services/intentService'

export function useLikes() {
  const newLikes = ref([])
  const mutualLikes = ref([])
  const activeTab = ref('new')
  const isLoading = ref(true)

  const load = async () => {
    isLoading.value = true
    try {
      const d = await intentService.getLikes()
      newLikes.value = (d?.newLikes || []).map(x => ({ ...x, isMutual: false }))
      mutualLikes.value = (d?.mutualLikes || []).map(x => ({ ...x, isMutual: true }))
    } catch (e) {
      console.error('Failed to load likes', e)
      newLikes.value = []
      mutualLikes.value = []
    } finally {
      isLoading.value = false
    }
  }

  const likes = computed(() => (activeTab.value === 'mutual' ? mutualLikes.value : newLikes.value))
  const unreadCount = computed(() => newLikes.value.length)
  const setActiveTab = (tab) => { activeTab.value = tab }
  const sayHi = () => {}

  onMounted(load)

  return { likes, activeTab, unreadCount, isLoading, setActiveTab, sayHi, reload: load }
}
