<template>
  <div class="daily-picks-view k-page relative overflow-hidden pb-28">
    <div class="k-stars"></div>
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[45%] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(244,183,64,.13), transparent 70%)"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[45%] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(45,212,191,.10), transparent 70%)"></div>
    </div>

    <!-- Header -->
    <div class="sticky top-0 z-40 bg-night-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
      <div class="max-w-[1040px] mx-auto">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2.5">
            <Star :size="22" class="fill-current" style="color:var(--k-gold)" />
            <div>
              <h1 class="k-title">Daily Picks</h1>
              <p class="text-white/50 text-sm mt-0.5">Curated for you · refreshes at 6 PM</p>
            </div>
          </div>
          <div class="text-right">
            <div class="k-serif text-2xl" style="color:var(--k-gold-l)">{{ picks.length }}</div>
            <div class="text-white/40 text-xs">picks</div>
          </div>
        </div>
        <div class="flex items-center gap-2 text-xs text-white/40">
          <ClockIcon :size="14" /><span>New picks in {{ timeUntilRefresh }}</span>
        </div>
      </div>
    </div>

    <div class="relative z-10 px-4 pt-5 max-w-[1040px] mx-auto">
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <SkeletonLoader v-for="i in 3" :key="i" type="card" />
      </div>

      <div v-else-if="picks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="pick in picks" :key="pick.id" class="pick-card k-card overflow-hidden">
          <div class="relative h-52">
            <img v-if="photoOf(pick)" :src="photoOf(pick)" class="w-full h-full object-cover" alt="" />
            <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2 text-white/25" style="background:linear-gradient(160deg,#0e1f29,#081016)"><ImageIcon :size="40" :stroke-width="1.5" /><span class="text-xs">No photo yet</span></div>
            <div class="absolute inset-0" style="background:linear-gradient(to top,var(--k-night),transparent 60%)"></div>

            <div class="absolute top-2 right-2 w-12 h-12 rounded-full flex items-center justify-center"
                 :style="ringStyle(pick.matchScore)">
              <div class="w-9 h-9 rounded-full flex flex-col items-center justify-center" style="background:var(--k-night)">
                <b class="text-[11px] k-serif leading-none" style="color:var(--k-gold-l)">{{ pick.matchScore || 0 }}%</b>
              </div>
            </div>
            <span v-if="pick.isVerified" class="k-ver absolute top-2 left-2"><BadgeCheck :size="12" /> Verified</span>

            <div class="absolute bottom-0 left-0 right-0 p-3">
              <div class="flex items-baseline gap-2">
                <h2 class="k-serif text-xl">{{ pick.name }}</h2>
                <span v-if="pick.age" class="text-white/70">{{ pick.age }}</span>
              </div>
              <div v-if="pick.distance" class="flex items-center gap-1 text-xs mt-0.5" style="color:var(--k-lagoon)">
                <MapPinIcon :size="12" /><span>{{ pick.distance }}</span>
              </div>
            </div>
          </div>

          <div class="p-3">
            <div v-if="pick.interests && pick.interests.length" class="mb-3">
              <div class="flex flex-wrap gap-1.5">
                <span v-for="interest in pick.interests.slice(0,3)" :key="interest" class="k-chip" style="font-size:11px;padding:4px 9px">{{ interest }}</span>
              </div>
            </div>
            <div class="flex gap-2.5">
              <button @click="handlePass(pick)" class="k-btn k-btn-ghost flex-1" style="padding:9px;font-size:13px">Pass</button>
              <button @click="handleLike(pick)" class="k-btn k-btn-gold flex-1" style="padding:9px;font-size:13px"><Heart :size="14" class="fill-current" /> Like</button>
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-else type="no-picks" title="No picks right now"
        message="Check back later for fresh matches curated for you."
        action-text="Explore discover" @action="router.push('/encounters')" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { intentService } from '@/services/intentService'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { BadgeCheck, MapPin as MapPinIcon, Clock as ClockIcon, Star, Heart, Image as ImageIcon } from 'lucide-vue-next'

const router = useRouter()
const { success, info } = useToast()

const picks = ref([])
const isLoading = ref(true)

import { mediaUrl } from '@/utils/media'
const photoOf = (p) => mediaUrl(p.photos?.[0])
const ringStyle = (score = 0) => ({
  background: `conic-gradient(#f4b740 0% ${score}%, rgba(255,255,255,.12) ${score}% 100%)`
})

const timeUntilRefresh = computed(() => {
  const now = new Date(); const t = new Date(); t.setHours(18, 0, 0, 0)
  if (now > t) t.setDate(t.getDate() + 1)
  const diff = t - now
  return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`
})

onMounted(async () => {
  isLoading.value = true
  try {
    const data = await intentService.getIntents(1, 10)
    // Highest match score first = the curated picks
    picks.value = (data?.intents || []).slice().sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  } catch (e) {
    console.error('Failed to load picks', e)
    picks.value = []
  } finally {
    isLoading.value = false
  }
})

const handleLike = async (pick) => {
  picks.value = picks.value.filter(p => p.id !== pick.id)
  try {
    const res = await intentService.likeIntent(pick.id)
    if (res?.isMatch) info(`It's a match with ${pick.name}!`)
    else success(`You liked ${pick.name}`)
  } catch (e) { console.error(e) }
}
const handlePass = async (pick) => {
  picks.value = picks.value.filter(p => p.id !== pick.id)
  try { await intentService.passIntent(pick.id) } catch (e) { console.error(e) }
}
</script>

<style scoped>
.pick-card { animation: slideInUp .3s ease-out; }
@keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
