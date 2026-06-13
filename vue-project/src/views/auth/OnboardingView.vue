<template>
  <div class="min-h-screen bg-night-950 text-white flex flex-col relative overflow-hidden">
    <div class="stars fixed inset-0 pointer-events-none"></div>
    <div class="absolute top-[-20%] right-[-10%] w-[60%] h-[50%] rounded-full blur-[120px] pointer-events-none"
         style="background: radial-gradient(circle, rgba(45,212,191,.16), transparent 70%)"></div>
    <div class="absolute bottom-[-20%] left-[-10%] w-[60%] h-[50%] rounded-full blur-[120px] pointer-events-none"
         style="background: radial-gradient(circle, rgba(244,183,64,.12), transparent 70%)"></div>

    <header class="relative z-10 p-6 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-gold-300 to-gold-500">
          <span class="text-sm text-night-950">✦</span>
        </div>
        <span class="text-xl font-bold font-display tracking-tight">Kondani</span>
      </div>
      <div class="text-sm font-medium text-gold-400">Step {{ step }} of 4</div>
    </header>

    <div class="relative z-10 w-full h-1 bg-white/5">
      <div class="h-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-500" :style="{ width: `${(step / 4) * 100}%` }"></div>
    </div>

    <main class="flex-1 flex flex-col justify-center px-4 sm:px-6 relative z-10 max-w-md mx-auto w-full py-10">
      <transition name="fade" mode="out-in">
        <!-- Step 1 -->
        <div v-if="step === 1" key="s1" class="space-y-6">
          <div class="text-center">
            <h2 class="text-3xl font-bold font-display mb-2">Welcome to Kondani</h2>
            <p class="text-white/55">Let's set up your profile</p>
          </div>
          <div>
            <label class="lbl">First name</label>
            <input v-model="form.name" type="text" class="field" placeholder="e.g. Tadala" />
          </div>
          <div>
            <label class="lbl">Date of birth</label>
            <input v-model="form.dob" type="date" class="field" />
            <p v-if="form.dob" class="text-xs text-white/40 mt-1">{{ calculateAge(form.dob) }} years old</p>
          </div>
          <div>
            <label class="lbl">I am</label>
            <div class="grid grid-cols-2 gap-3">
              <button v-for="g in ['Male','Female']" :key="g" type="button" @click="form.gender = g"
                class="opt" :class="form.gender === g ? 'opt-on' : ''">{{ g }}</button>
            </div>
          </div>
          <div>
            <label class="lbl">Show me</label>
            <div class="grid grid-cols-3 gap-3">
              <button v-for="g in ['Male','Female','Everyone']" :key="g" type="button" @click="form.interestedIn = g"
                class="opt text-sm" :class="form.interestedIn === g ? 'opt-on' : ''">{{ g }}</button>
            </div>
          </div>
          <button class="btn-gold w-full" :disabled="!isStep1Valid" @click="step++">Continue</button>
        </div>

        <!-- Step 2: photos -->
        <div v-else-if="step === 2" key="s2" class="space-y-6">
          <div class="text-center">
            <h2 class="text-3xl font-bold font-display mb-2">Add your photos</h2>
            <p class="text-white/55">At least 1 — real, recent, your face visible.</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="i in 4" :key="i"
              class="aspect-[3/4] rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden"
              :class="form.photos[i-1] ? 'border-gold-400' : 'border-white/15 bg-white/5'">
              <template v-if="form.photos[i-1]">
                <img :src="form.photos[i-1].preview" class="absolute inset-0 w-full h-full object-cover" />
                <button @click.stop="removePhoto(i-1)" class="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white"><XIcon size="15" /></button>
                <span v-if="i===1" class="absolute bottom-2 left-2 text-[10px] font-bold bg-gradient-to-r from-gold-300 to-gold-500 text-night-950 px-2 py-0.5 rounded-full">Main</span>
              </template>
              <div v-else class="text-center text-white/40">
                <PlusIcon class="mx-auto mb-1 text-gold-400" /><span class="text-xs">Add</span>
              </div>
              <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" @change="handlePhoto($event, i-1)" />
            </div>
          </div>
          <div class="flex gap-3">
            <button class="btn-ghost flex-1" @click="step--">Back</button>
            <button class="btn-gold flex-1" :disabled="!isStep2Valid" @click="step++">Continue</button>
          </div>
        </div>

        <!-- Step 3: interests + bio -->
        <div v-else-if="step === 3" key="s3" class="space-y-6">
          <div class="text-center">
            <h2 class="text-3xl font-bold font-display mb-2">About you</h2>
            <p class="text-white/55">Pick at least 3 interests and add a short bio.</p>
          </div>
          <div class="flex flex-wrap gap-2.5 justify-center">
            <button v-for="interest in availableInterests" :key="interest" @click="toggleInterest(interest)"
              class="px-4 py-2 rounded-full border text-sm font-medium transition-all"
              :class="form.interests.includes(interest) ? 'bg-gradient-to-r from-gold-500 to-gold-300 border-transparent text-night-950' : 'bg-white/5 border-white/10 text-white/60'">
              {{ interest }}
            </button>
          </div>
          <div>
            <label class="lbl">Bio</label>
            <textarea v-model="form.bio" rows="3" maxlength="300" class="field resize-none" placeholder="Tell people a bit about you…"></textarea>
          </div>
          <div class="flex gap-3">
            <button class="btn-ghost flex-1" @click="step--">Back</button>
            <button class="btn-gold flex-1" :disabled="!isStep3Valid" @click="step++">Continue</button>
          </div>
        </div>

        <!-- Step 4: location -->
        <div v-else-if="step === 4" key="s4" class="space-y-6">
          <div class="text-center">
            <h2 class="text-3xl font-bold font-display mb-2">Where are you?</h2>
            <p class="text-white/55">So we can show you people nearby and the distance between you.</p>
          </div>

          <button class="btn-lagoon w-full" @click="useMyLocation" :disabled="locating">
            <MapPinIcon size="18" />
            {{ locating ? 'Getting location…' : 'Use my current location' }}
          </button>

          <div class="flex items-center gap-3">
            <div class="h-px flex-1 bg-white/10"></div><span class="text-xs text-white/40">or pick your district</span><div class="h-px flex-1 bg-white/10"></div>
          </div>

          <select v-model="form.district" @change="onDistrictSelect" class="field">
            <option value="" disabled>Select your district</option>
            <option v-for="d in districts" :key="d.name" :value="d.name">{{ d.name }}</option>
          </select>

          <p v-if="form.district" class="text-center text-sm text-lagoon-300">📍 {{ form.district }}</p>
          <p v-if="locationError" class="text-center text-sm text-[#ff7a6b]">{{ locationError }}</p>
          <p v-if="errorMsg" class="text-center text-sm text-[#ff7a6b]">{{ errorMsg }}</p>

          <div class="flex gap-3">
            <button class="btn-ghost flex-1" @click="step--">Back</button>
            <button class="btn-gold flex-1" :disabled="loading" @click="finish">
              <span v-if="loading" class="spinner"></span>{{ loading ? 'Saving…' : 'Finish' }}
            </button>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Plus as PlusIcon, X as XIcon, MapPin as MapPinIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const step = ref(1)
const loading = ref(false)
const locating = ref(false)
const locationError = ref('')
const errorMsg = ref('')

const form = reactive({
  name: '', dob: '', gender: '', interestedIn: 'Everyone',
  photos: [], interests: [], bio: '',
  coords: null, district: ''
})

const availableInterests = [
  'Music','Travel','Cooking','Movies','Dancing','Football','Fashion','Art',
  'Reading','Gaming','Nature','Photography','Food','Technology','Fitness','Church'
]

// All 28 Malawi districts with [lon, lat] for distance (incl. Chitipa).
const districts = [
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

const isStep1Valid = computed(() => form.name && form.dob && form.gender)
const isStep2Valid = computed(() => form.photos.filter(Boolean).length >= 1)
const isStep3Valid = computed(() => form.interests.length >= 3 && form.bio.trim().length > 0)

const handlePhoto = (e, index) => {
  const file = e.target.files[0]
  if (file) form.photos[index] = { file, preview: URL.createObjectURL(file) }
}
const removePhoto = (i) => { form.photos[i] = null }
const toggleInterest = (interest) => {
  const idx = form.interests.indexOf(interest)
  if (idx >= 0) form.interests.splice(idx, 1)
  else if (form.interests.length < 8) form.interests.push(interest)
}

const nearestDistrict = (lat, lon) => {
  let best = null, min = Infinity
  for (const d of districts) {
    const dist = Math.hypot(d.lat - lat, d.lon - lon)
    if (dist < min) { min = dist; best = d }
  }
  return best
}

const useMyLocation = () => {
  locationError.value = ''
  if (!navigator.geolocation) { locationError.value = 'Geolocation not supported — pick a district.'; return }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.coords = [pos.coords.longitude, pos.coords.latitude]
      const near = nearestDistrict(pos.coords.latitude, pos.coords.longitude)
      if (near) form.district = near.name
      locating.value = false
    },
    () => { locationError.value = 'Could not get location — pick your district below.'; locating.value = false },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

const onDistrictSelect = () => {
  const d = districts.find(x => x.name === form.district)
  if (d) form.coords = [d.lon, d.lat]
}

const calculateAge = (dob) => {
  if (!dob) return null
  const b = new Date(dob), t = new Date()
  let age = t.getFullYear() - b.getFullYear()
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--
  return age
}

const finish = async () => {
  errorMsg.value = ''
  loading.value = true
  try {
    const profileData = {
      name: form.name,
      age: calculateAge(form.dob),
      gender: form.gender,
      bio: form.bio,
      interests: form.interests,
      photos: form.photos.filter(Boolean).map(p => p.file),
      preferences: { gender: form.interestedIn },
      district: form.district,
      location: { type: 'Point', coordinates: form.coords || [0, 0] }
    }
    await authStore.updateUserProfile(profileData)
    router.push('/encounters')
  } catch (err) {
    console.error('Onboarding failed', err)
    errorMsg.value = 'Could not save your profile. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.lbl { @apply block text-xs font-semibold text-white/60 mb-2; }
.field { @apply w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/35 outline-none transition-all; }
.field:focus { border-color: #2dd4bf; box-shadow: 0 0 0 1px #2dd4bf; }
.opt { @apply p-3.5 rounded-xl border bg-white/5 border-white/10 text-white/60 font-medium transition-all; }
.opt-on { background: rgba(244,183,64,.15); border-color: #f4b740; color: #fff; }
.btn-gold { display:flex;align-items:center;justify-content:center;gap:8px;padding:.85rem 1rem;border-radius:9999px;font-weight:700;color:#08161d;border:none;cursor:pointer;background:linear-gradient(90deg,#f59e0b,#ffd27d);box-shadow:0 8px 20px rgba(244,183,64,.3);transition:transform .15s; }
.btn-gold:hover:not(:disabled){transform:scale(1.02);} .btn-gold:disabled{opacity:.5;cursor:not-allowed;}
.btn-ghost{padding:.85rem 1rem;border-radius:9999px;font-weight:600;color:#fff;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);cursor:pointer;}
.btn-lagoon{display:flex;align-items:center;justify-content:center;gap:8px;padding:.85rem 1rem;border-radius:9999px;font-weight:700;color:#08161d;border:none;cursor:pointer;background:linear-gradient(90deg,#14b8a6,#2dd4bf);}
.btn-lagoon:disabled{opacity:.6;}
.spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(8,22,29,.35);border-top-color:#08161d;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.stars{background:radial-gradient(1.5px 1.5px at 18% 12%,rgba(255,215,130,.7),transparent),radial-gradient(1px 1px at 70% 8%,rgba(255,255,255,.5),transparent),radial-gradient(1px 1px at 88% 20%,rgba(255,215,130,.5),transparent);}
</style>
