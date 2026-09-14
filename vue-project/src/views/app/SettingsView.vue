<template>
  <div class="settings k-page pb-28 relative">
    <div class="k-stars"></div>

    <!-- Header -->
    <div class="sticky top-0 z-20 bg-night-950/90 backdrop-blur-md border-b border-white/5">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
        <button @click="router.back()" class="k-iconbtn"><ArrowLeft :size="20" /></button>
        <h1 class="k-title" style="font-size:1.7rem">Settings</h1>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 py-6 relative z-10 settings-grid">

      <!-- Account -->
      <section>
        <p class="k-label mb-3">Account</p>
        <div class="k-card overflow-hidden">
          <div class="k-row">
            <div class="k-row-ic"><Smartphone :size="16" /></div>
            <div class="grow">
              <div class="t">Phone number</div>
              <div class="d">Your login &amp; identity</div>
            </div>
            <div class="val">{{ maskedPhone }}</div>
          </div>
          <div class="k-row cursor-pointer" @click="router.push('/profile')">
            <div class="k-row-ic"><UserPen :size="16" /></div>
            <div class="grow">
              <div class="t">Edit profile</div>
              <div class="d">Photos, bio, prompts</div>
            </div>
            <ChevronRight :size="18" class="text-white/30" />
          </div>
        </div>
      </section>

      <!-- Membership (Dynamic: updates when user subscribes to Free, Plus, Gold, or VIP) -->
      <section>
        <p class="k-label mb-3">Membership</p>
        
        <!-- FREE TIER -->
        <div v-if="currentTier === 'free'" class="k-card flex items-center gap-4" style="padding:18px;border-color:rgba(244,183,64,.3);background:linear-gradient(135deg,rgba(244,183,64,.08),var(--k-card))">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(244,183,64,.14);color:var(--k-gold)">
            <Crown :size="20" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gold-300">You're on Free</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60 uppercase">Free</span>
            </div>
            <div class="text-xs text-white/55 mt-0.5 truncate">Plans from MWK 600 — see who likes you, unlimited likes &amp; boosts.</div>
          </div>
          <button class="k-btn k-btn-gold whitespace-nowrap" style="padding:9px 18px;font-size:13px" @click="router.push('/premium')">
            Upgrade
          </button>
        </div>

        <!-- PLUS TIER -->
        <div v-else-if="currentTier === 'plus'" class="k-card flex items-center gap-4" style="padding:18px;border-color:rgba(45,212,191,.4);background:linear-gradient(135deg,rgba(45,212,191,.1),var(--k-card))">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(45,212,191,.18);color:var(--k-lagoon)">
            <Zap :size="20" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-lagoon-300">Kondani Plus</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lagoon-400/20 text-lagoon-300 uppercase">Active</span>
            </div>
            <div class="text-xs text-white/65 mt-0.5">
              {{ formattedExpiry ? `Active until ${formattedExpiry}` : 'Unlimited likes & 2 Super Likes/day' }}
            </div>
          </div>
          <button class="k-btn k-btn-gold whitespace-nowrap" style="padding:9px 16px;font-size:13px" @click="router.push('/premium')">
            Upgrade
          </button>
        </div>

        <!-- GOLD TIER -->
        <div v-else-if="currentTier === 'gold'" class="k-card flex items-center gap-4" style="padding:18px;border-color:rgba(244,183,64,.5);background:linear-gradient(135deg,rgba(244,183,64,.15),var(--k-card))">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(244,183,64,.2);color:var(--k-gold)">
            <Crown :size="20" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gold-200">Kondani Gold</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-400/25 text-gold-300 uppercase">Active</span>
            </div>
            <div class="text-xs text-white/65 mt-0.5">
              {{ formattedExpiry ? `Active until ${formattedExpiry}` : 'See who likes you & unlimited likes' }}
            </div>
          </div>
          <button class="k-btn whitespace-nowrap bg-white/10 hover:bg-white/15 text-white font-semibold" style="padding:9px 16px;font-size:13px;border-radius:12px" @click="router.push('/premium')">
            Manage
          </button>
        </div>

        <!-- PLATINUM / VIP TIER -->
        <div v-else-if="currentTier === 'platinum'" class="k-card flex items-center gap-4" style="padding:18px;border-color:rgba(192,132,252,.5);background:linear-gradient(135deg,rgba(192,132,252,.15),var(--k-card))">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(192,132,252,.2);color:#c084fc">
            <Sparkles :size="20" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-purple-200">Kondani VIP (Platinum)</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-400/25 text-purple-300 uppercase">VIP Active</span>
            </div>
            <div class="text-xs text-white/65 mt-0.5">
              {{ formattedExpiry ? `Active until ${formattedExpiry}` : 'Priority likes, VIP status & 3 boosts/mo' }}
            </div>
          </div>
          <button class="k-btn whitespace-nowrap bg-white/10 hover:bg-white/15 text-white font-semibold" style="padding:9px 16px;font-size:13px;border-radius:12px" @click="router.push('/premium')">
            Manage
          </button>
        </div>
      </section>

      <!-- Discovery -->
      <section>
        <p class="k-label mb-3">Discovery</p>
        <div class="k-card overflow-hidden">
          <div class="k-row">
            <div class="k-row-ic"><MapPin :size="16" /></div>
            <div class="grow">
              <div class="t">Location</div>
              <div class="d">{{ district || 'Set your location' }}</div>
            </div>
          </div>
          
          <!-- Maximum distance slider -->
          <div style="padding:14px 18px;border-bottom:1px solid var(--k-line)">
            <div class="flex justify-between mb-3">
              <span class="text-sm font-medium">Maximum distance</span>
              <span class="text-sm font-semibold text-gold-300">{{ prefs.distance }} km</span>
            </div>
            <input type="range" min="1" max="200" v-model.number="prefs.distance" class="k-range" />
          </div>

          <!-- Minimum and Maximum age sliders -->
          <div style="padding:14px 18px;border-bottom:1px solid var(--k-line)">
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium">Minimum age</span>
              <span class="text-sm font-semibold text-gold-300">{{ prefs.ageMin }}</span>
            </div>
            <input type="range" min="18" max="70" v-model.number="prefs.ageMin" @input="onAgeMinChange" class="k-range mb-4" />
            
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium">Maximum age</span>
              <span class="text-sm font-semibold text-gold-300">{{ prefs.ageMax }}</span>
            </div>
            <input type="range" min="18" max="80" v-model.number="prefs.ageMax" @input="onAgeMaxChange" class="k-range" />
          </div>

          <!-- Show me (Gender selection) -->
          <div class="k-row">
            <div class="k-row-ic"><Users :size="16" /></div>
            <div class="grow"><div class="t">Show me</div></div>
            <div class="flex gap-1.5">
              <button
                v-for="g in genders"
                :key="g.v"
                @click="prefs.gender = g.v"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                :class="prefs.gender === g.v ? 'bg-gold-500 text-night-950 font-bold shadow' : 'bg-white/5 text-white/60 hover:text-white'"
              >
                {{ g.label }}
              </button>
            </div>
          </div>

          <!-- Verified profiles only toggle -->
          <div class="k-row">
            <div class="k-row-ic"><BadgeCheck :size="16" /></div>
            <div class="grow">
              <div class="t">Verified profiles only</div>
              <div class="d">{{ prefs.verifiedOnly ? 'Only showing badge-verified users' : 'Showing all profiles' }}</div>
            </div>
            <button
              class="k-toggle cursor-pointer"
              :class="prefs.verifiedOnly ? 'on' : ''"
              @click="prefs.verifiedOnly = !prefs.verifiedOnly"
            >
              <span class="knob"></span>
            </button>
          </div>
        </div>

        <button
          class="k-btn k-btn-gold w-full mt-3 cursor-pointer"
          style="padding:13px"
          :disabled="saving"
          @click="saveDiscovery"
        >
          {{ saving ? 'Saving…' : 'Save discovery settings' }}
        </button>
      </section>

      <!-- Notifications -->
      <section>
        <p class="k-label mb-3">Notifications</p>
        <div class="k-card overflow-hidden">
          <div class="k-row">
            <div class="k-row-ic"><Sparkles :size="16" /></div>
            <div class="grow">
              <div class="t">New matches</div>
              <div class="d">When someone likes you back</div>
            </div>
            <button class="k-toggle cursor-pointer" :class="notif.matches ? 'on' : ''" @click="toggleNotif('matches')">
              <span class="knob"></span>
            </button>
          </div>
          
          <div class="k-row">
            <div class="k-row-ic"><MessageCircle :size="16" /></div>
            <div class="grow">
              <div class="t">Messages</div>
              <div class="d">When you receive a new chat message</div>
            </div>
            <button class="k-toggle cursor-pointer" :class="notif.messages ? 'on' : ''" @click="toggleNotif('messages')">
              <span class="knob"></span>
            </button>
          </div>

          <div class="k-row">
            <div class="k-row-ic"><Heart :size="16" /></div>
            <div class="grow">
              <div class="t">Likes</div>
              <div class="d">When someone likes your profile</div>
            </div>
            <button class="k-toggle cursor-pointer" :class="notif.likes ? 'on' : ''" @click="toggleNotif('likes')">
              <span class="knob"></span>
            </button>
          </div>

          <div class="k-row">
            <div class="k-row-ic"><Star :size="16" /></div>
            <div class="grow">
              <div class="t">Daily picks reminder</div>
              <div class="d">Daily notification for fresh curated picks</div>
            </div>
            <button class="k-toggle cursor-pointer" :class="notif.picks ? 'on' : ''" @click="toggleNotif('picks')">
              <span class="knob"></span>
            </button>
          </div>
        </div>
      </section>

      <!-- Privacy & safety -->
      <section>
        <p class="k-label mb-3">Privacy &amp; safety</p>
        <div class="k-card overflow-hidden">
          <div class="k-row">
            <div class="k-row-ic"><Eye :size="16" /></div>
            <div class="grow">
              <div class="t">Profile visibility</div>
              <div class="d">{{ isVisible ? 'Visible to nearby users' : 'Hidden from everyone' }}</div>
            </div>
            <button class="k-toggle cursor-pointer" :class="isVisible ? 'on' : ''" @click="toggleVisibility">
              <span class="knob"></span>
            </button>
          </div>

          <div class="k-row">
            <div class="k-row-ic"><CircleDot :size="16" /></div>
            <div class="grow">
              <div class="t">Show online status</div>
              <div class="d">{{ priv.online ? 'Visible when you are active' : 'Hidden from everyone' }}</div>
            </div>
            <button class="k-toggle cursor-pointer" :class="priv.online ? 'on' : ''" @click="toggleOnlineStatus">
              <span class="knob"></span>
            </button>
          </div>

          <div class="k-row">
            <div class="k-row-ic"><CheckCheck :size="16" /></div>
            <div class="grow">
              <div class="t">Read receipts</div>
              <div class="d">{{ priv.receipts ? 'Let matches see when you’ve read messages' : 'Read receipts hidden' }}</div>
            </div>
            <button class="k-toggle cursor-pointer" :class="priv.receipts ? 'on' : ''" @click="toggleReadReceipts">
              <span class="knob"></span>
            </button>
          </div>

          <div class="k-row cursor-pointer" @click="router.push('/safety')">
            <div class="k-row-ic"><Shield :size="16" /></div>
            <div class="grow"><div class="t">Safety center</div></div>
            <ChevronRight :size="18" class="text-white/30" />
          </div>
        </div>
      </section>

      <!-- Support -->
      <section>
        <p class="k-label mb-3">Support</p>
        <div class="k-card overflow-hidden">
          <div class="k-row cursor-pointer" @click="router.push('/support')">
            <div class="k-row-ic"><LifeBuoy :size="16" /></div>
            <div class="grow"><div class="t">Help center</div></div>
            <ChevronRight :size="18" class="text-white/30" />
          </div>
          <div class="k-row cursor-pointer" @click="router.push('/safety-center')">
            <div class="k-row-ic"><ScrollText :size="16" /></div>
            <div class="grow"><div class="t">Community guidelines</div></div>
            <ChevronRight :size="18" class="text-white/30" />
          </div>
          <div class="k-row cursor-pointer" @click="router.push('/privacy')">
            <div class="k-row-ic"><FileText :size="16" /></div>
            <div class="grow"><div class="t">Terms &amp; Privacy</div></div>
            <ChevronRight :size="18" class="text-white/30" />
          </div>
        </div>
      </section>

      <!-- Account actions -->
      <section>
        <p class="k-label mb-3">Account actions</p>
        <div class="k-card overflow-hidden">
          <div class="k-row cursor-pointer" @click="handleLogout">
            <div class="k-row-ic"><LogOut :size="16" /></div>
            <div class="grow"><div class="t">Sign out</div></div>
            <ChevronRight :size="18" class="text-white/30" />
          </div>
          <div class="k-row cursor-pointer" @click="confirmDelete">
            <div class="k-row-ic" style="color:var(--k-coral)"><Trash2 :size="16" /></div>
            <div class="grow">
              <div class="t" style="color:var(--k-coral)">Delete account</div>
              <div class="d">Permanent — this can't be undone</div>
            </div>
            <ChevronRight :size="18" class="text-white/30" />
          </div>
        </div>
      </section>

      <p class="text-center text-white/30 text-xs settings-foot">Kondani v1.0 · Made in Malawi 🇲🇼</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import {
  ArrowLeft, Smartphone, UserPen, MapPin, Users, BadgeCheck, Sparkles, MessageCircle,
  Heart, Star, Eye, CircleDot, CheckCheck, Shield, Crown, LifeBuoy, ScrollText,
  FileText, LogOut, Trash2, ChevronRight, Zap
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: toastError } = useToast()

const user = computed(() => authStore.user || {})

// Computed subscription tier
const isPremium = computed(() => {
  const u = user.value
  return Boolean(u?.isPremium && (!u.premiumUntil || new Date(u.premiumUntil) > new Date()))
})

const currentTier = computed(() => {
  if (!isPremium.value) return 'free'
  return user.value.subscriptionTier || 'gold'
})

const formattedExpiry = computed(() => {
  const pu = user.value.premiumUntil
  if (!pu) return ''
  try {
    const d = new Date(pu)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch (e) {
    return ''
  }
})

const district = computed(() => user.value.district || '')
const maskedPhone = computed(() => {
  const p = user.value.phoneNumber || ''
  return p ? p.slice(0, 7) + ' •• •• ' + p.slice(-2) : '—'
})

const genders = [
  { v: 'Everyone', label: 'Everyone' },
  { v: 'Male', label: 'Men' },
  { v: 'Female', label: 'Women' }
]

// Discovery Preferences
const prefs = reactive({
  distance: user.value.preferences?.distance ?? 100,
  ageMin: user.value.preferences?.ageMin ?? 18,
  ageMax: user.value.preferences?.ageMax ?? 60,
  gender: user.value.preferences?.gender ?? 'Everyone',
  verifiedOnly: user.value.preferences?.verifiedOnly ?? false
})

const onAgeMinChange = () => {
  if (prefs.ageMin > prefs.ageMax) {
    prefs.ageMax = prefs.ageMin
  }
}

const onAgeMaxChange = () => {
  if (prefs.ageMax < prefs.ageMin) {
    prefs.ageMin = prefs.ageMax
  }
}

// Notifications
const notif = reactive({
  matches: user.value.notifications?.matches !== false,
  messages: user.value.notifications?.messages !== false,
  likes: user.value.notifications?.likes !== false,
  picks: user.value.notifications?.picks !== false
})

// Privacy
const priv = reactive({
  online: user.value.showOnlineStatus !== false,
  receipts: user.value.readReceipts !== false
})
const isVisible = ref(user.value.isVisible !== false)
const saving = ref(false)

// Sync from backend profile
const syncUserData = (u) => {
  if (!u) return
  prefs.distance = u.preferences?.distance ?? 100
  prefs.ageMin = u.preferences?.ageMin ?? 18
  prefs.ageMax = u.preferences?.ageMax ?? 60

  const g = u.preferences?.gender
  if (g === 'Men') prefs.gender = 'Male'
  else if (g === 'Women') prefs.gender = 'Female'
  else prefs.gender = g ?? 'Everyone'

  prefs.verifiedOnly = Boolean(u.preferences?.verifiedOnly)

  priv.online = u.showOnlineStatus !== false
  priv.receipts = u.readReceipts !== false
  isVisible.value = u.isVisible !== false

  if (u.notifications) {
    notif.matches = u.notifications.matches !== false
    notif.messages = u.notifications.messages !== false
    notif.likes = u.notifications.likes !== false
    notif.picks = u.notifications.picks !== false
  }
}

onMounted(async () => {
  try {
    const profile = await authStore.fetchUser()
    if (profile) syncUserData(profile)
  } catch (e) {
    console.warn('Could not refresh profile on settings mount', e)
  }
})

// Save Discovery
const saveDiscovery = async () => {
  saving.value = true
  try {
    const res = await authStore.updateUserProfile({
      preferences: {
        distance: Number(prefs.distance),
        ageMin: Number(prefs.ageMin),
        ageMax: Number(prefs.ageMax),
        gender: prefs.gender,
        verifiedOnly: Boolean(prefs.verifiedOnly)
      }
    })
    if (res?.preferences) {
      prefs.distance = res.preferences.distance ?? prefs.distance
      prefs.ageMin = res.preferences.ageMin ?? prefs.ageMin
      prefs.ageMax = res.preferences.ageMax ?? prefs.ageMax
      const g = res.preferences.gender
      if (g === 'Men') prefs.gender = 'Male'
      else if (g === 'Women') prefs.gender = 'Female'
      else prefs.gender = g ?? 'Everyone'
      prefs.verifiedOnly = Boolean(res.preferences.verifiedOnly)
    }
    success('Discovery settings saved')
  } catch (e) {
    console.error('Failed to save discovery settings:', e)
    const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Could not save discovery settings'
    toastError(msg)
  } finally {
    saving.value = false
  }
}

// Toggle Online Status
const toggleOnlineStatus = async () => {
  const prev = priv.online
  priv.online = !priv.online
  try {
    await authStore.updateUserProfile({ showOnlineStatus: priv.online })
    success(priv.online ? 'Online status visible to matches' : 'Online status hidden')
  } catch (e) {
    priv.online = prev
    const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Could not update online status'
    toastError(msg)
  }
}

// Toggle Read Receipts
const toggleReadReceipts = async () => {
  const prev = priv.receipts
  priv.receipts = !priv.receipts
  try {
    await authStore.updateUserProfile({ readReceipts: priv.receipts })
    success(priv.receipts ? 'Read receipts enabled' : 'Read receipts hidden')
  } catch (e) {
    priv.receipts = prev
    const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Could not update read receipts'
    toastError(msg)
  }
}

// Toggle Visibility
const toggleVisibility = async () => {
  const prev = isVisible.value
  isVisible.value = !isVisible.value
  try {
    await authStore.updateUserProfile({ isVisible: isVisible.value })
    success(isVisible.value ? 'Profile is now visible in discovery' : 'Profile hidden from discovery')
  } catch (e) {
    isVisible.value = prev
    const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Could not update visibility'
    toastError(msg)
  }
}

// Toggle Notifications
const toggleNotif = async (key) => {
  notif[key] = !notif[key]
  try {
    await authStore.updateUserProfile({
      notifications: {
        matches: notif.matches,
        messages: notif.messages,
        likes: notif.likes,
        picks: notif.picks
      }
    })
    success('Notification preference saved')
  } catch (e) {
    notif[key] = !notif[key]
    const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Could not save notification preference'
    toastError(msg)
  }
}

const handleLogout = async () => {
  if (confirm('Sign out of Kondani?')) {
    await authStore.logout()
    router.push('/login')
  }
}

const confirmDelete = async () => {
  if (!confirm('Delete your account permanently? This cannot be undone.')) return
  if (!confirm('Last chance — this erases your profile, matches and chats for good. Continue?')) return
  try {
    await authStore.deleteAccount()
    router.push('/login')
  } catch (e) {
    toastError('Could not delete your account. Please try again.')
  }
}
</script>

<style scoped>
.settings { overflow-x: hidden; }

/* Sections pack into balanced columns on desktop (no ragged row gaps). */
.settings-grid > * { margin-bottom: 1.75rem; }
.settings-grid > *:last-child { margin-bottom: 0; }
@media (min-width: 768px) {
  .settings-grid { column-count: 2; column-gap: 1.75rem; }
  .settings-grid > * { break-inside: avoid; }
  .settings-foot { column-span: all; }
}
</style>
