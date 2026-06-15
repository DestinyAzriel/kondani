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

    <div class="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-10 lg:py-16 pb-28">
      <!-- Hero -->
      <div class="text-center max-w-2xl mx-auto">
        <div class="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style="background:rgba(244,183,64,.14);color:var(--k-gold)"><Crown :size="26" /></div>
        <h1 class="k-serif" style="font-size:clamp(1.6rem,3.2vw,2.4rem);line-height:1.12">Stand out. Match faster.</h1>
        <p class="text-white/60 mt-3 text-base">See who likes you and get unlimited likes — for the price of a soft drink.</p>
      </div>

      <!-- Two-column on desktop: benefits | pricing -->
      <div class="grid lg:grid-cols-5 gap-7 lg:gap-10 mt-10 lg:mt-14 items-start">

        <!-- Benefits -->
        <div class="lg:col-span-3">
          <p class="k-label mb-4">What you get</p>
          <div class="grid sm:grid-cols-2 gap-3">
            <div v-for="b in benefits" :key="b.t" class="k-card flex items-start gap-3" style="padding:16px">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(244,183,64,.12);color:var(--k-gold)"><component :is="b.icon" :size="19" /></div>
              <div><div class="font-semibold text-[15px]">{{ b.t }}</div><div class="text-xs text-white/55 mt-1 leading-relaxed">{{ b.d }}</div></div>
            </div>
          </div>
        </div>

        <!-- Pricing -->
        <div class="lg:col-span-2 lg:sticky lg:top-24">
          <div class="k-card" style="padding:26px;border-color:rgba(244,183,64,.4);background:linear-gradient(155deg,rgba(244,183,64,.12),var(--k-card))">
            <div class="flex items-center justify-between">
              <div class="k-label">Kondani Gold</div>
              <BadgeCheck :size="26" class="text-gold-400" />
            </div>
            <div class="flex items-end gap-1.5 mt-3">
              <span class="k-serif" style="font-size:2.2rem;color:var(--k-gold-l)">MWK 600</span>
              <span class="text-white/50 mb-1.5">/ month</span>
            </div>
            <div class="text-xs text-white/50 mt-1">Cancel anytime. No hidden fees.</div>

            <button class="k-btn k-btn-gold w-full mt-6" style="padding:15px;font-size:15px" @click="handleSubscribe">
              Get Gold — MWK 600/month
            </button>

            <div class="flex items-center justify-center flex-wrap gap-2 mt-5">
              <span class="text-white/40 text-xs">Pay with</span>
              <span class="k-chip" style="font-size:11px;padding:5px 11px">Airtel Money</span>
              <span class="k-chip" style="font-size:11px;padding:5px 11px">TNM Mpamba</span>
            </div>
            <p class="text-center text-white/35 text-xs mt-4 leading-relaxed">Your Gold features unlock the moment your mobile-money payment is confirmed.</p>
          </div>
        </div>
      </div>
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
