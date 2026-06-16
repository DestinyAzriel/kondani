<template>
  <div class="onb">
    <!-- Left: brand + progress panel (desktop) -->
    <aside class="ob-aside">
      <img :src="heroImg" alt="" />
      <div class="ob-scrim"></div>
      <div class="ob-aside-copy">
        <div class="brand"><KondaniMark :size="40" /><b>Kondani</b></div>
        <h2 class="serif">You're almost in.</h2>
        <p>A few quick details and you'll start meeting verified Malawians near you.</p>
        <ul class="steps-list">
          <li :class="stepClass(1)"><span class="dot"><Check v-if="step > 1" :size="13" /><span v-else>1</span></span> Your basics</li>
          <li :class="stepClass(2)"><span class="dot"><Check v-if="step > 2" :size="13" /><span v-else>2</span></span> Your photos</li>
          <li :class="stepClass(3)"><span class="dot"><Check v-if="step > 3" :size="13" /><span v-else>3</span></span> Interests &amp; bio</li>
          <li :class="stepClass(4)"><span class="dot"><span>4</span></span> Your location</li>
        </ul>
      </div>
    </aside>

    <!-- Right: wizard -->
    <section class="ob-main">
      <div class="ob-stars"></div>

      <header class="ob-head">
        <router-link to="/" class="brand mob-brand"><KondaniMark :size="30" /><b>Kondani</b></router-link>
        <span class="stepcount">Step {{ step }} of 4</span>
      </header>
      <div class="ob-progress"><div class="bar" :style="{ width: `${(step / 4) * 100}%` }"></div></div>

      <div class="ob-body">
        <transition name="fade" mode="out-in">
          <!-- Step 1 -->
          <div v-if="step === 1" key="s1" class="space-y-6">
            <div>
              <h2 class="serif heading">Welcome to Kondani</h2>
              <p class="sub">Let's set up your profile.</p>
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
            <div>
              <h2 class="serif heading">Add your photos</h2>
              <p class="sub">At least one — real, recent, your face visible.</p>
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
            <div>
              <h2 class="serif heading">About you</h2>
              <p class="sub">Pick at least 3 interests and add a short bio.</p>
            </div>
            <div class="flex flex-wrap gap-2.5">
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
            <div>
              <h2 class="serif heading">Where are you?</h2>
              <p class="sub">So we can show you people nearby and the distance between you.</p>
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

            <p v-if="form.district" class="flex items-center gap-1.5 text-sm text-lagoon-300"><MapPinIcon :size="14" /> {{ form.district }}</p>
            <p v-if="locationError" class="text-sm text-[#ff7a6b]">{{ locationError }}</p>
            <p v-if="errorMsg" class="text-sm text-[#ff7a6b]">{{ errorMsg }}</p>

            <div class="flex gap-3">
              <button class="btn-ghost flex-1" @click="step--">Back</button>
              <button class="btn-gold flex-1" :disabled="loading" @click="finish">
                <span v-if="loading" class="spinner"></span>{{ loading ? 'Saving…' : 'Finish' }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Plus as PlusIcon, X as XIcon, MapPin as MapPinIcon, Check } from 'lucide-vue-next'
import KondaniMark from '@/components/ui/KondaniMark.vue'

const router = useRouter()
const authStore = useAuthStore()
const step = ref(1)
const loading = ref(false)
const locating = ref(false)
const locationError = ref('')
const errorMsg = ref('')

const heroImg = 'https://images.unsplash.com/photo-1719179542047-a4d84fd35c1f?w=1100&q=80&fit=crop'
const stepClass = (n) => (step.value === n ? 'on' : (step.value > n ? 'done' : ''))

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
.onb { min-height: 100vh; display: flex; background: #050d12; color: #f1f8f6; font-family: 'Inter', sans-serif; }
.serif { font-family: 'Fraunces', serif; font-weight: 600; letter-spacing: -.01em; }
.brand { display: flex; align-items: center; gap: 12px; }
.brand b { font-family: 'Outfit', sans-serif; font-weight: 800; }

/* left aside */
.ob-aside { display: none; position: relative; width: 40%; overflow: hidden; }
.ob-aside img { width: 100%; height: 100%; object-fit: cover; object-position: center 25%; }
.ob-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,13,18,.55), rgba(5,13,18,.35) 35%, rgba(5,13,18,.95)); }
.ob-aside-copy { position: absolute; inset: 0; padding: 48px; display: flex; flex-direction: column; justify-content: flex-end; }
.ob-aside-copy .brand b { font-size: 22px; }
.ob-aside-copy h2 { font-family: 'Fraunces', serif; font-weight: 600; font-size: 36px; line-height: 1.1; margin: 22px 0 12px; }
.ob-aside-copy > p { color: rgba(255,255,255,.75); font-size: 16px; max-width: 360px; }
.steps-list { list-style: none; margin: 32px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.steps-list li { display: flex; align-items: center; gap: 12px; font-size: 15px; color: rgba(255,255,255,.45); transition: color .2s; }
.steps-list li.on { color: #fff; }
.steps-list li.done { color: rgba(255,255,255,.7); }
.steps-list .dot { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); flex-shrink: 0; }
.steps-list li.on .dot { background: linear-gradient(90deg,#f4b740,#ffd98a); color: #050d12; border: none; }
.steps-list li.done .dot { background: #2dd4bf; color: #050d12; border: none; }

/* right main */
.ob-main { flex: 1; position: relative; display: flex; flex-direction: column; min-width: 0; }
.ob-stars { position: absolute; inset: 0; pointer-events: none; background:
  radial-gradient(1.5px 1.5px at 20% 14%, rgba(255,215,130,.45), transparent),
  radial-gradient(1px 1px at 72% 9%, rgba(255,255,255,.35), transparent),
  radial-gradient(1px 1px at 88% 26%, rgba(255,215,130,.4), transparent); }
.ob-head { position: relative; z-index: 10; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; }
.mob-brand { text-decoration: none; color: #fff; }
.mob-brand b { font-size: 22px; }
.stepcount { font-size: 13px; font-weight: 600; color: #f4b740; }
.ob-progress { position: relative; z-index: 10; height: 4px; background: rgba(255,255,255,.06); }
.ob-progress .bar { height: 100%; background: linear-gradient(90deg,#f4b740,#ffd98a); transition: width .5s ease; }
.ob-body { position: relative; z-index: 10; flex: 1; display: flex; flex-direction: column; justify-content: center; width: 100%; max-width: 460px; margin: 0 auto; padding: 32px 24px 48px; }
.heading { font-size: 30px; margin-bottom: 6px; }
.sub { color: rgba(241,248,246,.55); font-size: 14px; }

.lbl { @apply block text-xs font-semibold text-white/60 mb-2; }
.field { @apply w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/35 outline-none transition-all; }
.field:focus { border-color: #2dd4bf; box-shadow: 0 0 0 1px #2dd4bf; }
.opt { @apply p-3.5 rounded-xl border bg-white/5 border-white/10 text-white/60 font-medium transition-all; }
.opt-on { background: rgba(244,183,64,.15); border-color: #f4b740; color: #fff; }
.btn-gold { display:flex;align-items:center;justify-content:center;gap:8px;padding:.9rem 1rem;border-radius:9999px;font-weight:700;color:#1a1205;border:none;cursor:pointer;background:linear-gradient(95deg,#f4b740,#ffd98a);box-shadow:0 10px 26px rgba(244,183,64,.4);transition:transform .15s; }
.btn-gold:hover:not(:disabled){transform:translateY(-2px);} .btn-gold:disabled{opacity:.5;cursor:not-allowed;}
.btn-ghost{padding:.9rem 1rem;border-radius:9999px;font-weight:600;color:#fff;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);cursor:pointer;}
.btn-lagoon{display:flex;align-items:center;justify-content:center;gap:8px;padding:.9rem 1rem;border-radius:9999px;font-weight:700;color:#08161d;border:none;cursor:pointer;background:linear-gradient(90deg,#14b8a6,#2dd4bf);}
.btn-lagoon:disabled{opacity:.6;}
.spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(8,22,29,.35);border-top-color:#08161d;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.fade-enter-active,.fade-leave-active{transition:opacity .2s ease, transform .2s ease;}
.fade-enter-from{opacity:0;transform:translateY(8px);}
.fade-leave-to{opacity:0;transform:translateY(-8px);}

@media (min-width: 1024px) {
  .ob-aside { display: block; }
  .mob-brand { display: none; }
  .ob-head { justify-content: flex-end; }
}
</style>
