<template>
  <div class="sub k-page relative overflow-hidden">
    <!-- Header -->
    <div class="relative z-20 flex items-center justify-between px-4 py-3.5 sm:px-6">
      <button @click="router.back()" class="k-iconbtn cursor-pointer" title="Close"><X :size="20" /></button>
      <div class="flex items-center gap-2">
        <KondaniMark :size="24" />
        <span class="font-bold text-white text-base tracking-wide">Kondani Memberships</span>
      </div>
      <div style="width:40px"></div>
    </div>

    <!-- HERO with imagery -->
    <div class="hero">
      <img :src="heroImg" alt="Kondani Subscriptions" />
      <div class="hero-scrim"></div>
      <div class="hero-content">
        <h1 class="k-serif text-white">Stand out. <span style="color:var(--k-gold-l)">Match faster.</span></h1>
        <p>Unlock more likes, see who likes you, and get priority visibility — cancel anytime.</p>
      </div>
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-6 pb-28">

      <!-- Plan Selector (3 Tiers: 1 Week, 1 Month, 1 Year) -->
      <div class="plan-grid mb-6">
        <button
          v-for="p in availablePlans"
          :key="p.id"
          type="button"
          @click="selectedPlan = p.id"
          :class="[
            'plan-card border text-left transition-all relative flex flex-col justify-between cursor-pointer',
            selectedPlan === p.id
              ? 'selected'
              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
          ]"
          :style="selectedPlan === p.id ? { borderColor: p.accentColor + '99', background: p.accentColor + '18', boxShadow: `0 12px 40px ${p.accentColor}18` } : {}"
        >
          <!-- Badge -->
          <span
            v-if="userCurrentTier === p.tier"
            class="plan-badge absolute -top-2.5 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-400 text-black shadow-md"
          >
            Active Plan
          </span>
          <span
            v-else-if="p.badge"
            class="plan-badge absolute -top-2.5 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-black"
            :style="{ background: p.accentColor }"
          >
            {{ p.badge }}
          </span>

          <div>
            <div class="plan-emoji" :style="{ color: p.accentColor }">{{ p.emoji }}</div>
            <div class="text-[11px] xs:text-xs font-semibold text-white/75 mt-1 leading-tight">
              {{ p.name }}
            </div>
            <div class="text-[10px] font-bold uppercase tracking-wider" :style="{ color: p.accentColor }">
              {{ p.subtitle }}
            </div>
            <div class="plan-price font-bold text-white font-display">
              MWK {{ p.price.toLocaleString() }}
            </div>
          </div>
          <div class="text-[10px] text-white/50 mt-1.5 font-medium leading-tight">
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
          <Crown :size="18" />
          <span v-if="userCurrentTier === currentPlanData.tier">
            Extend {{ currentPlanData.subtitle }} — MWK {{ currentPlanData.price.toLocaleString() }}
          </span>
          <span v-else-if="isAlreadyActive">
            Switch to {{ currentPlanData.subtitle }} — MWK {{ currentPlanData.price.toLocaleString() }}
          </span>
          <span v-else>
            Get {{ currentPlanData.subtitle }} — MWK {{ currentPlanData.price.toLocaleString() }}
          </span>
        </button>

        <p v-if="isAlreadyActive && userCurrentTier === currentPlanData.tier" class="text-center text-xs text-amber-300/80 mt-2.5 font-medium">
          Your active {{ activeTierName }} pass is valid until {{ new Date(authStore.user.premiumUntil).toLocaleDateString(undefined, { dateStyle: 'long' }) }}
        </p>

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
      <p class="k-label mt-12 mb-3">Compare All Tiers</p>
      <div class="cmp-wrap">
        <div class="cmp">
          <div class="cmp-row cmp-head">
            <span class="cmp-label-col">Feature</span>
            <span>Free</span>
            <span class="text-sky-300">✦ Plus</span>
            <span class="text-amber-300 font-bold">★ Gold</span>
            <span class="text-purple-300 font-bold">💎 VIP</span>
          </div>
          <div v-for="(r, i) in compare" :key="i" class="cmp-row">
            <span class="cmp-label cmp-label-col">{{ r.label }}</span>
            <span class="cmp-val text-white/40">{{ r.free }}</span>
            <span class="cmp-val text-sky-200">{{ r.plus }}</span>
            <span class="cmp-val text-amber-300 font-semibold">{{ r.gold }}</span>
            <span class="cmp-val text-purple-300 font-semibold">{{ r.plat }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Elegant "Opening PayChangu Gateway" Modal —
         Mobile  : centered compact card
         Desktop : fills the full content area to the right of the 375px sidebar -->
    <div
      v-if="subscribing"
      class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md animate-in fade-in duration-200
             flex items-center justify-center p-4
             md:items-stretch md:justify-end md:p-0"
    >
      <!-- Sidebar spacer (desktop only) — pushes modal out of the nav area -->
      <div class="hidden md:block shrink-0" style="width: 320px;"></div>

      <!-- Modal card -->
      <div
        class="relative bg-neutral-900 border border-white/15 shadow-2xl overflow-hidden text-white
               w-full max-w-sm rounded-3xl
               md:max-w-none md:flex-1 md:rounded-none md:border-l md:border-t-0 md:border-r-0 md:border-b-0"
      >
        <!-- Ambient glow -->
        <div
          class="absolute -top-16 -right-16 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          :style="{ background: currentPlanData.accentColor || '#f59e0b' }"
        ></div>

        <!-- ======= Inner Layout: 2-column on desktop ======= -->
        <div class="relative z-10 grid grid-cols-1 md:grid-cols-12 md:divide-x md:divide-white/10 h-full md:h-full">

          <!-- ── Left Column (Desktop Only) ── Plan details & perks -->
          <div class="hidden md:flex md:col-span-5 flex-col justify-between p-8 lg:p-10 bg-white/[0.02]">
            <div>
              <!-- Tier badge row -->
              <div class="flex items-center gap-2.5 mb-4">
                <span
                  class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest"
                  style="color:#050d12"
                  :style="{ background: currentPlanData.accentColor || '#f59e0b' }"
                >
                  {{ currentPlanData.badge || 'Recommended' }}
                </span>
                <span class="text-xs text-white/45 font-medium">Subscription Summary</span>
              </div>

              <!-- Plan name & headline -->
              <div class="mb-1">
                <h3 class="text-3xl font-bold font-serif text-white tracking-tight">
                  Kondani <span :style="{ color: currentPlanData.accentColor }">{{ currentPlanData.subtitle }}</span>
                </h3>
                <p class="text-sm text-white/50 mt-0.5">
                  {{ currentPlanData.name }} Membership
                </p>
              </div>
              <p class="text-sm text-white/65 mb-7 mt-3 leading-relaxed max-w-xs">
                {{ currentPlanData.headline }}
              </p>

              <!-- Included perks list -->
              <div class="space-y-3">
                <div
                  v-for="(feat, idx) in currentPlanData.features.filter(f => f.included)"
                  :key="idx"
                  class="flex items-start gap-3 text-sm"
                >
                  <div
                    class="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    :style="{ background: `${currentPlanData.accentColor || '#f59e0b'}22`, color: currentPlanData.accentColor || '#f59e0b' }"
                  >
                    <Check :size="12" class="stroke-[2.5]" />
                  </div>
                  <span
                    :class="feat.highlight ? 'text-white font-semibold' : 'text-white/75'"
                  >{{ feat.text }}</span>
                </div>
              </div>
            </div>

            <!-- Price breakdown card -->
            <div class="mt-8 border border-white/10 rounded-2xl p-5 bg-white/[0.03] space-y-3">
              <div class="flex justify-between text-sm text-white/55">
                <span>Access Period</span>
                <span class="text-white font-medium">{{ currentPlanData.duration }} Days</span>
              </div>
              <div class="flex justify-between text-sm text-white/55">
                <span>Gateway Fee</span>
                <span class="text-emerald-400 font-medium">Free (0 MWK)</span>
              </div>
              <div class="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <span class="text-sm font-semibold text-white/80">Total Due Today</span>
                <span class="text-2xl font-bold font-display" :style="{ color: currentPlanData.accentColor || '#f59e0b' }">
                  MWK {{ currentPlanData.price.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

          <!-- ── Right Column: Gateway connection & actions ── -->
          <div
            class="col-span-1 md:col-span-7 flex flex-col items-center justify-between
                   p-6 sm:p-8 md:p-10 lg:p-14 text-center"
          >
            <div class="w-full">
              <!-- Spinning gateway ring + shield icon -->
              <div class="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <div
                  class="absolute inset-0 rounded-full border-[3px] border-t-transparent animate-spin"
                  :style="{ borderColor: `${currentPlanData.accentColor || '#f59e0b'} transparent ${currentPlanData.accentColor || '#f59e0b'} ${currentPlanData.accentColor || '#f59e0b'}` }"
                ></div>
                <div
                  class="w-16 h-16 rounded-full flex items-center justify-center border-2"
                  :style="{
                    background: `${currentPlanData.accentColor || '#f59e0b'}18`,
                    borderColor: `${currentPlanData.accentColor || '#f59e0b'}55`,
                    color: currentPlanData.accentColor || '#f59e0b'
                  }"
                >
                  <ShieldCheck :size="30" />
                </div>
              </div>

              <!-- Mobile-only tier badge -->
              <div
                class="inline-flex md:hidden items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                :style="{ background: `${currentPlanData.accentColor || '#f59e0b'}18`, color: currentPlanData.accentColor || '#f59e0b' }"
              >
                {{ currentPlanData.name }} · {{ currentPlanData.subtitle }}
              </div>

              <h3 class="text-2xl md:text-3xl font-bold text-white mb-2 font-display">Opening PayChangu</h3>
              <p class="text-sm text-white/60 max-w-sm mx-auto mb-7 leading-relaxed">
                Securing your encrypted session… You'll be redirected to complete payment with Airtel Money, TNM Mpamba, or Card.
              </p>

              <!-- Summary pill -->
              <div
                class="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between
                       max-w-sm mx-auto w-full"
              >
                <div class="text-left">
                  <div class="text-[11px] text-white/45 mb-0.5">Total to Pay</div>
                  <div class="text-xl font-bold text-white font-display">MWK {{ currentPlanData.price.toLocaleString() }}</div>
                </div>
                <div class="text-right">
                  <div class="text-[11px] text-white/45 mb-0.5">Access Period</div>
                  <div class="text-sm font-semibold text-white/80">{{ currentPlanData.duration }} Days</div>
                </div>
              </div>

              <!-- Payment channel badges -->
              <div class="flex items-center justify-center flex-wrap gap-2 mb-6">
                <div class="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/75">
                  <Smartphone :size="14" class="text-red-400" />
                  <span>Airtel Money</span>
                </div>
                <div class="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/75">
                  <Smartphone :size="14" class="text-emerald-400" />
                  <span>TNM Mpamba</span>
                </div>
                <div class="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/75">
                  <CreditCard :size="14" class="text-sky-400" />
                  <span>Visa / Mastercard</span>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="max-w-xs mx-auto mb-2">
                <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full animate-pulse"
                    :style="{ background: currentPlanData.btnGradient || currentPlanData.accentColor || '#f59e0b', width: '80%' }"
                  ></div>
                </div>
                <div class="flex items-center justify-center gap-1.5 text-[11px] text-white/35 mt-2">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>256-bit SSL Encrypted</span>
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="w-full max-w-sm mx-auto pt-5 border-t border-white/10 flex flex-col gap-3">
              <button
                v-if="pendingCheckoutUrl"
                type="button"
                @click="proceedToCheckout"
                class="k-btn w-full flex items-center justify-center gap-2 font-bold py-3.5 text-sm cursor-pointer"
                :style="{ background: currentPlanData.btnGradient || '#f59e0b', color: '#050d12' }"
              >
                <span>Continue to PayChangu</span>
                <ExternalLink :size="16" />
              </button>

              <button
                type="button"
                @click="subscribing = false"
                class="text-xs text-white/40 hover:text-white/75 transition-colors py-1 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Verification / Status Modal (ONLY when user returns from PayChangu) -->
    <div v-if="verifying" class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:pl-[360px] animate-in fade-in duration-200">
      <div class="bg-neutral-900 border border-amber-400/40 p-6 sm:p-8 rounded-3xl max-w-sm md:max-w-md w-full text-center shadow-2xl">
        <div class="w-14 h-14 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 class="text-lg font-bold text-white mb-2">Verifying Payment</h3>
        <p class="text-xs text-white/70 leading-relaxed mb-4">
          Checking your transaction status with PayChangu... Please keep this page open.
        </p>
        <button
          type="button"
          @click="cancelVerification"
          class="text-xs text-white/40 hover:text-white/80 transition-colors cursor-pointer"
        >
          Close and return
        </button>
      </div>
    </div>

    <!-- Celebratory Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:pl-[360px]">
      <div class="bg-neutral-900 border border-amber-400 p-6 sm:p-8 rounded-3xl max-w-sm md:max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-200">
        <div class="w-16 h-16 bg-amber-400/20 text-amber-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-400/50">
          <Crown :size="32" />
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Welcome to Kondani {{ activatedTierTitle }}!</h3>
        <p class="text-sm text-white/80 mb-6">
          Your payment was confirmed. Your perks are now unlocked instantly on your profile!
        </p>
        <button @click="closeSuccessModal" class="k-btn k-btn-gold w-full py-3.5 font-semibold cursor-pointer">
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
import { X, Crown, Check, Minus, Lock, BadgeCheck, Sparkles, ShieldCheck, Smartphone, CreditCard, ExternalLink } from 'lucide-vue-next'

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
const pendingCheckoutUrl = ref('')

const proceedToCheckout = () => {
  if (pendingCheckoutUrl.value) {
    window.location.href = pendingCheckoutUrl.value
  }
}

// 3 Differentiated Subscription Tiers
const availablePlans = [
  {
    id: '1_week',
    tier: 'plus',
    name: '1 Week',
    subtitle: 'Plus',
    emoji: '✦',
    price: 600,
    duration: 7,
    unitLabel: 'MWK 86/day',
    badge: 'Starter',
    accentColor: '#38bdf8', // sky cyan
    btnGradient: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
    headline: 'Essential boost: Unlimited likes and rewinds for 7 days.',
    features: [
      { text: 'See who likes you — full profiles revealed', included: true, highlight: true },
      { text: 'Unlimited likes every day', included: true },
      { text: 'Rewind accidental left-swipes', included: true },
      { text: '2 Super Likes every day', included: true },
      { text: 'Exclusive Plus badge on profile', included: true },
      { text: 'Monthly profile boosts', included: false },
      { text: 'Priority Likes in swipe decks', included: false }
    ]
  },
  {
    id: '1_month',
    tier: 'gold',
    name: '1 Month',
    subtitle: 'Gold',
    emoji: '★',
    price: 2400,
    duration: 30,
    unitLabel: 'MWK 80/day',
    badge: 'Popular',
    accentColor: '#f59e0b', // warm gold
    btnGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    headline: 'Our #1 choice: See who likes you, 5 Super Likes, and 1 monthly Boost.',
    features: [
      { text: 'See who likes you — full profiles revealed', included: true, highlight: true },
      { text: 'Unlimited likes every day', included: true },
      { text: '5 Super Likes every day', included: true },
      { text: '1 Monthly Profile Boost (10x views)', included: true },
      { text: 'Rewind accidental left-swipes', included: true },
      { text: 'Exclusive Gold Crown VIP badge on profile', included: true },
      { text: 'Priority Likes in swipe decks', included: false }
    ]
  },
  {
    id: '1_year',
    tier: 'platinum',
    name: '1 Year',
    subtitle: 'VIP',
    emoji: '💎',
    price: 6000,
    duration: 365,
    unitLabel: 'Save > 75%',
    badge: 'Best Value',
    accentColor: '#c084fc', // purple / platinum
    btnGradient: 'linear-gradient(135deg, #c084fc, #9333ea)',
    headline: 'Maximum advantage: Priority matching, 3 boosts, and 10 Super Likes a day.',
    features: [
      { text: 'Priority Likes — your profile seen first', included: true, highlight: true },
      { text: 'See who likes you — full profiles revealed', included: true },
      { text: 'Unlimited likes every day', included: true },
      { text: '10 Super Likes every day', included: true },
      { text: '3 Monthly Profile Boosts (10x views)', included: true },
      { text: 'Rewind accidental left-swipes', included: true },
      { text: 'Exclusive 💎 VIP Platinum Diamond badge', included: true }
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

const userCurrentTier = computed(() => {
  if (!isAlreadyActive.value) return 'free'
  return authStore.user?.subscriptionTier || 'gold'
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
 * Handle checkout button click: triggers the beautiful gateway modal & redirects
 */
const handleSubscribe = async () => {
  if (subscribing.value) return
  subscribing.value = true
  pendingCheckoutUrl.value = ''

  try {
    const result = await subscriptionService.initiatePayment(selectedPlan.value)

    if (result.success && result.checkoutUrl) {
      pendingCheckoutUrl.value = result.checkoutUrl
      if (result.referenceId) {
        sessionStorage.setItem('pending_payment_ref', result.referenceId)
      }
      // Smooth brief pause so user sees the connecting modal before navigating
      setTimeout(() => {
        if (subscribing.value) {
          window.location.href = result.checkoutUrl
        }
      }, 900)
    } else {
      subscribing.value = false
      error(result.error || 'Could not initiate payment. Please try again.')
    }
  } catch (err) {
    subscribing.value = false
    console.error('Subscription initiate error:', err)
    error(err.response?.data?.error || err.message || 'Payment initiation failed')
  }
}

/**
 * Cancel verification modal
 */
const cancelVerification = () => {
  verifying.value = false
  sessionStorage.removeItem('pending_payment_ref')
  router.replace({ path: route.path, query: {} })
}

/**
 * Close success modal and return to matches
 */
const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/app')
}

/**
 * On mount: ONLY check if returning from PayChangu with ?tx_ref=... or ?status=...
 */
onMounted(async () => {
  // Check if we arrived from PayChangu redirect via query params
  const hasGatewayQuery = Boolean(route.query.tx_ref || route.query.ref || route.query.status)

  // If the user is just visiting the page normally, NEVER show "Verifying Payment"
  if (!hasGatewayQuery) {
    sessionStorage.removeItem('pending_payment_ref')
    verifying.value = false
    return
  }

  const statusParam = route.query.status
  if (statusParam === 'cancelled') {
    sessionStorage.removeItem('pending_payment_ref')
    error('Payment was cancelled.')
    router.replace({ path: route.path, query: {} })
    return
  }

  const ref = route.query.tx_ref || route.query.ref || sessionStorage.getItem('pending_payment_ref')
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
.hero { position: relative; height: 240px; overflow: hidden; margin-top: -64px; }
.hero img { width: 100%; height: 100%; object-fit: cover; object-position: center 30%; }
.hero-scrim { position: absolute; inset: 0; background:
  radial-gradient(circle at 50% 30%, rgba(244,183,64,.28), transparent 60%),
  linear-gradient(180deg, rgba(5,13,18,.55) 0%, rgba(5,13,18,.5) 35%, var(--k-night) 96%); }
.hero-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; padding: 0 20px 24px; }
.hero-content h1 { font-size: clamp(1.55rem, 5vw, 2.8rem); line-height: 1.1; }
.hero-content p { color: rgba(255,255,255,.75); margin-top: 8px; max-width: 520px; font-size: 13px; }
.eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  color: var(--k-gold-l); background: rgba(5,13,18,.5); border: 1px solid rgba(244,183,64,.4); padding: 5px 12px; border-radius: 99px; backdrop-filter: blur(6px); }

/* plan grid */
.plan-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.plan-card { padding: 12px 10px 10px; border-radius: 18px; border: 1px solid; transition: transform .15s, box-shadow .15s; }
.plan-card.selected { transform: scale(1.025); }
.plan-emoji { font-size: 18px; line-height: 1; }
.plan-price { font-size: 1rem; font-weight: 800; margin-top: 6px; }

/* price card */
.price-card { position: relative; padding: 20px; border-radius: 20px; border: 1px solid rgba(244,183,64,.45);
  background: linear-gradient(160deg, rgba(255,255,255,.05), var(--k-card) 60%); }
.price { font-family: 'Fraunces', serif; font-weight: 600; font-size: 2.1rem; line-height: 1; }
.incl { list-style: none; margin: 14px 0; padding: 14px 0; border-top: 1px solid var(--k-line); border-bottom: 1px solid var(--k-line); display: flex; flex-direction: column; gap: 10px; }
.incl li { display: flex; align-items: center; gap: 10px; font-size: 13.5px; }

/* comparison table — scrollable container on mobile */
.cmp-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border: 1px solid var(--k-line); border-radius: 16px; }
.cmp { min-width: 480px; background: var(--k-card); }
.cmp-row { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1.1fr 1.1fr; align-items: center; padding: 11px 14px; border-bottom: 1px solid var(--k-line); font-size: 12.5px; }
.cmp-row:last-child { border-bottom: none; }
.cmp-head { background: rgba(255,255,255,.04); }
.cmp-head span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--k-mut2); text-align: center; }
.cmp-head .cmp-label-col { text-align: left; }
.cmp-label-col { position: sticky; left: 0; background: var(--k-card); z-index: 2; padding-right: 8px; }
.cmp-head .cmp-label-col { background: rgba(255,255,255,.04); }
.cmp-label { font-size: 12.5px; color: var(--k-txt); }
.cmp-val { font-size: 12px; text-align: center; display: flex; align-items: center; justify-content: center; }

@media (max-width: 420px) {
  .hero { height: 210px; }
  .plan-price { font-size: 0.9rem; }
  .plan-card { padding: 10px 8px 8px; border-radius: 14px; }
  .plan-emoji { font-size: 16px; }
  .price { font-size: 1.8rem; }
  .incl li { font-size: 13px; }
}
</style>
