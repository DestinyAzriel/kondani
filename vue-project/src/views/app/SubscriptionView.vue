<template>
  <div class="sub k-page relative overflow-hidden">
    <div class="k-stars"></div>
    <div class="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[70%] h-[40%] rounded-full blur-[120px] pointer-events-none"
         style="background:radial-gradient(circle,rgba(244,183,64,.2),transparent 70%)"></div>

    <div class="relative z-10 flex items-center justify-between px-4 py-4 border-b border-white/5">
      <button @click="router.back()" class="k-iconbtn"><X :size="20" /></button>
      <span class="font-semibold">Kondani Gold</span>
      <div style="width:40px"></div>
    </div>

    <div class="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-10 lg:py-16 pb-28">
      <!-- Hero -->
      <div class="text-center max-w-2xl mx-auto">
        <span class="eyebrow"><Crown :size="13" /> Premium membership</span>
        <h1 class="k-serif mt-5" style="font-size:clamp(1.9rem,4vw,3rem);line-height:1.08">Stand out. <span style="color:var(--k-gold-l)">Match faster.</span></h1>
        <p class="text-white/65 mt-4 text-base sm:text-lg">See who already likes you and never run out of likes — for the price of a soft drink.</p>
      </div>

      <!-- Two-column -->
      <div class="grid lg:grid-cols-5 gap-7 lg:gap-10 mt-12 items-start">

        <!-- Benefits -->
        <div class="lg:col-span-3">
          <p class="k-label mb-4">Everything you get</p>
          <div class="grid sm:grid-cols-2 gap-3">
            <div v-for="b in benefits" :key="b.t" class="benefit">
              <div class="benefit-ic"><component :is="b.icon" :size="19" /></div>
              <div><div class="font-semibold text-[15px]">{{ b.t }}</div><div class="text-xs text-white/55 mt-1 leading-relaxed">{{ b.d }}</div></div>
            </div>
          </div>

          <div class="social mt-5">
            <div class="flex -space-x-2">
              <span v-for="n in 4" :key="n" class="dot" :style="{ background: dotColors[n-1] }"></span>
            </div>
            <p>Join Malawians upgrading to find love faster.</p>
          </div>
        </div>

        <!-- Pricing -->
        <div class="lg:col-span-2 lg:sticky lg:top-24">
          <div class="price-card">
            <span class="tag">Best value</span>
            <div class="k-label" style="color:var(--k-gold-l)">Kondani Gold</div>
            <div class="flex items-end gap-1.5 mt-3">
              <span class="price">MWK&nbsp;600</span>
              <span class="text-white/50 mb-2">/ month</span>
            </div>
            <div class="text-xs text-white/50 mt-1">Cancel anytime. No hidden fees.</div>

            <ul class="incl">
              <li><Check :size="15" /> See who likes you</li>
              <li><Check :size="15" /> Unlimited likes</li>
              <li><Check :size="15" /> 5 Super Likes a day</li>
              <li><Check :size="15" /> A monthly Boost</li>
            </ul>

            <button class="k-btn k-btn-gold w-full" style="padding:15px;font-size:15px" @click="handleSubscribe">
              <Crown :size="17" /> Get Gold
            </button>

            <div class="flex items-center justify-center flex-wrap gap-2 mt-4">
              <span class="k-chip" style="font-size:11px;padding:5px 11px">Airtel Money</span>
              <span class="k-chip" style="font-size:11px;padding:5px 11px">TNM Mpamba</span>
            </div>
            <p class="flex items-center justify-center gap-1.5 text-white/40 text-xs mt-3"><Lock :size="12" /> Unlocks instantly when payment confirms.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { X, Crown, Check, Lock, Eye, Infinity as InfinityIcon, Star, Zap } from 'lucide-vue-next'

const router = useRouter()
const { info } = useToast()

const benefits = [
  { t: 'See who likes you', d: 'Skip the guessing — match instantly', icon: Eye },
  { t: 'Unlimited likes', d: 'Never run out of swipes', icon: InfinityIcon },
  { t: '5 Super Likes a day', d: 'Stand out to people you love', icon: Star },
  { t: 'Monthly Boost', d: 'Be seen first for 30 minutes', icon: Zap }
]
const dotColors = ['#f4b740', '#2dd4bf', '#ff7a6b', '#ffd98a']

const handleSubscribe = () => {
  info('Mobile-money checkout (Airtel / TNM) is being set up — we\'ll confirm your Gold upgrade shortly.')
}
</script>

<style scoped>
.sub { overflow-x: hidden; }

.eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: var(--k-gold-l); background: rgba(244,183,64,.12); border: 1px solid rgba(244,183,64,.3); padding: 7px 14px; border-radius: 99px; }

.benefit { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 16px; background: var(--k-card); border: 1px solid var(--k-line); transition: transform .15s, border-color .2s; }
.benefit:hover { transform: translateY(-2px); border-color: rgba(244,183,64,.3); }
.benefit-ic { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(244,183,64,.13); color: var(--k-gold); }

.social { display: flex; align-items: center; gap: 12px; }
.social .dot { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--k-night); }
.social p { font-size: 13px; color: var(--k-mut); }

.price-card { position: relative; padding: 26px; border-radius: 20px; border: 1px solid rgba(244,183,64,.45);
  background: linear-gradient(160deg, rgba(244,183,64,.14), var(--k-card) 60%); box-shadow: 0 24px 60px rgba(244,183,64,.16); }
.tag { position: absolute; top: 16px; right: 16px; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
  background: linear-gradient(95deg, var(--k-gold), var(--k-gold-l)); color: var(--k-night); padding: 4px 10px; border-radius: 99px; }
.price { font-family: 'Fraunces', serif; font-weight: 600; font-size: 2.4rem; line-height: 1; color: var(--k-gold-l); }
.incl { list-style: none; margin: 18px 0; padding: 18px 0; border-top: 1px solid var(--k-line); border-bottom: 1px solid var(--k-line); display: flex; flex-direction: column; gap: 11px; }
.incl li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--k-txt); }
.incl li svg { color: var(--k-gold); flex-shrink: 0; }
</style>
