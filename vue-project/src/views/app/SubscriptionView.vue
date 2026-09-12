<template>
  <div class="sub k-page relative overflow-hidden">
    <!-- Header -->
    <div class="relative z-20 flex items-center justify-between px-4 py-4">
      <button @click="router.back()" class="k-iconbtn"><X :size="20" /></button>
      <span class="font-semibold text-white">Kondani Premium</span>
      <div style="width:40px"></div>
    </div>

    <!-- Active Subscription Banner if already subscribed -->
    <div v-if="isAlreadyActive" class="relative z-20 mx-4 mb-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-center">
      <div class="inline-flex items-center gap-2 text-amber-300 font-bold text-sm">
        <Crown :size="18" /> You have active Kondani {{ activeTierName }}!
      </div>
      <p class="text-xs text-white/70 mt-1" v-if="authStore.user?.premiumUntil">
        Valid until {{ new Date(authStore.user.premiumUntil).toLocaleDateString(undefined, { dateStyle: 'long' }) }}
      </p>
    </div>

    <!-- HERO with imagery -->
    <div class="hero">
      <img :src="heroImg" alt="Kondani Subscriptions" />
      <div class="hero-scrim"></div>
      <div class="hero-content">
        <span class="eyebrow"><KondaniMark :size="20" /> Kondani Memberships</span>
        <h1 class="k-serif mt-4 text-white">Stand out. <span style="color:var(--k-gold-l)">Match faster.</span></h1>
        <p>Unlock more likes, see who likes you, and get priority visibility — cancel anytime.</p>
      </div>
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-6 pb-28">

      <!-- Plan Selector (3 Tiers: 1 Week, 1 Month, 1 Year) -->
      <div class="grid grid-cols-3 gap-2.5 sm:gap-3.5 mb-6">
        <button
          v-for="p in availablePlans"
          :key="p.id"
          type="button"
          @click="selectedPlan = p.id"
          :class="[
            'p-3 sm:p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer',
            selectedPlan === p.id
              ? 'border-amber-400 bg-amber-400/15 shadow-xl shadow-amber-400/10 scale-[1.02]'
              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
          ]"
        >
          <!-- Badge -->
          <span
            v-if="p.badge"
            :class="[
              'absolute -top-2.5 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
              p.id === '1_month' ? 'bg-amber-400 text-black shadow' : '',
              p.id === '1_year' ? 'bg-purple-400 text-black shadow' : '',
              p.id === '1_week' ? 'bg-sky-400 text-black shadow' : ''
            ]"
          >
            {{ p.badge }}
          </span>

          <div>
            <div class="flex items-center gap-1 text-xs font-semibold text-white/75">
              <span>{{ p.name }}</span>
            </div>
            <div class="text-xs font-bold uppercase tracking-wider mt-0.5" :style="{ color: p.accentColor }">
              {{ p.subtitle }}
            </div>
            <div class="text-base sm:text-xl font-bold text-white mt-1.5 font-display">
              MWK {{ p.price.toLocaleString() }}
            </div>
          </div>
          <div class="text-[11px] text-white/50 mt-2 font-medium">
            {{ p.unitLabel }}
          </div>
        </button>
      </div>

      <!-- Main Price Card for Selected Plan -->
      <div
        class="price-card transition-all duration-300"
        :style="{
          borderColor: currentPlanData.accentColor ? `${currentPlanData.accentColor}66` : 'rgba(244,183,64,.45)',
          boxShadow: `0 24px 60px ${currentPlanData.accentColor || '#f4b740'}22`
        }"
      >
        <div class="flex items-center justify-between">
          <div>
            <span class="k-label text-xs uppercase tracking-wider font-bold" :style="{ color: currentPlanData.accentColor }">
              Tier: {{ currentPlanData.subtitle }}
            </span>
            <h3 class="text-lg font-bold text-white mt-0.5">{{ currentPlanData.name }} Pass</h3>
          </div>
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center border"
            :style="{
              background: `${currentPlanData.accentColor}22`,
              borderColor: `${currentPlanData.accentColor}66`,
              color: currentPlanData.accentColor
            }"
          >
            <Crown v-if="currentPlanData.tier === 'gold'" :size="20" />
            <Sparkles v-else-if="currentPlanData.tier === 'platinum'" :size="20" />
            <BadgeCheck v-else :size="20" />
          </div>
        </div>

        <div class="flex items-end gap-2 mt-4">
          <span class="price" :style="{ color: currentPlanData.accentColor }">
            MWK&nbsp;{{ currentPlanData.price.toLocaleString() }}
          </span>
          <span class="text-white/55 mb-2 font-medium">/ {{ currentPlanData.duration }} days</span>
        </div>
        <p class="text-xs text-white/60 mt-1">{{ currentPlanData.headline }}</p>

        <!-- Dynamic Feature List Per Tier -->
        <ul class="incl">
          <li
            v-for="(feat, idx) in currentPlanData.features"
            :key="idx"
            :class="[
              'flex items-center gap-2.5 text-sm transition-opacity',
              feat.included ? 'text-white' : 'text-white/30 line-through'
            ]"
          >
            <Check v-if="feat.included" :size="16" :style="{ color: currentPlanData.accentColor }" class="shrink-0" />
            <Minus v-else :size="16" class="text-white/20 shrink-0" />
            <span :class="{ 'font-semibold': feat.highlight }">{{ feat.text }}</span>
          </li>
        </ul>

        <!-- Subscribe Button -->
        <button
          class="k-btn w-full flex items-center justify-center gap-2 font-bold cursor-pointer transition-transform active:scale-[0.98]"
          :style="{
            background: currentPlanData.btnGradient || 'linear-gradient(135deg, #f4b740, #e29d18)',
            color: '#050d12',
            padding: '16px',
            fontSize: '15px'
          }"
          :disabled="subscribing || verifying"
          @click="handleSubscribe"
        >
          <span v-if="subscribing" class="inline-block animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></span>
          <Crown v-else :size="18" />
          <span>{{ subscribing ? 'Connecting to PayChangu...' : `Get ${currentPlanData.subtitle} — MWK ${currentPlanData.price.toLocaleString()}` }}</span>
        </button>

        <!-- Payment badges -->
        <div class="flex items-center justify-center flex-wrap gap-2 mt-4">
          <span class="k-chip" style="font-size:11px;padding:5px 11px">Airtel Money</span>
          <span class="k-chip" style="font-size:11px;padding:5px 11px">TNM Mpamba</span>
          <span class="k-chip" style="font-size:11px;padding:5px 11px">Visa / Mastercard</span>
        </div>
        <p class="flex items-center justify-center gap-1.5 text-white/40 text-xs mt-3">
          <Lock :size="12" /> Instant automatic activation powered by PayChangu.
        </p>
      </div>

      <!-- Feature Comparison Table -->
      <p class="k-label mt-12 mb-4">Compare All Tiers</p>
      <div class="cmp">
        <div class="cmp-row cmp-head">
          <span>Feature</span>
          <span>Free</span>
          <span class="text-sky-300">Plus</span>
          <span class="text-amber-300 font-bold">Gold</span>
          <span class="text-purple-300 font-bold">VIP</span>
        </div>
        <div v-for="(r, i) in compare" :key="i" class="cmp-row">
          <span class="cmp-label">{{ r.label }}</span>
          <span class="cmp-val text-white/40">{{ r.free }}</span>
          <span class="cmp-val text-sky-200">{{ r.plus }}</span>
          <span class="cmp-val text-amber-300 font-semibold">{{ r.gold }}</span>
          <span class="cmp-val text-purple-300 font-semibold">{{ r.plat }}</span>
        </div>
      </div>

    </div>

    <!-- Verification / Status Modal -->
    <div v-if="verifying" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div class="bg-neutral-900 border border-amber-400/40 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
        <div class="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 class="text-lg font-bold text-white mb-2">Verifying Payment</h3>
        <p class="text-xs text-white/70">
          Checking your transaction status with PayChangu... Please keep this page open.
        </p>
      </div>
    </div>

    <!-- Celebratory Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
      <div class="bg-neutral-900 border border-amber-400 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-200">
        <div class="w-16 h-16 bg-amber-400/20 text-amber-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-400/50">
          <Crown :size="32" />
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Welcome to Kondani {{ activatedTierTitle }}!</h3>
        <p class="text-sm text-white/80 mb-6">
          Your payment was confirmed. Your perks are now unlocked instantly on your profile!
        </p>
        <button @click="closeSuccessModal" class="k-btn k-btn-gold w-full py-3.5 font-semibold">
          Explore Matches Now
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import subscriptionService from '@/services/subscriptionService'
import KondaniMark from '@/components/ui/KondaniMark.vue'
import { X, Crown, Check, Minus, Lock, BadgeCheck, Sparkles } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { error, info } = useToast()

const heroImg = 'https://images.unsplash.com/photo-1719179542047-a4d84fd35c1f?w=1400&q=80&fit=crop'

const subscribing = ref(false)
const verifying = ref(false)
const showSuccessModal = ref(false)
const activatedTierTitle = ref('Premium')
const selectedPlan = ref('1_month') // Default to 1 Month Gold (most popular)

// 3 Differentiated Subscription Tiers
const availablePlans = [
  {
    id: '1_week',
    tier: 'plus',
    name: '1 Week',
    subtitle: 'Plus',
    price: 600,
    duration: 7,
    unitLabel: 'MWK 600 / wk',
    badge: 'Starter',
    accentColor: '#38bdf8', // sky cyan
    btnGradient: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
    headline: 'Essential boost: Unlimited likes and rewinds for 7 days.',
    features: [
      { text: 'Unlimited likes every day', included: true, highlight: true },
      { text: 'Rewind accidental left-swipes', included: true },
      { text: '2 Super Likes every day', included: true },
      { text: 'See how many people liked you', included: true },
      { text: 'Unlock full profiles of who likes you', included: false },
      { text: 'Monthly profile boosts', included: false },
      { text: 'Priority Likes in swipe decks', included: false }
    ]
  },
  {
    id: '1_month',
    tier: 'gold',
    name: '1 Month',
    subtitle: 'Gold',
    price: 2400,
    duration: 30,
    unitLabel: 'MWK 80 / day',
    badge: 'Popular',
    accentColor: '#f59e0b', // warm gold
    btnGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    headline: 'Our #1 choice: See who likes you, 5 Super Likes, and 1 monthly Boost.',
    features: [
      { text: 'See who likes you & match instantly', included: true, highlight: true },
      { text: 'Unlimited likes every day', included: true },
      { text: '5 Super Likes every day', included: true },
      { text: '1 Monthly Profile Boost (10x views)', included: true },
      { text: 'Rewind accidental left-swipes', included: true },
      { text: 'Verified Gold Crown on your profile', included: true },
      { text: 'Priority Likes in swipe decks', included: false }
    ]
  },
  {
    id: '1_year',
    tier: 'platinum',
    name: '1 Year',
    subtitle: 'VIP Platinum',
    price: 6000,
    duration: 365,
    unitLabel: 'Save > 75%',
    badge: 'Best Value',
    accentColor: '#c084fc', // purple / platinum
    btnGradient: 'linear-gradient(135deg, #c084fc, #9333ea)',
    headline: 'Maximum advantage: Priority matching, 3 boosts, and 10 Super Likes a day.',
    features: [
      { text: 'Priority Likes (your likes seen first)', included: true, highlight: true },
      { text: 'See who likes you & match instantly', included: true },
      { text: 'Unlimited likes every day', included: true },
      { text: '10 Super Likes every day', included: true },
      { text: '3 Monthly Profile Boosts (10x views)', included: true },
      { text: 'Rewind accidental left-swipes', included: true },
      { text: 'Exclusive VIP Platinum Diamond badge', included: true }
    ]
  }
]

const currentPlanData = computed(() => {
  return availablePlans.find(p => p.id === selectedPlan.value) || availablePlans[1]
})

const isAlreadyActive = computed(() => {
  const user = authStore.user
  return Boolean(user?.isPremium && (!user.premiumUntil || new Date(user.premiumUntil) > new Date()))
})

const activeTierName = computed(() => {
  const tier = authStore.user?.subscriptionTier
  if (tier === 'platinum') return 'VIP Platinum'
  if (tier === 'plus') return 'Plus'
  return 'Gold'
})

// Detailed feature comparison matrix
const compare = [
  { label: 'Daily Likes', free: '20', plus: 'Unlimited', gold: 'Unlimited', plat: 'Unlimited' },
  { label: 'Rewind Swipes', free: '—', plus: 'Yes', gold: 'Yes', plat: 'Yes' },
  { label: 'Daily Super Likes', free: '1 / day', plus: '2 / day', gold: '5 / day', plat: '10 / day' },
  { label: 'See Who Likes You', free: 'Count', plus: 'Count', gold: 'Full profile', plat: 'Full profile' },
  { label: 'Profile Boosts', free: '—', plus: '—', gold: '1 / month', plat: '3 / month' },
  { label: 'Priority In Decks', free: '—', plus: '—', gold: '—', plat: 'Priority #1' },
  { label: 'Profile Badge', free: 'Standard', plus: 'Plus', gold: 'Gold Crown', plat: 'VIP Platinum' }
]

/**
 * Handle checkout button click
 */
const handleSubscribe = async () => {
  if (subscribing.value) return
  subscribing.value = true

  try {
    const result = await subscriptionService.initiatePayment(selectedPlan.value)

    if (result.success && result.checkoutUrl) {
      info('Opening PayChangu secure checkout...')
      if (result.referenceId) {
        sessionStorage.setItem('pending_payment_ref', result.referenceId)
      }
      window.location.href = result.checkoutUrl
    } else {
      error(result.error || 'Could not initiate payment. Please try again.')
    }
  } catch (err) {
    console.error('Subscription initiate error:', err)
    error(err.response?.data?.error || err.message || 'Payment initiation failed')
  } finally {
    subscribing.value = false
  }
}

/**
 * Close success modal and return to matches
 */
const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/app')
}

/**
 * On mount: check if returning from PayChangu with ?ref=...
 */
onMounted(async () => {
  const ref = route.query.tx_ref || route.query.ref || sessionStorage.getItem('pending_payment_ref')
  const statusParam = route.query.status

  if (statusParam === 'cancelled') {
    sessionStorage.removeItem('pending_payment_ref')
    error('Payment was cancelled.')
    router.replace({ path: route.path, query: {} })
    return
  }

  if (ref) {
    verifying.value = true
    try {
      const checkResult = await subscriptionService.pollPaymentStatus(ref, 10, 2500)

      if (checkResult.status === 'completed') {
        sessionStorage.removeItem('pending_payment_ref')
        await authStore.fetchUser()
        activatedTierTitle.value = checkResult.subscriptionTier === 'platinum' ? 'VIP Platinum' : (checkResult.subscriptionTier === 'plus' ? 'Plus' : 'Gold')
        showSuccessModal.value = true
        router.replace({ path: route.path, query: {} })
      } else if (checkResult.status === 'failed') {
        sessionStorage.removeItem('pending_payment_ref')
        error('Payment was not completed. You were not charged.')
        router.replace({ path: route.path, query: {} })
      } else {
        info('Payment is pending mobile confirmation. Your tier will activate once approved.')
      }
    } catch (err) {
      console.warn('Verification check error:', err)
    } finally {
      verifying.value = false
    }
  }
})
</script>

<style scoped>
.sub { overflow-x: hidden; }

/* hero */
.hero { position: relative; height: 280px; overflow: hidden; margin-top: -64px; }
.hero img { width: 100%; height: 100%; object-fit: cover; object-position: center 30%; }
.hero-scrim { position: absolute; inset: 0; background:
  radial-gradient(circle at 50% 30%, rgba(244,183,64,.28), transparent 60%),
  linear-gradient(180deg, rgba(5,13,18,.55) 0%, rgba(5,13,18,.5) 35%, var(--k-night) 96%); }
.hero-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; padding: 0 24px 28px; }
.hero-content h1 { font-size: clamp(1.8rem, 4vw, 2.8rem); line-height: 1.08; }
.hero-content p { color: rgba(255,255,255,.75); margin-top: 10px; max-width: 520px; font-size: 14px; }
.eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  color: var(--k-gold-l); background: rgba(5,13,18,.5); border: 1px solid rgba(244,183,64,.4); padding: 6px 13px; border-radius: 99px; backdrop-filter: blur(6px); }

/* price card */
.price-card { position: relative; padding: 24px; border-radius: 20px; border: 1px solid rgba(244,183,64,.45);
  background: linear-gradient(160deg, rgba(255,255,255,.05), var(--k-card) 60%); }
.price { font-family: 'Fraunces', serif; font-weight: 600; font-size: 2.3rem; line-height: 1; }
.incl { list-style: none; margin: 18px 0; padding: 18px 0; border-top: 1px solid var(--k-line); border-bottom: 1px solid var(--k-line); display: flex; flex-direction: column; gap: 11px; }
.incl li { display: flex; align-items: center; gap: 10px; font-size: 14px; }

/* comparison table */
.cmp { border: 1px solid var(--k-line); border-radius: 16px; overflow: hidden; background: var(--k-card); }
.cmp-row { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.1fr 1.1fr; align-items: center; padding: 12px 14px; border-bottom: 1px solid var(--k-line); font-size: 13px; }
.cmp-row:last-child { border-bottom: none; }
.cmp-head { background: rgba(255,255,255,.04); }
.cmp-head span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--k-mut2); text-align: center; }
.cmp-head span:first-child { text-align: left; }
.cmp-label { font-size: 13px; color: var(--k-txt); }
.cmp-val { font-size: 12px; text-align: center; display: flex; align-items: center; justify-content: center; }

@media (max-width: 640px) {
  .price { font-size: 1.9rem; }
  .cmp-row { padding: 10px 8px; font-size: 11px; grid-template-columns: 1.3fr 0.9fr 0.9fr 1fr 1.1fr; }
  .cmp-head span { font-size: 9px; }
  .cmp-label { font-size: 11px; }
  .cmp-val { font-size: 10.5px; }
}
</style>
