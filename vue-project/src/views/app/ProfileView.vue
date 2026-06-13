<template>
  <div class="min-h-screen bg-night-950 text-white relative overflow-hidden pb-28">
    <div class="stars fixed inset-0 pointer-events-none"></div>
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[45%] rounded-full blur-[120px]"
           style="background: radial-gradient(circle, rgba(45,212,191,.14), transparent 70%)"></div>
    </div>

    <!-- Header -->
    <div class="sticky top-0 z-40 bg-night-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold font-display">My Profile</h1>
        <p class="text-white/50 text-sm">{{ profile.isVisible !== false ? 'Visible to nearby users' : 'Profile hidden' }}</p>
      </div>
      <button @click="toggleEdit" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium border border-white/10 transition-all">
        {{ isEditing ? 'Done' : 'Edit' }}
      </button>
    </div>

    <div class="relative z-10 w-full max-w-[640px] mx-auto pt-6 px-4">
      <!-- Avatar -->
      <div class="flex justify-center mb-5">
        <div class="relative">
          <div class="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden bg-night-900 border-4 border-white/10 shadow-2xl">
            <img v-if="mainPhoto" :src="mainPhoto" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-white/30 text-6xl">✦</div>
          </div>
          <span v-if="profile.isVerified" class="absolute -bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-gradient-to-r from-gold-300 to-gold-500 text-night-950 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <CheckIcon size="12" class="stroke-[4]" /> Verified
          </span>
        </div>
      </div>

      <div class="text-center mb-7">
        <div class="flex items-baseline justify-center gap-2 mb-1">
          <h2 class="text-3xl font-extrabold font-display">{{ profile.name || 'Your name' }}</h2>
          <span v-if="profile.age" class="text-xl text-white/70">{{ profile.age }}</span>
        </div>
        <div class="flex items-center justify-center gap-1.5 text-lagoon-300 font-medium text-sm">
          <MapPinIcon size="15" /><span>{{ profile.district || 'Set your location' }}</span>
        </div>
      </div>

      <!-- Card -->
      <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-5 shadow-xl space-y-6">
        <!-- Photos (edit) -->
        <div v-if="isEditing">
          <h3 class="sec">Photos</h3>
          <PhotoUpload v-model="editForm.photos" :max-photos="6" />
        </div>

        <!-- Bio -->
        <div>
          <h3 class="sec">About</h3>
          <div v-if="isEditing">
            <textarea v-model="editForm.bio" rows="3" maxlength="500" class="ta" placeholder="Tell people what makes you unique…"></textarea>
            <div class="text-right text-xs text-white/40 mt-1">{{ editForm.bio?.length || 0 }}/500</div>
          </div>
          <p v-else class="text-white/90 leading-relaxed">{{ profile.bio || 'Add a bio to show your personality.' }}</p>
        </div>

        <!-- Interests -->
        <div>
          <h3 class="sec">Interests</h3>
          <div v-if="isEditing" class="space-y-3">
            <div class="flex gap-2">
              <input v-model="tempInterest" @keyup.enter="addInterest" class="inp flex-1" placeholder="Add interest…" />
              <button @click="addInterest" class="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-lg font-semibold">Add</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="(interest, i) in editForm.interests" :key="i" class="px-3 py-1.5 bg-white/10 rounded-full text-sm border border-white/15 flex items-center gap-2">
                {{ interest }} <button @click="editForm.interests.splice(i,1)" class="text-[#ff7a6b]">×</button>
              </span>
            </div>
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <span v-for="(interest, i) in profile.interests" :key="i" class="px-3 py-1.5 bg-white/10 rounded-full text-sm border border-white/10">{{ interest }}</span>
            <span v-if="!profile.interests?.length" class="text-white/50 text-sm italic">No interests yet.</span>
          </div>
        </div>

        <!-- Completeness -->
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-white/70 text-sm font-medium">Profile completeness</span>
            <span class="text-gold-400 font-bold">{{ completeness }}%</span>
          </div>
          <div class="h-2 bg-white/15 rounded-full overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-500" :style="{ width: `${completeness}%` }"></div>
          </div>
        </div>

        <!-- Verify + visibility -->
        <div class="space-y-3">
          <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-gold-400/20">
            <div>
              <h4 class="font-medium">Get verified</h4>
              <p class="text-xs text-white/60 mt-1">{{ profile.isVerified ? 'Your profile is verified ✦' : 'Take a quick selfie to earn the gold badge' }}</p>
            </div>
            <button @click="goVerify" :disabled="profile.isVerified"
              class="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-lg text-sm font-semibold disabled:opacity-50">
              {{ profile.isVerified ? 'Verified' : 'Verify' }}
            </button>
          </div>

          <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-lagoon-400/20">
            <div>
              <h4 class="font-medium">Profile visibility</h4>
              <p class="text-xs text-white/60 mt-1">{{ profile.isVisible !== false ? 'Visible to nearby users' : 'Hidden from everyone' }}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" :checked="profile.isVisible !== false" @change="onToggleVisibility" class="sr-only peer" />
              <div class="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-lagoon-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button v-if="isEditing" @click="saveChanges" :disabled="isSaving"
          class="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50">
          {{ isSaving ? 'Saving…' : 'Save changes' }}
        </button>
        <button @click="router.push('/premium')" class="w-full py-4 bg-gradient-to-r from-gold-600/20 to-gold-400/20 text-gold-300 rounded-xl font-bold border border-gold-400/30 transition-all">
          👑 Upgrade to Kondani Gold
        </button>
        <button @click="router.push('/settings')" class="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium border border-white/10 transition-all">Account settings</button>
        <button @click="handleLogout" class="w-full py-4 bg-[#ff5e5e]/10 hover:bg-[#ff5e5e]/20 text-[#ff7a6b] rounded-xl font-medium border border-[#ff5e5e]/30 transition-all">Sign out</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useProfile } from '@/composables/useProfile'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import PhotoUpload from '@/components/feature/PhotoUpload.vue'
import { Check as CheckIcon, MapPin as MapPinIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: toastError } = useToast()
const { profile, saveProfile, toggleVisibility: toggleVisibilityApi } = useProfile()

const API_ORIGIN = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
const mediaSrc = (u) => (!u ? '' : (u.startsWith('http') || u.startsWith('blob:') ? u : API_ORIGIN + u))
const mainPhoto = computed(() => profile.value.photos?.[0] ? mediaSrc(profile.value.photos[0]) : '')

const isEditing = ref(false)
const isSaving = ref(false)
const tempInterest = ref('')
const editForm = reactive({ bio: '', interests: [], photos: [] })

const toggleEdit = () => {
  if (!isEditing.value) {
    editForm.bio = profile.value.bio || ''
    editForm.interests = [...(profile.value.interests || [])]
    editForm.photos = [...(profile.value.photos || [])]
  }
  isEditing.value = !isEditing.value
}

const addInterest = () => {
  const v = tempInterest.value?.trim()
  if (v && !editForm.interests.includes(v)) { editForm.interests.push(v); tempInterest.value = '' }
}

const saveChanges = async () => {
  if (isSaving.value) return
  isSaving.value = true
  try {
    await saveProfile({ bio: editForm.bio, interests: editForm.interests, photos: editForm.photos })
    isEditing.value = false
    success('Profile updated')
  } catch (err) {
    console.error(err); toastError('Failed to save changes')
  } finally { isSaving.value = false }
}

const onToggleVisibility = async () => {
  try { await toggleVisibilityApi() } catch (err) { toastError('Failed to update visibility') }
}

const goVerify = () => { if (!profile.value.isVerified) router.push('/verify-photo') }

const handleLogout = async () => {
  if (confirm('Sign out of Kondani?')) { await authStore.logout(); router.push('/login') }
}

const completeness = computed(() => {
  let s = 0
  if (profile.value.photos?.length) s += 25
  if (profile.value.bio?.length > 20) s += 25
  if (profile.value.interests?.length >= 3) s += 25
  if (profile.value.isVerified) s += 25
  return s
})
</script>

<style scoped>
.sec { @apply text-xs text-white/55 uppercase tracking-wider mb-3 font-bold; }
.ta { @apply w-full bg-white/10 border border-white/15 rounded-xl p-3 text-white placeholder-white/40 outline-none; }
.ta:focus { border-color:#2dd4bf; box-shadow:0 0 0 1px #2dd4bf; }
.inp { @apply bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white placeholder-white/40 outline-none; }
.inp:focus { border-color:#2dd4bf; }
.stars{background:radial-gradient(1.5px 1.5px at 18% 12%,rgba(255,215,130,.7),transparent),radial-gradient(1px 1px at 70% 8%,rgba(255,255,255,.5),transparent),radial-gradient(1px 1px at 88% 20%,rgba(255,215,130,.5),transparent);}
</style>
