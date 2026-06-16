<template>
  <div class="sub k-page relative overflow-hidden">
    <!-- Header -->
    <div class="relative z-20 flex items-center justify-between px-4 py-4">
      <button @click="router.back()" class="k-iconbtn"><X :size="20" /></button>
      <span class="font-semibold">Kondani Gold</span>
      <div style="width:40px"></div>
    </div>

    <!-- HERO with imagery -->
    <div class="hero">
      <img :src="heroImg" alt="" />
      <div class="hero-scrim"></div>
      <div class="hero-content">
        <span class="eyebrow"><KondaniMark :size="20" /> Kondani Gold</span>
        <h1 class="k-serif mt-4">Stand out. <span style="color:var(--k-gold-l)">Match faster.</span></h1>
        <p>See who already likes you and never run out of likes — for the price of a soft drink.</p>
      </div>
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-28">
      <!-- Single price card -->
      <div class="price-card">
        <div class="flex items-center justify-between">
          <span class="k-label" style="color:var(--k-gold-l)">Kondani Gold</span>
          <BadgeCheck :size="24" class="text-gold-400" />
        </div>
        <div class="flex items-end gap-1.5 mt-3">
          <span class="price">MWK&nbsp;600</span>
          <span class="text-white/55 mb-2">/ month</span>
        </div>
        <div class="text-xs text-white/50 mt-1">Cancel anytime. No hidden fees.</div>

        <ul class="incl">
          <li><Check :size="15" /> See who likes you</li>
          <li><Check :size="15" /> Unlimited likes</li>
          <li><Check :size="15" /> 5 Super Likes a day</li>
          <li><Check :size="15" /> A monthly Boost</li>
        </ul>

        <button class="k-btn k-btn-gold w-full" style="padding:16px;font-size:15px" @click="handleSubscribe">
          <Crown :size="18" /> Get Gold — MWK 600/month
        </button>

        <div class="flex items-center justify-center flex-wrap gap-2 mt-4">
          <span class="k-chip" style="font-size:11px;padding:5px 11px">Airtel Money</span>
          <span class="k-chip" style="font-size:11px;padding:5px 11px">TNM Mpamba</span>
        </div>
        <p class="flex items-center justify-center gap-1.5 text-white/40 text-xs mt-3"><Lock :size="12" /> Unlocks instantly when payment confirms.</p>
      </div>

      <!-- Comparison -->
      <p class="k-label mt-12 mb-4">Free vs Gold</p>
      <div class="cmp">
        <div class="cmp-row cmp-head">
          <span>Feature</span>
          <span>Free</span>
          <span class="g">Gold</span>
        </div>
        <div v-for="(r, i) in compare" :key="i" class="cmp-row">
          <span class="cmp-label">{{ r.label }}</span>
          <span class="cmp-val">
            <Minus v-if="r.free === 'no'" :size="15" class="text-white/25" />
            <template v-else>{{ r.free }}</template>
          </span>
          <span class="cmp-val g">
            <Check v-if="r.gold === 'yes'" :size="16" />
            <template v-else>{{ r.gold }}</template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import KondaniMark from '@/components/ui/KondaniMark.vue'
import { X, Crown, Check, Minus, Lock, BadgeCheck } from 'lucide-vue-next'

const router = useRouter()
const { info } = useToast()

const heroImg = 'https://images.unsplash.com/photo-1719179542047-a4d84fd35c1f?w=1400&q=80&fit=crop'

const compare = [
  { label: 'Likes per day', free: 'Limited', gold: 'Unlimited' },
  { label: 'See who likes you', free: 'no', gold: 'yes' },
  { label: 'Super Likes', free: '1 / week', gold: '5 / day' },
  { label: 'Monthly Boost', free: 'no', gold: 'yes' },
  { label: 'Rewind last swipe', free: 'no', gold: 'yes' },
  { label: 'Verified gold badge', free: 'no', gold: 'yes' }
]

const handleSubscribe = () => {
  info('Mobile-money checkout (Airtel / TNM) is being set up — we\'ll confirm your Gold upgrade shortly.')
}
</script>

<style scoped>
.sub { overflow-x: hidden; }

/* hero */
.hero { position: relative; height: 300px; overflow: hidden; margin-top: -64px; }
.hero img { width: 100%; height: 100%; object-fit: cover; object-position: center 30%; }
.hero-scrim { position: absolute; inset: 0; background:
  radial-gradient(circle at 50% 30%, rgba(244,183,64,.28), transparent 60%),
  linear-gradient(180deg, rgba(5,13,18,.55) 0%, rgba(5,13,18,.5) 35%, var(--k-night) 96%); }
.hero-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; padding: 0 24px 28px; }
.hero-content h1 { font-size: clamp(1.9rem, 4.5vw, 3rem); line-height: 1.06; }
.hero-content p { color: rgba(255,255,255,.75); margin-top: 12px; max-width: 520px; font-size: 15px; }
.eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  color: var(--k-gold-l); background: rgba(5,13,18,.5); border: 1px solid rgba(244,183,64,.4); padding: 7px 14px; border-radius: 99px; backdrop-filter: blur(6px); }

/* price card */
.price-card { position: relative; padding: 26px; border-radius: 20px; border: 1px solid rgba(244,183,64,.45);
  background: linear-gradient(160deg, rgba(244,183,64,.14), var(--k-card) 60%); box-shadow: 0 24px 60px rgba(244,183,64,.16); }
.price { font-family: 'Fraunces', serif; font-weight: 600; font-size: 2.6rem; line-height: 1; color: var(--k-gold-l); }
.incl { list-style: none; margin: 18px 0; padding: 18px 0; border-top: 1px solid var(--k-line); border-bottom: 1px solid var(--k-line); display: flex; flex-direction: column; gap: 11px; }
.incl li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--k-txt); }
.incl li svg { color: var(--k-gold); flex-shrink: 0; }

/* comparison */
.cmp { border: 1px solid var(--k-line); border-radius: 16px; overflow: hidden; background: var(--k-card); }
.cmp-row { display: grid; grid-template-columns: 1.6fr 1fr 1fr; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--k-line); }
.cmp-row:last-child { border-bottom: none; }
.cmp-head { background: rgba(255,255,255,.03); }
.cmp-head span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--k-mut2); text-align: center; }
.cmp-head span:first-child { text-align: left; }
.cmp-head .g { color: var(--k-gold-l); }
.cmp-label { font-size: 14px; color: var(--k-txt); }
.cmp-val { font-size: 13px; color: var(--k-mut); text-align: center; display: flex; align-items: center; justify-content: center; }
.cmp-val.g { color: #fff; font-weight: 600; }
.cmp-val.g svg { color: var(--k-gold); }
</style>
