<template>
  <div class="encounters k-page relative overflow-hidden">
    <div class="k-stars"></div>
    <div class="absolute top-[-18%] left-[-15%] w-[55%] h-[50%] rounded-full blur-[130px] pointer-events-none"
         style="background:radial-gradient(circle,rgba(244,183,64,.14),transparent 70%)"></div>
    <div class="absolute bottom-[-18%] right-[-15%] w-[55%] h-[50%] rounded-full blur-[130px] pointer-events-none"
         style="background:radial-gradient(circle,rgba(45,212,191,.10),transparent 70%)"></div>

    <!-- Header -->
    <div class="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 max-w-[1040px] mx-auto w-full">
      <div class="flex items-center gap-2.5">
        <KondaniMark :size="32" />
        <h1 class="k-serif text-2xl">Kondani</h1>
      </div>
      <button @click="showFilterModal = true" class="k-iconbtn relative" title="Filters">
        <SlidersHorizontal :size="19" />
        <span v-if="activeFilterCount > 0"
              class="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 text-[11px] font-bold rounded-full flex items-center justify-center"
              style="background:var(--k-gold);color:var(--k-night)">{{ activeFilterCount }}</span>
      </button>
    </div>

    <!-- Main -->
    <div class="relative z-10 w-full max-w-[1040px] mx-auto px-4 pb-28">
      <!-- Empty: centered across the whole content area -->
      <div v-if="!isLoading && profiles.length === 0" class="flex justify-center pt-2">
        <EmptyState
          type="no-cards"
          title="No one new nearby"
          message="Check back later, or widen your distance and filters to see more people."
          action-text="Refresh"
          secondary-text="Adjust filters"
          @action="loadProfiles"
          @secondary-action="showFilterModal = true"
        />
      </div>

      <div v-else class="grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] gap-10 lg:items-center justify-center">

        <!-- Card column -->
        <div class="flex flex-col items-center w-full max-w-[440px] mx-auto lg:mx-0">
          <div class="swipe-column relative w-full h-[64vh] sm:h-[68vh] lg:h-[600px]">
            <div v-if="isLoading" class="w-full h-full">
              <SkeletonLoader type="swipe-card" />
            </div>

            <div v-else class="w-full h-full relative overflow-visible">
              <SwipeCard
                v-for="(profile, index) in profiles"
                :key="profile.id"
                :profile="profile"
                :ref="el => (cardRefs[index] = el)"
                :style="cardStyle(index)"
                @swipe="(dir) => handleSwipe(dir, index)"
              />
            </div>
          </div>

          <!-- Heavy action buttons -->
          <div v-if="!isLoading && profiles.length > 0" class="k-act mt-7 sm:mt-9">
            <button class="b" @click="handleRewind" title="Undo"><RotateCcw :size="20" /></button>
            <button class="b pass" @click="triggerSwipe('left')" title="Pass"><X :size="28" /></button>
            <button class="b sup" @click="triggerSwipe('up')" title="Super Like"><Star :size="22" class="fill-current" /></button>
            <button class="b like" @click="triggerSwipe('right')" title="Like"><Heart :size="30" class="fill-current" /></button>
            <button class="b" @click="handleBoost" title="Boost"><Zap :size="20" /></button>
          </div>

          <p v-if="likesLeft !== null" class="text-center text-xs text-white/45 mt-4">
            {{ likesLeft }} {{ likesLeft === 1 ? 'like' : 'likes' }} left today ·
            <span class="cursor-pointer" style="color:var(--k-gold-l)" @click="router.push('/premium')">Go unlimited</span>
          </p>
        </div>

        <!-- Desktop detail panel -->
        <aside v-if="!isLoading && topProfile" class="hidden lg:block">
          <div class="k-card p-7">
            <div class="flex items-end gap-2.5 mb-1">
              <h2 class="k-serif text-3xl leading-none">{{ topProfile.name }}</h2>
              <span v-if="topProfile.age" class="text-2xl text-white/70 leading-none">{{ topProfile.age }}</span>
              <span v-if="topProfile.isVerified" class="k-ver mb-1"><BadgeCheck :size="13" /> Verified</span>
            </div>
            <div v-if="topProfile.distance" class="flex items-center gap-1.5 text-sm text-white/60 mt-2">
              <MapPin :size="15" style="color:var(--k-lagoon)" />
              <span>{{ topProfile.distance }}</span>
              <span v-if="topProfile.district" class="text-white/35">· {{ topProfile.district }}</span>
            </div>

            <div v-if="topProfile.bio" class="mt-5">
              <p class="k-label mb-2">About</p>
              <p class="text-[15px] text-white/80 leading-relaxed">{{ topProfile.bio }}</p>
            </div>

            <div v-if="topProfile.interests && topProfile.interests.length" class="mt-5">
              <p class="k-label mb-2.5">Interests</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="(it,i) in topProfile.interests" :key="i" class="k-chip">{{ it }}</span>
              </div>
            </div>

            <div v-if="topProfile.prompts && topProfile.prompts.length" class="mt-5 space-y-3">
              <div v-for="(p,i) in topProfile.prompts" :key="i" class="k-glass p-4">
                <p class="text-xs text-white/45 mb-1">{{ p.question || p.prompt }}</p>
                <p class="text-[15px] text-white/85">{{ p.answer }}</p>
              </div>
            </div>

            <div class="flex gap-3 mt-7">
              <button class="k-btn k-btn-ghost flex-1" style="padding:13px" @click="triggerSwipe('left')">
                <X :size="18" /> Pass
              </button>
              <button class="k-btn k-btn-gold flex-1" style="padding:13px" @click="triggerSwipe('right')">
                <Heart :size="18" class="fill-current" /> Like
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <MatchCelebration
      :show="showMatchCelebration"
      :match-name="currentMatch?.name"
      :match-photo="currentMatch?.avatar || currentMatch?.photos?.[0] || ''"
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
import { SlidersHorizontal, X, Heart, Star, RotateCcw, Zap, MapPin, BadgeCheck } from 'lucide-vue-next'
import { intentService } from '@/services/intentService'
import KondaniMark from '@/components/ui/KondaniMark.vue'
import { analyticsService } from '@/services/analyticsService'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const { info, error: toastError } = useToast()
const authStore = useAuthStore()
const router = useRouter()

const showMatchCelebration = ref(false)
const showFilterModal = ref(false)
const currentMatch = ref({})
const profiles = ref([])
const isLoading = ref(true)
const lastSwiped = ref(null)
const cardRefs = ref([])
const likesLeft = ref(null) // free-tier likes remaining today (null = premium / not yet known)
const superLikesLeft = ref(null)

const topProfile = computed(() => profiles.value[0] || null)
const currentUserPhoto = computed(() => authStore.user?.photos?.[0] || '')

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

  const celebrate = (result) => {
    if (result?.isMatch) {
      analyticsService.trackMatch?.(result.matchData?.id, profile.id, profile.name)
      currentMatch.value = result.matchData || profile
      showMatchCelebration.value = true
    }
  }

  try {
    if (direction === 'up') {
      const result = await intentService.superLikeIntent(profile.id)
      if (result?.superLikesRemaining != null) superLikesLeft.value = result.superLikesRemaining
      celebrate(result)
    } else if (direction === 'right') {
      const result = await intentService.likeIntent(profile.id)
      if (result?.likesRemaining != null) likesLeft.value = result.likesRemaining
      celebrate(result)
    } else {
      await intentService.passIntent(profile.id)
    }
  } catch (err) {
    const data = err.response?.data
    if (data?.limitReached) {
      if (data.superLikesRemaining != null) superLikesLeft.value = 0
      else likesLeft.value = 0
      info(data.message || "You've hit today's limit — go Gold for more.")
    } else {
      console.error('Swipe action failed:', err)
    }
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

const handleRewind = async () => {
  if (!authStore.user?.isPremium) {
    info('Rewind is a Kondani Gold feature — undo your last swipe.')
    return
  }
  const last = lastSwiped.value?.profile
  if (!last) { info('Nothing to rewind yet.'); return }
  try {
    await intentService.rewindIntent(last.id)
    if (!profiles.value.some(p => p.id === last.id)) profiles.value.unshift(last)
    lastSwiped.value = null
  } catch (e) {
    if (e.response?.data?.premiumRequired) info('Rewind is a Kondani Gold feature.')
    else console.error('Rewind failed', e)
  }
}

const handleBoost = async () => {
  if (!authStore.user?.isPremium) {
    info('Boost is a Kondani Gold feature — be shown first for 30 minutes.')
    return
  }
  try {
    const res = await intentService.boost()
    info(res?.alreadyActive ? "You're already boosted right now." : "Boost on — you'll be shown first for 30 minutes.")
  } catch (e) {
    const data = e.response?.data
    if (data?.limitReached) info(data.message)
    else if (data?.premiumRequired) info('Boost is a Kondani Gold feature.')
    else console.error('Boost failed', e)
  }
}

const cardStyle = (index) => {
  const z = profiles.value.length - index
  if (index >= 3) return { zIndex: z }
  return { zIndex: z, transform: `scale(${1 - index * 0.02}) translateY(${index * 10}px)` }
}

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
.encounters { overflow-x: hidden; }
.swipe-column { perspective: 1000px; }
</style>
