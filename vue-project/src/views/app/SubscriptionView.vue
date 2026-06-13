<template>
  <div class="subscription-view min-h-screen bg-night-950 text-white relative overflow-hidden">
    <div class="stars fixed inset-0 pointer-events-none"></div>
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-20%] left-[-20%] w-[70%] h-[60%] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(244,183,64,.18), transparent 70%)"></div>
      <div class="absolute bottom-[-20%] right-[-20%] w-[70%] h-[60%] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(45,212,191,.12), transparent 70%)"></div>
    </div>

    <div class="relative z-10 flex items-center justify-between p-4 border-b border-white/5 backdrop-blur-md bg-night-900/40">
      <button @click="router.back()" class="p-2 text-white/70 hover:text-white"><XIcon size="24" /></button>
      <h1 class="text-lg font-bold font-display">Kondani Gold</h1>
      <div class="w-10"></div>
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-4 py-8 pb-28">
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500/20 to-gold-300/20 rounded-full border border-gold-400/30 mb-4">
          <CrownIcon size="18" class="text-gold-400" />
          <span class="text-gold-300 font-bold text-sm uppercase tracking-wider">Gold</span>
        </div>
        <h2 class="text-3xl md:text-4xl font-bold mb-3 font-display">Stand out. Match faster.</h2>
        <p class="text-white/60 text-lg">See who likes you and get unlimited likes</p>
      </div>

      <!-- Benefits -->
      <div class="grid sm:grid-cols-2 gap-3 mb-8">
        <div v-for="b in benefits" :key="b.t" class="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
          <span class="text-gold-300 text-xl">✦</span>
          <div><div class="font-semibold text-sm">{{ b.t }}</div><div class="text-white/55 text-xs mt-0.5">{{ b.d }}</div></div>
        </div>
      </div>

      <!-- Plans -->
      <h3 class="text-xl font-bold text-center mb-5 font-display">Choose your plan</h3>
      <div class="space-y-3 mb-6">
        <button v-for="p in plans" :key="p.id" @click="selectedPlan = p.id"
          class="w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between"
          :class="selectedPlan === p.id ? 'border-gold-400 bg-gold-500/10' : 'border-white/10 bg-white/5'">
          <div class="text-left">
            <div class="font-bold flex items-center gap-2">
              {{ p.label }}
              <span v-if="p.tag" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-gold-300 to-gold-500 text-night-950">{{ p.tag }}</span>
            </div>
            <div class="text-white/50 text-sm mt-0.5">{{ p.perMonth }}</div>
          </div>
          <div class="text-right">
            <div class="text-xl font-bold">MWK {{ p.price.toLocaleString() }}</div>
            <div v-if="p.save" class="text-lagoon-300 text-xs font-semibold">{{ p.save }}</div>
          </div>
        </button>
      </div>

      <button @click="handleSubscribe" class="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-2xl font-bold text-lg shadow-2xl shadow-gold-500/30 hover:scale-[1.02] active:scale-[0.98] transition-transform">
        Continue — MWK {{ currentPlan.price.toLocaleString() }}
      </button>

      <div class="flex items-center justify-center gap-2 mt-4">
        <span class="text-white/40 text-xs">Pay with</span>
        <span class="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10">Airtel Money</span>
        <span class="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10">TNM Mpamba</span>
      </div>
      <p class="text-center text-white/40 text-xs mt-4 leading-relaxed">Payment via mobile money. Your Gold features unlock as soon as payment is confirmed.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { X as XIcon, Crown as CrownIcon } from 'lucide-vue-next'

const router = useRouter()
const { info } = useToast()

const benefits = [
  { t: 'See who likes you', d: 'Skip the guessing — match instantly' },
  { t: 'Unlimited likes', d: 'Never run out of swipes' },
  { t: '5 Super Likes a day', d: 'Stand out to people you love' },
  { t: 'Boost', d: 'Be seen first for 30 minutes' }
]

const plans = [
  { id: '12months', label: '12 months', price: 15000, perMonth: 'MWK 1,250 / mo', tag: 'BEST', save: 'Save 50%' },
  { id: '6months', label: '6 months', price: 12000, perMonth: 'MWK 2,000 / mo', save: 'Save 33%' },
  { id: '1month', label: '1 month', price: 3000, perMonth: 'MWK 3,000 / mo' }
]

const selectedPlan = ref('6months')
const currentPlan = computed(() => plans.find(p => p.id === selectedPlan.value) || plans[1])

const handleSubscribe = () => {
  // Payment gateway (PayChangu / Airtel / TNM) integration is the next backend task.
  info('Mobile-money checkout is coming — we\'ll confirm your Gold upgrade shortly.')
}
</script>

<style scoped>
.stars{background:radial-gradient(1.5px 1.5px at 18% 12%,rgba(255,215,130,.7),transparent),radial-gradient(1px 1px at 70% 8%,rgba(255,255,255,.5),transparent),radial-gradient(1px 1px at 88% 20%,rgba(255,215,130,.5),transparent);}
</style>
