<template>
  <div class="sub k-page relative overflow-hidden">
    <!-- Header -->
    <div class="relative z-20 flex items-center justify-between px-4 py-4">
      <button @click="router.back()" class="k-iconbtn"><X :size="20" /></button>
      <span class="font-semibold text-white">Kondani Gold</span>
      <div style="width:40px"></div>
    </div>

    <!-- Active Subscription Banner if already Gold -->
    <div v-if="isAlreadyGold" class="relative z-20 mx-4 mb-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-center">
      <div class="inline-flex items-center gap-2 text-amber-300 font-bold text-sm">
        <Crown :size="18" /> You have active Kondani Gold!
      </div>
      <p class="text-xs text-white/70 mt-1" v-if="authStore.user?.premiumUntil">
        Valid until {{ new Date(authStore.user.premiumUntil).toLocaleDateString(undefined, { dateStyle: 'long' }) }}
      </p>
    </div>

    <!-- HERO with imagery -->
    <div class="hero">
      <img :src="heroImg" alt="Kondani Gold" />
      <div class="hero-scrim"></div>
      <div class="hero-content">
        <span class="eyebrow"><KondaniMark :size="20" /> Kondani Gold</span>
        <h1 class="k-serif mt-4 text-white">Stand out. <span style="color:var(--k-gold-l)">Match faster.</span></h1>
        <p>See who already likes you and never run out of likes — for the price of a soft drink.</p>
      </div>
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-6 pb-28">

      <!-- Plan Selector Options -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          v-for="p in availablePlans"
          :key="p.id"
          type="button"
          @click="selectedPlan = p.id"
          :class="[
            'p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between',
            selectedPlan === p.id
              ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/10'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          ]"
        >
          <span v-if="p.savings > 0" class="absolute -top-2.5 right-2 bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Save {{ p.savings }}%
          </span>
          <span v-if="p.id === '12_months'" class="absolute -top-2.5 right-2 bg-emerald-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Best Value
          </span>
          <div>
            <div class="text-xs font-semibold text-white/80">{{ p.name }}</div>
            <div class="text-lg font-bold text-amber-300 mt-1">MWK {{ p.price.toLocaleString() }}</div>
          </div>
          <div class="text-[11px] text-white/50 mt-2">
            MWK {{ Math.round(p.price / (p.duration / 30)).toLocaleString() }}/mo
          </div>
        </button>
      </div>

      <!-- Main Price Card for Selected Plan -->
      <div class="price-card">
        <div class="flex items-center justify-between">
          <span class="k-label" style="color:var(--k-gold-l)">Selected Plan: {{ currentPlanData.name }}</span>
          <BadgeCheck :size="24" class="text-amber-400" />
        </div>
        <div class="flex items-end gap-1.5 mt-3">
          <span class="price">MWK&nbsp;{{ currentPlanData.price.toLocaleString() }}</span>
          <span class="text-white/55 mb-2">/ {{ currentPlanData.duration }} days</span>
        </div>
        <div class="text-xs text-white/50 mt-1">Instant activation via Airtel Money, TNM Mpamba, or Card.</div>

        <ul class="incl">
          <li><Check :size="15" /> See who likes you right away</li>
          <li><Check :size="15" /> Unlimited likes every single day</li>
          <li><Check :size="15" /> 5 Super Likes a day</li>
          <li><Check :size="15" /> Monthly Profile Boost to get 10x views</li>
          <li><Check :size="15" /> Rewind accidental left-swipes</li>
          <li><Check :size="15" /> Exclusive verified Gold badge</li>
        </ul>

        <!-- Subscribe Button -->
        <button
          class="k-btn k-btn-gold w-full flex items-center justify-center gap-2"
          style="padding:16px;font-size:15px"
          :disabled="subscribing || verifying"
          @click="handleSubscribe"
        >
          <span v-if="subscribing" class="inline-block animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></span>
          <Crown v-else :size="18" />
          <span>{{ subscribing ? 'Connecting to PayChangu...' : `Get Gold — MWK ${currentPlanData.price.toLocaleString()}` }}</span>
        </button>

        <!-- Payment badges -->
        <div class="flex items-center justify-center flex-wrap gap-2 mt-4">
          <span class="k-chip" style="font-size:11px;padding:5px 11px">Airtel Money</span>
          <span class="k-chip" style="font-size:11px;padding:5px 11px">TNM Mpamba</span>
          <span class="k-chip" style="font-size:11px;padding:5px 11px">Visa / Mastercard</span>
        </div>
        <p class="flex items-center justify-center gap-1.5 text-white/40 text-xs mt-3">
          <Lock :size="12" /> Secure payment powered by PayChangu. Unlocks immediately.
        </p>
      </div>

      <!-- Feature Comparison -->
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
        <h3 class="text-xl font-bold text-white mb-2">Welcome to Kondani Gold</h3>
        <p class="text-sm text-white/80 mb-6">
          Your payment was confirmed. You now have unlimited likes, instant visibility on who likes you, and priority profile placement!
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
import { X, Crown, Check, Minus, Lock, BadgeCheck } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { success, error, info } = useToast()

const heroImg = 'https://images.unsplash.com/photo-1719179542047-a4d84fd35c1f?w=1400&q=80&fit=crop'

const subscribing = ref(false)
const verifying = ref(false)
const showSuccessModal = ref(false)
const selectedPlan = ref('1_month')

const availablePlans = [
  { id: '1_month', name: '1 Month', price: 600, duration: 30, savings: 0 },
  { id: '3_months', name: '3 Months', price: 1500, duration: 90, savings: 17 },
  { id: '6_months', name: '6 Months', price: 2800, duration: 180, savings: 22 },
  { id: '12_months', name: '1 Year', price: 5000, duration: 365, savings: 30 }
]

const currentPlanData = computed(() => {
  return availablePlans.find(p => p.id === selectedPlan.value) || availablePlans[0]
})

const isAlreadyGold = computed(() => {
  const user = authStore.user
  return Boolean(user?.isPremium && (!user.premiumUntil || new Date(user.premiumUntil) > new Date()))
})

const compare = [
  { label: 'Likes per day', free: 'Limited', gold: 'Unlimited' },
  { label: 'See who likes you', free: 'no', gold: 'yes' },
  { label: 'Super Likes', free: '1 / week', gold: '5 / day' },
  { label: 'Monthly Boost', free: 'no', gold: 'yes' },
  { label: 'Rewind last swipe', free: 'no', gold: 'yes' },
  { label: 'Verified gold badge', free: 'no', gold: 'yes' }
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
      // Save reference in sessionStorage for backup check
      if (result.referenceId) {
        sessionStorage.setItem('pending_payment_ref', result.referenceId)
      }
      // Redirect to PayChangu checkout page
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
        showSuccessModal.value = true
        // Clean URL query
        router.replace({ path: route.path, query: {} })
      } else if (checkResult.status === 'failed') {
        sessionStorage.removeItem('pending_payment_ref')
        error('Payment was not completed. You were not charged.')
        router.replace({ path: route.path, query: {} })
      } else {
        info('Payment is still pending on your mobile money account. It will activate as soon as confirmed.')
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
