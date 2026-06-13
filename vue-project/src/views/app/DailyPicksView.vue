<template>
  <div class="daily-picks-view min-h-screen bg-night-950 text-white relative overflow-hidden pb-28">
    <div class="stars fixed inset-0 pointer-events-none"></div>
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[45%] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(45,212,191,.14), transparent 70%)"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[45%] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(244,183,64,.12), transparent 70%)"></div>
    </div>

    <!-- Header -->
    <div class="sticky top-0 z-40 bg-night-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-2xl font-bold font-display">Daily Picks ★</h1>
          <p class="text-white/50 text-sm">Curated for you · refreshes at 6 PM</p>
        </div>
        <div class="text-right">
          <div class="text-gold-400 font-bold text-lg">{{ picks.length }}</div>
          <div class="text-white/40 text-xs">picks</div>
        </div>
      </div>
      <div class="flex items-center gap-2 text-xs text-white/40">
        <ClockIcon size="14" /><span>New picks in {{ timeUntilRefresh }}</span>
      </div>
    </div>

    <div class="relative z-10 px-4 pt-5">
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <SkeletonLoader v-for="i in 3" :key="i" type="card" />
      </div>

      <div v-else-if="picks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="pick in picks" :key="pick.id" class="pick-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
          <div class="relative h-52">
            <img v-if="photoOf(pick)" :src="photoOf(pick)" class="w-full h-full object-cover" alt="" />
            <div v-else class="w-full h-full flex items-center justify-center text-white/30 text-5xl bg-night-900">✦</div>
            <div class="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-transparent"></div>

            <div class="absolute top-2 right-2 w-12 h-12 rounded-full flex items-center justify-center"
                 :style="ringStyle(pick.matchScore)">
              <div class="w-9 h-9 rounded-full bg-night-950 flex flex-col items-center justify-center">
                <b class="text-gold-400 text-[11px] font-display leading-none">{{ pick.matchScore || 0 }}%</b>
              </div>
            </div>
            <span v-if="pick.isVerified" class="absolute top-2 left-2 inline-flex items-center gap-1 bg-gradient-to-r from-gold-300 to-gold-500 text-night-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <CheckIcon size="9" class="stroke-[4]" /> Verified
            </span>

            <div class="absolute bottom-0 left-0 right-0 p-3">
              <div class="flex items-baseline gap-2">
                <h2 class="text-xl font-bold font-display">{{ pick.name }}</h2>
                <span v-if="pick.age" class="text-white/70">{{ pick.age }}</span>
              </div>
              <div v-if="pick.distance" class="flex items-center gap-1 text-xs text-lagoon-300 mt-0.5">
                <MapPinIcon size="12" /><span>{{ pick.distance }}</span>
              </div>
            </div>
          </div>

          <div class="p-3">
            <div v-if="pick.interests && pick.interests.length" class="mb-3">
              <div class="flex flex-wrap gap-1.5">
                <span v-for="interest in pick.interests.slice(0,3)" :key="interest" class="px-2 py-0.5 bg-white/8 text-white/80 rounded-full text-xs border border-white/10">{{ interest }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="handlePass(pick)" class="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium border border-white/10 transition-all">Pass</button>
              <button @click="handleLike(pick)" class="flex-1 py-2 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-lg text-sm font-bold transition-all active:scale-95">Like ♥</button>
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
import { Check as CheckIcon, MapPin as MapPinIcon, Clock as ClockIcon } from 'lucide-vue-next'

const router = useRouter()
const { success, info } = useToast()

const picks = ref([])
const isLoading = ref(true)

const API_ORIGIN = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
const photoOf = (p) => {
  const ph = p.photos?.[0]
  if (!ph) return ''
  return ph.startsWith('http') ? ph : API_ORIGIN + ph
}
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
    if (res?.isMatch) info(`It's a match with ${pick.name}! ✦`)
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
.stars{background:radial-gradient(1.5px 1.5px at 18% 12%,rgba(255,215,130,.7),transparent),radial-gradient(1px 1px at 70% 8%,rgba(255,255,255,.5),transparent),radial-gradient(1px 1px at 88% 20%,rgba(255,215,130,.5),transparent);}
</style>
