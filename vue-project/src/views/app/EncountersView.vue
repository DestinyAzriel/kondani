<template>
  <div class="encounters-view min-h-screen bg-night-950 text-white relative overflow-hidden">
    <!-- Lake of Stars ambiance -->
    <div class="stars fixed inset-0 pointer-events-none"></div>
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-20%] left-[-20%] w-[60%] h-[55%] rounded-full blur-[120px]"
           style="background: radial-gradient(circle, rgba(45,212,191,.16), transparent 70%)"></div>
      <div class="absolute bottom-[-20%] right-[-20%] w-[60%] h-[55%] rounded-full blur-[120px]"
           style="background: radial-gradient(circle, rgba(244,183,64,.12), transparent 70%)"></div>
    </div>

    <!-- Header -->
    <div class="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 max-w-[800px] mx-auto w-full">
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20 bg-gradient-to-br from-gold-300 to-gold-500">
          <span class="text-lg text-night-950">✦</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-bold font-display tracking-tight">Kondani</h1>
      </div>

      <button
        @click="showFilterModal = true"
        class="relative p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl border border-white/10 transition-all"
        title="Filters"
      >
        <SlidersIcon size="20" />
        <span v-if="activeFilterCount > 0" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-lagoon-400 text-night-950 text-xs font-bold rounded-full flex items-center justify-center">{{ activeFilterCount }}</span>
      </button>
    </div>

    <!-- Main -->
    <div class="relative z-10 w-full max-w-[800px] mx-auto flex flex-col items-center px-4 pb-28">
      <div class="swipe-column flex flex-col items-center w-full max-w-[420px]">
        <!-- Card stack -->
        <div class="relative w-full h-[62vh] sm:h-[68vh] lg:h-[72vh]">
          <div v-if="isLoading" class="w-full h-full">
            <SkeletonLoader type="swipe-card" />
          </div>

          <div v-else-if="profiles.length > 0" class="w-full h-full relative overflow-visible">
            <SwipeCard
              v-for="(profile, index) in profiles"
              :key="profile.id"
              :profile="profile"
              :ref="el => (cardRefs[index] = el)"
              :style="cardStyle(index)"
              @swipe="(dir) => handleSwipe(dir, index)"
            />
          </div>

          <EmptyState
            v-else
            type="no-cards"
            title="No one new nearby"
            message="Check back later, or widen your distance and filters to see more people."
            action-text="Refresh"
            secondary-text="Adjust filters"
            @action="loadProfiles"
            @secondary-action="showFilterModal = true"
          />
        </div>

        <!-- Action buttons -->
        <div v-if="!isLoading && profiles.length > 0" class="w-full mt-7 sm:mt-10">
          <div class="flex justify-between items-center px-2">
            <button @click="handleRewind" class="action-btn text-gold-400 hover:bg-gold-400" title="Undo">
              <RotateCcwIcon size="20" />
            </button>
            <button @click="triggerSwipe('left')" class="action-btn-lg text-[#ff7a6b] hover:bg-[#ff7a6b]" title="Pass">
              <XIcon size="30" />
            </button>
            <button @click="triggerSwipe('up')" class="action-btn -mt-4 text-lagoon-400 hover:bg-lagoon-400" title="Super Like">
              <StarIcon size="24" class="fill-current" />
            </button>
            <button @click="triggerSwipe('right')" class="action-btn-lg text-gold-300 hover:bg-gold-400 hover:text-night-950" title="Like">
              <HeartIcon size="28" class="fill-current" />
            </button>
            <button @click="handleBoost" class="action-btn text-gold-300 hover:bg-gold-400 hover:text-night-950" title="Boost">
              <ZapIcon size="20" class="fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <MatchCelebration
      :show="showMatchCelebration"
      :match-name="currentMatch?.name"
      :match-photo="currentMatch?.avatar || currentMatch?.photos?.[0] || 'https://via.placeholder.com/400'"
      :user-photo="currentUserPhoto"
      :match-id="currentMatch?.id?.toString()"
      @close="showMatchCelebration = false"
    />

    <FilterModal
      :show="showFilterModal"
      :initialFilters="activeFilters"
      @close="showFilterModal = false"
      @apply="applyFilters"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SwipeCard from '@/components/ui/SwipeCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import MatchCelebration from '@/components/feature/MatchCelebration.vue'
import FilterModal from '@/components/feature/modal/FilterModal.vue'
import { Sliders as SlidersIcon, X as XIcon, Heart as HeartIcon, Star as StarIcon, RotateCcw as RotateCcwIcon, Zap as ZapIcon } from 'lucide-vue-next'
import { intentService } from '@/services/intentService'
import { analyticsService } from '@/services/analyticsService'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const { info, error: toastError } = useToast()
const authStore = useAuthStore()

const showMatchCelebration = ref(false)
const showFilterModal = ref(false)
const currentMatch = ref({})
const profiles = ref([])
const isLoading = ref(true)
const lastSwiped = ref(null) // { profile } for rewind
const cardRefs = ref([])

const currentUserPhoto = computed(() => authStore.user?.photos?.[0] || 'https://via.placeholder.com/150')

// Filters mirror the user's saved preferences.
const activeFilters = ref({
  ageMin: authStore.user?.preferences?.ageMin ?? 18,
  ageMax: authStore.user?.preferences?.ageMax ?? 60,
  distance: authStore.user?.preferences?.distance ?? 100,
  gender: authStore.user?.preferences?.gender ?? 'Everyone',
  interests: [],
  verifiedOnly: authStore.user?.preferences?.verifiedOnly ?? false
})

const activeFilterCount = computed(() => {
  let count = 0
  const f = activeFilters.value
  if (f.ageMin !== 18 || f.ageMax !== 60) count++
  if (f.distance !== 100) count++
  if (f.gender !== 'Everyone') count++
  if (f.interests.length > 0) count++
  if (f.verifiedOnly) count++
  return count
})

// Real data only — no mock fallback. Backend already applies distance + prefs.
const loadProfiles = async () => {
  isLoading.value = true
  try {
    const data = await intentService.getIntents()
    let list = (data?.intents || []).map(p => ({
      ...p,
      photos: p.photos && p.photos.length ? p.photos : [],
      interests: p.interests || [],
      isVerified: p.isVerified || false
    }))
    // Client-side interest filter (backend handles age/gender/distance/verified)
    if (activeFilters.value.interests.length > 0) {
      list = list.filter(p => activeFilters.value.interests.some(i => p.interests.includes(i)))
    }
    profiles.value = list
  } catch (err) {
    console.error('Failed to load profiles:', err)
    profiles.value = []
    toastError('Could not load people nearby. Pull to refresh.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProfiles)

const handleSwipe = async (direction, index) => {
  const profile = profiles.value[index]
  if (!profile) return
  analyticsService.trackSwipe?.(direction, profile.id, profile.name)
  lastSwiped.value = { profile }

  setTimeout(() => { profiles.value.splice(index, 1) }, 200)

  try {
    if (direction === 'right' || direction === 'up') {
      const result = await intentService.likeIntent(profile.id)
      if (result?.isMatch) {
        analyticsService.trackMatch?.(result.matchData?.id, profile.id, profile.name)
        currentMatch.value = result.matchData || profile
        showMatchCelebration.value = true
      }
    } else {
      await intentService.passIntent(profile.id)
    }
  } catch (err) {
    console.error('Swipe action failed:', err)
  }
}

const triggerSwipe = (direction) => {
  if (profiles.value.length === 0) return
  const top = cardRefs.value[0]
  if (top && typeof top.triggerSwipe === 'function') {
    top.triggerSwipe(direction)
    setTimeout(() => handleSwipe(direction, 0), 350)
    return
  }
  handleSwipe(direction, 0)
}

const handleRewind = () => {
  if (!authStore.user?.isPremium) {
    info('Rewind is a Kondani Gold feature ✦')
    return
  }
  if (lastSwiped.value?.profile) {
    profiles.value.unshift(lastSwiped.value.profile)
    lastSwiped.value = null
  }
}

const handleBoost = () => {
  info(authStore.user?.isPremium ? 'Boosting your profile for 30 minutes ✦' : 'Boost is a Kondani Gold feature ✦')
}

// Stacking transforms for the top 3 cards
const cardStyle = (index) => {
  const z = profiles.value.length - index
  if (index >= 3) return { zIndex: z }
  return { zIndex: z, transform: `scale(${1 - index * 0.02}) translateY(${index * 10}px)` }
}

// Apply filters -> persist to backend preferences -> reload real feed
const applyFilters = async (filters) => {
  activeFilters.value = { ...filters }
  analyticsService.trackFilterApplied?.(filters)
  try {
    await authStore.updateUserProfile({
      preferences: {
        ageMin: filters.ageMin,
        ageMax: filters.ageMax,
        distance: filters.distance,
        gender: filters.gender,
        verifiedOnly: filters.verifiedOnly
      }
    })
  } catch (err) {
    console.error('Failed to save preferences:', err)
  }
  await loadProfiles()
}
</script>

<style scoped>
.swipe-column { perspective: 1000px; }
.stars {
  background:
    radial-gradient(1.5px 1.5px at 15% 12%, rgba(255,215,130,.8), transparent),
    radial-gradient(1.5px 1.5px at 65% 8%, rgba(255,255,255,.6), transparent),
    radial-gradient(1px 1px at 85% 18%, rgba(255,215,130,.7), transparent),
    radial-gradient(1px 1px at 40% 6%, rgba(255,255,255,.5), transparent),
    radial-gradient(1px 1px at 12% 24%, rgba(255,215,130,.5), transparent);
}
.action-btn {
  width: 3.25rem; height: 3.25rem; border-radius: 9999px;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 16px rgba(0,0,0,.3); transition: all .25s ease;
}
.action-btn-lg {
  width: 4rem; height: 4rem; border-radius: 9999px;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 22px rgba(0,0,0,.35); transition: all .25s ease;
}
.action-btn:hover, .action-btn-lg:hover { color: #08161d; transform: scale(1.05); }
.action-btn:active, .action-btn-lg:active { transform: scale(.95); }
</style>
