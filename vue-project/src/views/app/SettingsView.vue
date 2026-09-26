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
          <div class="k-row" style="cursor: pointer" @click="showDistrictModal = true">
            <div class="k-row-ic"><MapPin :size="16" /></div>
            <div class="grow">
              <div class="t">District / Location</div>
              <div class="d">{{ district || 'Select your district' }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button @click.stop="useDeviceLocation" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-gold-300 flex items-center gap-1 transition-all" :disabled="locating">
                <MapPin :size="12" />
                <span>{{ locating ? 'Locating…' : 'Use GPS' }}</span>
              </button>
              <ChevronRight :size="16" class="text-white/40" />
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
    </div>

    <!-- Very bottom page footer -->
    <footer class="mt-16 pt-8 pb-14 text-center border-t border-white/5">
      <p class="text-white/30 text-xs font-medium tracking-wider">© octotechglobal</p>
    </footer>

    <!-- District Selection Modal -->
    <div v-if="showDistrictModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" @click.self="showDistrictModal = false">
      <div class="k-card w-full max-w-sm max-h-[80vh] flex flex-col p-5 bg-[#0b1720] border border-white/15 rounded-2xl shadow-2xl">
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div class="flex items-center gap-2">
            <MapPin :size="18" class="text-gold-400" />
            <h3 class="font-bold text-white text-base">Select Your District</h3>
          </div>
          <button @click="showDistrictModal = false" class="p-1 rounded-lg text-white/60 hover:text-white bg-white/5">
            <X :size="18" />
          </button>
        </div>
        <div class="overflow-y-auto py-2 my-2 space-y-1 flex-1 pr-1">
          <button
            v-for="d in malawiDistricts"
            :key="d.name"
            @click="selectDistrict(d)"
            class="w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between"
            :class="district === d.name ? 'bg-gold-500/20 text-gold-300 font-bold border border-gold-400/40' : 'text-white/80 hover:bg-white/5'"
          >
            <span>{{ d.name }}</span>
            <span v-if="district === d.name" class="text-xs text-gold-300">Selected</span>
          </button>
        </div>
      </div>
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
  FileText, LogOut, Trash2, ChevronRight, Zap, X
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
// District & GPS Location Handling
const showDistrictModal = ref(false)
const locating = ref(false)
const malawiDistricts = [
  { name: 'Chitipa', lon: 33.27, lat: -9.70 }, { name: 'Karonga', lon: 33.93, lat: -9.93 },
  { name: 'Rumphi', lon: 33.86, lat: -11.02 }, { name: 'Nkhata Bay', lon: 34.30, lat: -11.60 },
  { name: 'Mzimba', lon: 33.60, lat: -11.90 }, { name: 'Mzuzu', lon: 34.02, lat: -11.46 },
  { name: 'Likoma', lon: 34.73, lat: -12.07 }, { name: 'Kasungu', lon: 33.48, lat: -13.03 },
  { name: 'Nkhotakota', lon: 34.30, lat: -12.92 }, { name: 'Ntchisi', lon: 34.00, lat: -13.37 },
  { name: 'Dowa', lon: 33.93, lat: -13.65 }, { name: 'Salima', lon: 34.46, lat: -13.78 },
  { name: 'Lilongwe', lon: 33.78, lat: -13.98 }, { name: 'Mchinji', lon: 32.88, lat: -13.80 },
  { name: 'Dedza', lon: 34.33, lat: -14.38 }, { name: 'Ntcheu', lon: 34.64, lat: -14.82 },
  { name: 'Mangochi', lon: 35.27, lat: -14.48 }, { name: 'Balaka', lon: 34.96, lat: -14.98 },
  { name: 'Machinga', lon: 35.30, lat: -15.17 }, { name: 'Zomba', lon: 35.32, lat: -15.39 },
  { name: 'Neno', lon: 34.65, lat: -15.40 }, { name: 'Mwanza', lon: 34.52, lat: -15.60 },
  { name: 'Blantyre', lon: 35.01, lat: -15.79 }, { name: 'Chiradzulu', lon: 35.18, lat: -15.70 },
  { name: 'Phalombe', lon: 35.65, lat: -15.80 }, { name: 'Mulanje', lon: 35.50, lat: -16.03 },
  { name: 'Thyolo', lon: 35.14, lat: -16.07 }, { name: 'Chikwawa', lon: 34.80, lat: -16.03 },
  { name: 'Nsanje', lon: 35.26, lat: -16.92 }
]

const selectDistrict = async (d) => {
  showDistrictModal.value = false
  try {
    await authStore.updateUserProfile({
      district: d.name,
      location: { type: 'Point', coordinates: [d.lon, d.lat] }
    })
    success(`Location updated to ${d.name}`)
  } catch (e) {
    toastError('Could not update district')
  }
}

const findNearestDistrict = (lat, lon) => {
  let best = malawiDistricts[0], min = Infinity
  for (const d of malawiDistricts) {
    const dist = Math.hypot(d.lat - lat, d.lon - lon)
    if (dist < min) { min = dist; best = d }
  }
  return best
}

const useDeviceLocation = () => {
  if (!navigator.geolocation) {
    toastError('Geolocation is not supported by your browser')
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const coords = [pos.coords.longitude, pos.coords.latitude]
        const nearest = findNearestDistrict(pos.coords.latitude, pos.coords.longitude)
        await authStore.updateUserProfile({
          district: nearest.name,
          location: { type: 'Point', coordinates: coords }
        })
        success(`Location updated: ${nearest.name}`)
      } catch (err) {
        toastError('Failed to save location coordinates')
      } finally {
        locating.value = false
      }
    },
    (err) => {
      locating.value = false
      toastError('Could not get GPS position. Please pick your district.')
    },
    { enableHighAccuracy: true, timeout: 12000 }
  )
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
