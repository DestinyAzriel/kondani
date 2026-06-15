<template>
  <div class="sub k-page relative overflow-hidden">
    <div class="k-stars"></div>
    <div class="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[70%] h-[40%] rounded-full blur-[120px] pointer-events-none"
         style="background:radial-gradient(circle,rgba(244,183,64,.18),transparent 70%)"></div>

    <div class="relative z-10 flex items-center justify-between px-4 py-4 border-b border-white/5">
      <button @click="router.back()" class="k-iconbtn"><X :size="20" /></button>
      <span class="font-semibold">Kondani Gold</span>
      <div style="width:40px"></div>
    </div>

    <div class="relative z-10 max-w-lg mx-auto px-5 py-9 pb-28">
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style="background:rgba(244,183,64,.14);color:var(--k-gold)"><Crown :size="30" /></div>
        <h1 class="k-title" style="font-size:2.1rem">Stand out. Match faster.</h1>
        <p class="text-white/60 mt-2">See who likes you and get unlimited likes.</p>
      </div>

      <div class="space-y-3 mb-8">
        <div v-for="b in benefits" :key="b.t" class="k-card flex items-start gap-3" style="padding:15px">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background:rgba(244,183,64,.12);color:var(--k-gold)"><component :is="b.icon" :size="18" /></div>
          <div><div class="font-semibold text-sm">{{ b.t }}</div><div class="text-xs text-white/55 mt-0.5">{{ b.d }}</div></div>
        </div>
      </div>

      <!-- Single, low-cost plan -->
      <div class="k-card mb-5" style="padding:22px;border-color:rgba(244,183,64,.4);background:linear-gradient(150deg,rgba(244,183,64,.1),var(--k-card))">
        <div class="flex items-end justify-between">
          <div>
            <div class="k-label">Kondani Gold</div>
            <div class="flex items-end gap-1 mt-2">
              <span class="k-serif" style="font-size:2.4rem;color:var(--k-gold-l)">MWK 600</span>
              <span class="text-white/50 mb-1.5">/ month</span>
            </div>
            <div class="text-xs text-white/50 mt-1">Cancel anytime. No hidden fees.</div>
          </div>
          <BadgeCheck :size="28" class="text-gold-400 mb-1" />
        </div>
      </div>

      <button class="k-btn k-btn-gold w-full" style="padding:16px;font-size:16px" @click="handleSubscribe">
        Get Gold — MWK 600/month
      </button>

      <div class="flex items-center justify-center gap-2 mt-5">
        <span class="text-white/40 text-xs">Pay with</span>
        <span class="k-chip" style="font-size:11px;padding:5px 11px">Airtel Money</span>
        <span class="k-chip" style="font-size:11px;padding:5px 11px">TNM Mpamba</span>
      </div>
      <p class="text-center text-white/35 text-xs mt-4 leading-relaxed">Your Gold features unlock the moment your mobile-money payment is confirmed.</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { X, Crown, BadgeCheck, Eye, Infinity as InfinityIcon, Star, Zap } from 'lucide-vue-next'

const router = useRouter()
const { info } = useToast()

const benefits = [
  { t: 'See who likes you', d: 'Skip the guessing — match instantly', icon: Eye },
  { t: 'Unlimited likes', d: 'Never run out of swipes', icon: InfinityIcon },
  { t: '5 Super Likes a day', d: 'Stand out to people you love', icon: Star },
  { t: 'Monthly Boost', d: 'Be seen first for 30 minutes', icon: Zap }
]

const handleSubscribe = () => {
  info('Mobile-money checkout (Airtel / TNM) is being set up — we\'ll confirm your Gold upgrade shortly.')
}
</script>

<style scoped>
.sub { overflow-x: hidden; }
</style>
