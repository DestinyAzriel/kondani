<template>
  <div class="settings k-page pb-28 relative">
    <div class="k-stars"></div>

    <!-- Header -->
    <div class="sticky top-0 z-20 bg-night-950/90 backdrop-blur-md border-b border-white/5">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
        <button @click="router.back()" class="k-iconbtn"><ArrowLeft :size="20" /></button>
        <h1 class="k-title" style="font-size:1.7rem">Settings</h1>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-6 relative z-10 space-y-7">

      <!-- Account -->
      <section>
        <p class="k-label mb-3">Account</p>
        <div class="k-card overflow-hidden">
          <div class="k-row"><div class="k-row-ic"><Smartphone :size="16" /></div><div class="grow"><div class="t">Phone number</div><div class="d">Your login &amp; identity</div></div><div class="val">{{ maskedPhone }}</div></div>
          <div class="k-row cursor-pointer" @click="router.push('/profile')"><div class="k-row-ic"><UserPen :size="16" /></div><div class="grow"><div class="t">Edit profile</div><div class="d">Photos, bio, prompts</div></div><ChevronRight :size="18" class="text-white/30" /></div>
        </div>
      </section>

      <!-- Discovery -->
      <section>
        <p class="k-label mb-3">Discovery</p>
        <div class="k-card overflow-hidden">
          <div class="k-row"><div class="k-row-ic"><MapPin :size="16" /></div><div class="grow"><div class="t">Location</div><div class="d">{{ district || 'Set your location' }}</div></div></div>
          <div style="padding:14px 18px;border-bottom:1px solid var(--k-line)">
            <div class="flex justify-between mb-3"><span class="text-sm font-medium">Maximum distance</span><span class="text-sm font-semibold text-gold-300">{{ prefs.distance }} km</span></div>
            <input type="range" min="1" max="200" v-model.number="prefs.distance" class="k-range" />
          </div>
          <div style="padding:14px 18px;border-bottom:1px solid var(--k-line)">
            <div class="flex justify-between mb-2"><span class="text-sm font-medium">Minimum age</span><span class="text-sm font-semibold text-gold-300">{{ prefs.ageMin }}</span></div>
            <input type="range" min="18" max="70" v-model.number="prefs.ageMin" class="k-range mb-4" />
            <div class="flex justify-between mb-2"><span class="text-sm font-medium">Maximum age</span><span class="text-sm font-semibold text-gold-300">{{ prefs.ageMax }}</span></div>
            <input type="range" min="18" max="80" v-model.number="prefs.ageMax" class="k-range" />
          </div>
          <div class="k-row"><div class="k-row-ic"><Users :size="16" /></div><div class="grow"><div class="t">Show me</div></div>
            <div class="flex gap-1.5">
              <button v-for="g in genders" :key="g.v" @click="prefs.gender = g.v"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                :class="prefs.gender === g.v ? 'bg-gold-500 text-night-950' : 'bg-white/5 text-white/60'">{{ g.label }}</button>
            </div>
          </div>
          <div class="k-row"><div class="k-row-ic"><BadgeCheck :size="16" /></div><div class="grow"><div class="t">Verified profiles only</div></div>
            <button class="k-toggle" :class="prefs.verifiedOnly ? 'on' : ''" @click="prefs.verifiedOnly = !prefs.verifiedOnly"><span class="knob"></span></button>
          </div>
        </div>
        <button class="k-btn k-btn-gold w-full mt-3" style="padding:13px" :disabled="saving" @click="saveDiscovery">
          {{ saving ? 'Saving…' : 'Save discovery settings' }}
        </button>
      </section>

      <!-- Notifications -->
      <section>
        <p class="k-label mb-3">Notifications</p>
        <div class="k-card overflow-hidden">
          <div class="k-row"><div class="k-row-ic"><Sparkles :size="16" /></div><div class="grow"><div class="t">New matches</div></div><button class="k-toggle" :class="notif.matches?'on':''" @click="notif.matches=!notif.matches"><span class="knob"></span></button></div>
          <div class="k-row"><div class="k-row-ic"><MessageCircle :size="16" /></div><div class="grow"><div class="t">Messages</div></div><button class="k-toggle" :class="notif.messages?'on':''" @click="notif.messages=!notif.messages"><span class="knob"></span></button></div>
          <div class="k-row"><div class="k-row-ic"><Heart :size="16" /></div><div class="grow"><div class="t">Likes</div></div><button class="k-toggle" :class="notif.likes?'on':''" @click="notif.likes=!notif.likes"><span class="knob"></span></button></div>
          <div class="k-row"><div class="k-row-ic"><Star :size="16" /></div><div class="grow"><div class="t">Daily picks reminder</div></div><button class="k-toggle" :class="notif.picks?'on':''" @click="notif.picks=!notif.picks"><span class="knob"></span></button></div>
        </div>
      </section>

      <!-- Privacy & safety -->
      <section>
        <p class="k-label mb-3">Privacy &amp; safety</p>
        <div class="k-card overflow-hidden">
          <div class="k-row"><div class="k-row-ic"><Eye :size="16" /></div><div class="grow"><div class="t">Profile visibility</div><div class="d">{{ isVisible ? 'Visible to nearby users' : 'Hidden from everyone' }}</div></div><button class="k-toggle" :class="isVisible?'on':''" @click="toggleVisibility"><span class="knob"></span></button></div>
          <div class="k-row"><div class="k-row-ic"><CircleDot :size="16" /></div><div class="grow"><div class="t">Show online status</div></div><button class="k-toggle" :class="priv.online?'on':''" @click="priv.online=!priv.online"><span class="knob"></span></button></div>
          <div class="k-row"><div class="k-row-ic"><CheckCheck :size="16" /></div><div class="grow"><div class="t">Read receipts</div></div><button class="k-toggle" :class="priv.receipts?'on':''" @click="priv.receipts=!priv.receipts"><span class="knob"></span></button></div>
          <div class="k-row cursor-pointer" @click="router.push('/safety')"><div class="k-row-ic"><Shield :size="16" /></div><div class="grow"><div class="t">Safety center</div></div><ChevronRight :size="18" class="text-white/30" /></div>
        </div>
      </section>

      <!-- Membership -->
      <section v-if="!isPremium">
        <p class="k-label mb-3">Membership</p>
        <div class="k-card flex items-center gap-4" style="padding:18px;border-color:rgba(244,183,64,.3)">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center" style="background:rgba(244,183,64,.14);color:var(--k-gold)"><Crown :size="20" /></div>
          <div class="flex-1"><div class="font-semibold text-gold-300">You're on Free</div><div class="text-xs text-white/55 mt-0.5">Gold is just MWK 600/mo — see who likes you &amp; unlimited likes.</div></div>
          <button class="k-btn k-btn-gold" style="padding:9px 18px;font-size:13px" @click="router.push('/premium')">Upgrade</button>
        </div>
      </section>

      <!-- Support -->
      <section>
        <p class="k-label mb-3">Support</p>
        <div class="k-card overflow-hidden">
          <div class="k-row cursor-pointer" @click="router.push('/support')"><div class="k-row-ic"><LifeBuoy :size="16" /></div><div class="grow"><div class="t">Help center</div></div><ChevronRight :size="18" class="text-white/30" /></div>
          <div class="k-row cursor-pointer" @click="router.push('/safety-center')"><div class="k-row-ic"><ScrollText :size="16" /></div><div class="grow"><div class="t">Community guidelines</div></div><ChevronRight :size="18" class="text-white/30" /></div>
          <div class="k-row cursor-pointer" @click="router.push('/privacy')"><div class="k-row-ic"><FileText :size="16" /></div><div class="grow"><div class="t">Terms &amp; Privacy</div></div><ChevronRight :size="18" class="text-white/30" /></div>
        </div>
      </section>

      <!-- Account actions -->
      <section>
        <p class="k-label mb-3">Account actions</p>
        <div class="k-card overflow-hidden">
          <div class="k-row cursor-pointer" @click="handleLogout"><div class="k-row-ic"><LogOut :size="16" /></div><div class="grow"><div class="t">Sign out</div></div><ChevronRight :size="18" class="text-white/30" /></div>
          <div class="k-row cursor-pointer" @click="confirmDelete"><div class="k-row-ic" style="color:var(--k-coral)"><Trash2 :size="16" /></div><div class="grow"><div class="t" style="color:var(--k-coral)">Delete account</div><div class="d">Permanent — this can't be undone</div></div><ChevronRight :size="18" class="text-white/30" /></div>
        </div>
      </section>

      <p class="text-center text-white/30 text-xs">Kondani v1.0 · Made in Malawi 🇲🇼</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import {
  ArrowLeft, Smartphone, UserPen, MapPin, Users, BadgeCheck, Sparkles, MessageCircle,
  Heart, Star, Eye, CircleDot, CheckCheck, Shield, Crown, LifeBuoy, ScrollText,
  FileText, LogOut, Trash2, ChevronRight
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: toastError } = useToast()

const user = computed(() => authStore.user || {})
const isPremium = computed(() => !!user.value.isPremium)
const district = computed(() => user.value.district || '')
const maskedPhone = computed(() => {
  const p = user.value.phoneNumber || ''
  return p ? p.slice(0, 7) + ' •• •• ' + p.slice(-2) : '—'
})

const genders = [{ v: 'Everyone', label: 'Everyone' }, { v: 'Male', label: 'Men' }, { v: 'Female', label: 'Women' }]

const prefs = reactive({
  distance: user.value.preferences?.distance ?? 50,
  ageMin: user.value.preferences?.ageMin ?? 18,
  ageMax: user.value.preferences?.ageMax ?? 45,
  gender: user.value.preferences?.gender ?? 'Everyone',
  verifiedOnly: user.value.preferences?.verifiedOnly ?? false
})
const notif = reactive({ matches: true, messages: true, likes: true, picks: false })
const priv = reactive({ online: true, receipts: false })
const isVisible = ref(user.value.isVisible !== false)
const saving = ref(false)

const saveDiscovery = async () => {
  saving.value = true
  try {
    await authStore.updateUserProfile({ preferences: { ...prefs } })
    success('Discovery settings saved')
  } catch (e) {
    toastError('Could not save settings')
  } finally {
    saving.value = false
  }
}

const toggleVisibility = async () => {
  isVisible.value = !isVisible.value
  try { await authStore.updateUserProfile({ isVisible: isVisible.value }) }
  catch (e) { isVisible.value = !isVisible.value; toastError('Could not update visibility') }
}

const handleLogout = async () => {
  if (confirm('Sign out of Kondani?')) { await authStore.logout(); router.push('/login') }
}
const confirmDelete = () => {
  if (confirm('Delete your account permanently? This cannot be undone.')) {
    toastError('Account deletion is coming soon — contact support to delete now.')
  }
}
</script>

<style scoped>
.settings { overflow-x: hidden; }
</style>
