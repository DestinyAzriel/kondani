<template>
  <div class="feed-container min-h-screen relative overflow-hidden bg-night-950 text-white pb-24">
    <!-- Background Elements -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(45,212,191,.14), transparent 70%)"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[45%] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(244,183,64,.12), transparent 70%)"></div>
    </div>

    <!-- Header -->
    <div class="sticky top-0 z-40 bg-night-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-4 relative">
      <h1 class="text-2xl font-bold font-display text-white mb-1">Plans Nearby</h1>
      <p class="text-white/50 text-sm">Real people, verified and ready to meet</p>
    </div>

    <!-- Content -->
    <div class="px-4 pt-6 relative z-10">

      <!-- Grid -->
      <div 
        v-if="intents.length > 0"
        ref="gridRef"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 pb-24"
      >
        <IntentCard
          v-for="intent in intents"
          :key="intent.id"
          :intent="intent"
          @join="handleJoin(intent)"
          @pass="handlePass(intent)"
        />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="!loading"
        title="No one nearby yet"
        message="People usually appear in the evenings. Check back later or post your first intent!"
        action-text="Share what you're up to"
        @action="postIntent"
      >
        <template #icon>
          <span class="text-5xl">📍</span>
        </template>
      </EmptyState>

      <!-- Loading Skeleton -->
      <div v-if="loading && intents.length === 0" class="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10 pb-24">
        <SkeletonLoader type="card" v-for="i in 4" :key="i" />
      </div>

      <!-- Load More Skeleton -->
      <div v-if="loading && intents.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
        <SkeletonLoader type="card" v-for="i in 2" :key="i" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useIntents } from '@/composables/useIntents'
import IntentCard from '@/components/feature/IntentCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useToast } from '@/composables/useToast'

const { intents, loading, hasMore, loadMore, refresh, likeIntent, passIntent } = useIntents()
const gridRef = ref(null)
const toast = useToast()

const handleJoin = async (intent) => {
  try {
    console.log('Join intent:', intent.name)
    const response = await likeIntent(intent.id)
    
    if (response.isMatch) {
      toast.success(`It's a match with ${intent.name}!`)
    } else {
      toast.info(`You liked ${intent.name}`)
    }
  } catch (error) {
    console.error('Failed to like intent:', error)
    toast.error('Failed to like user. Please try again.')
  }
}

const handlePass = async (intent) => {
  try {
    console.log('Pass intent:', intent.name)
    await passIntent(intent.id)
    toast.info(`Passed on ${intent.name}`)
  } catch (error) {
    console.error('Failed to pass intent:', error)
    toast.error('Failed to pass user. Please try again.')
  }
}

const postIntent = () => {
  console.log('Post intent clicked')
  // In real app: open intent composer modal
}

// Infinite scroll
const handleScroll = () => {
  if (!gridRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = gridRef.value
  if (scrollTop + clientHeight >= scrollHeight - 100 && !loading.value && hasMore.value) {
    loadMore()
  }
}

onMounted(() => {
  // Refresh on mount (for SPA navigation)
  refresh()
  
  // Add scroll listener to parent (main content area)
  const main = document.querySelector('main')
  if (main) {
    main.addEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.feed-container {
  /* Ensure scrollable area */
  min-height: calc(100vh - 80px);
}
</style>