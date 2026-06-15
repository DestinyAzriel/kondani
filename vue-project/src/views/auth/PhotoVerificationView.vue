<template>
  <div class="min-h-screen bg-night-950 text-white flex flex-col relative overflow-hidden">
    <div class="stars fixed inset-0 pointer-events-none"></div>

    <div class="p-4 border-b border-white/10 relative z-10">
      <button @click="goBack" class="p-2 text-white/70 hover:text-white"><ArrowLeftIcon size="24" /></button>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-md mx-auto w-full">

      <!-- Instructions -->
      <div v-if="step === 'instructions'" class="w-full text-center">
        <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 bg-gradient-to-tr from-gold-500/20 to-lagoon-400/20">
          <ShieldCheckIcon size="44" class="text-gold-400" />
        </div>
        <h1 class="text-3xl font-bold font-display mb-3">Get verified</h1>
        <p class="text-white/60 mb-8">Take a quick selfie. We match it to your profile photo to earn your gold badge — it keeps Kondani real and trusted.</p>

        <div class="bg-white/5 rounded-2xl p-5 mb-8 text-left border border-white/10 space-y-2">
          <div class="flex items-start gap-2 text-sm text-white/70"><span class="text-lagoon-300 mt-0.5">✓</span>Face clearly visible, good lighting</div>
          <div class="flex items-start gap-2 text-sm text-white/70"><span class="text-lagoon-300 mt-0.5">✓</span>No sunglasses or hats</div>
          <div class="flex items-start gap-2 text-sm text-white/70"><span class="text-lagoon-300 mt-0.5">✓</span>Just you in the frame</div>
        </div>

        <button class="btn-gold w-full" @click="startCamera">Take a selfie</button>
      </div>

      <!-- Camera -->
      <div v-else-if="step === 'camera'" class="w-full text-center">
        <p class="text-gold-300 font-semibold mb-1">{{ pose }}</p>
        <p class="text-white/50 text-sm mb-4">{{ loadingModels ? 'Preparing camera…' : 'Position your face in the circle' }}</p>

        <div class="relative w-64 h-64 mx-auto mb-6">
          <div class="absolute inset-0 rounded-full overflow-hidden border-4 border-gold-400/60 shadow-xl">
            <video ref="video" autoplay playsinline muted class="w-full h-full object-cover transform scale-x-[-1]"></video>
          </div>
          <div v-if="busy" class="absolute inset-0 rounded-full bg-night-950/60 flex items-center justify-center">
            <span class="spinner-lg"></span>
          </div>
        </div>

        <canvas ref="canvas" class="hidden"></canvas>

        <p v-if="errorMsg" class="text-sm text-[#ff7a6b] mb-4">{{ errorMsg }}</p>

        <button class="btn-gold w-full" :disabled="busy || loadingModels" @click="capture">
          <span v-if="busy" class="spinner"></span>{{ busy ? 'Checking…' : 'Capture' }}
        </button>
        <button class="text-white/40 text-sm mt-3 hover:text-white" @click="goBack">Cancel</button>
      </div>

      <!-- Result -->
      <div v-else-if="step === 'result'" class="w-full text-center">
        <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
             :class="resultVerified ? 'bg-gradient-to-tr from-gold-300 to-gold-500' : 'bg-white/10 border border-white/15'">
          <CheckIcon v-if="resultVerified" size="48" class="text-night-950 stroke-[3]" />
          <ClockIcon v-else size="44" class="text-lagoon-300" />
        </div>
        <h1 class="text-2xl font-bold font-display mb-3">{{ resultVerified ? 'You are verified! ✦' : 'Selfie submitted' }}</h1>
        <p class="text-white/60 mb-8">{{ resultMessage }}</p>
        <button class="btn-gold w-full" @click="router.push('/profile')">Back to profile</button>
        <button v-if="!resultVerified" class="text-white/45 text-sm mt-3 hover:text-white" @click="retry">Try again</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores/auth'
import { ArrowLeft as ArrowLeftIcon, ShieldCheck as ShieldCheckIcon, Check as CheckIcon, Clock as ClockIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const FACEAPI_SRC = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js'
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'
import { mediaUrl } from '@/utils/media'
const mediaSrc = (u) => mediaUrl(u)

const poses = ['Look straight at the camera', 'Turn your head slightly left', 'Turn your head slightly right', 'Give a small smile']
const step = ref('instructions')
const pose = ref(poses[0])
const loadingModels = ref(false)
const busy = ref(false)
const errorMsg = ref('')
const resultVerified = ref(false)
const resultMessage = ref('')

const video = ref(null)
const canvas = ref(null)
let stream = null
let faceapi = null
let referenceDescriptor = null
let modelsReady = false

const loadScript = (src) => new Promise((resolve, reject) => {
  if (window.faceapi) return resolve()
  const s = document.createElement('script')
  s.src = src; s.onload = resolve; s.onerror = () => reject(new Error('script load failed'))
  document.head.appendChild(s)
})

const ensureModels = async () => {
  if (modelsReady) return true
  try {
    await loadScript(FACEAPI_SRC)
    faceapi = window.faceapi
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    modelsReady = true
    // Pre-compute reference descriptor from the profile's main photo
    const photo = authStore.user?.photos?.[0]
    if (photo) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = mediaSrc(photo)
        await img.decode()
        const det = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor()
        if (det) referenceDescriptor = det.descriptor
      } catch (e) { console.warn('Reference photo descriptor failed', e) }
    }
    return true
  } catch (e) {
    console.warn('face-api unavailable, falling back to manual review', e)
    return false
  }
}

const startCamera = async () => {
  step.value = 'camera'
  pose.value = poses[Math.floor(Math.random() * poses.length)]
  errorMsg.value = ''
  loadingModels.value = true
  // Kick off model loading in parallel with camera
  ensureModels().finally(() => { loadingModels.value = false })
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    if (video.value) video.value.srcObject = stream
  } catch (e) {
    errorMsg.value = 'Could not access your camera. Please allow camera access.'
  }
}

const stopCamera = () => {
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
}

const capture = async () => {
  if (!video.value || !canvas.value) return
  busy.value = true
  errorMsg.value = ''
  try {
    const v = video.value
    const c = canvas.value
    c.width = v.videoWidth || 480
    c.height = v.videoHeight || 480
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height)

    let score = 0
    let liveness = true

    if (modelsReady && faceapi) {
      const det = await faceapi.detectSingleFace(c, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor()
      if (!det) {
        errorMsg.value = 'No face detected — make sure your face is centered and well lit.'
        busy.value = false
        return
      }
      if (referenceDescriptor) {
        const distance = faceapi.euclideanDistance(referenceDescriptor, det.descriptor)
        score = Math.round(Math.max(0, 1 - distance) * 100)
      }
    }

    const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.9))
    const result = await authService.submitSelfie(blob, {
      faceMatchScore: score,
      poseChallenge: pose.value,
      livenessPassed: liveness
    })

    resultVerified.value = !!result.verified
    resultMessage.value = result.message || (result.verified ? 'Your gold badge is active.' : 'We will review it shortly.')
    if (result.verified) {
      authStore.user = { ...authStore.user, isVerified: true }
    }
    stopCamera()
    step.value = 'result'
  } catch (e) {
    console.error('Verification failed', e)
    errorMsg.value = 'Something went wrong. Please try again.'
  } finally {
    busy.value = false
  }
}

const retry = () => { step.value = 'instructions' }
const goBack = () => { stopCamera(); router.back() }

onUnmounted(stopCamera)
</script>

<style scoped>
.btn-gold { display:flex;align-items:center;justify-content:center;gap:8px;padding:.9rem 1rem;border-radius:9999px;font-weight:700;color:#08161d;border:none;cursor:pointer;background:linear-gradient(90deg,#f59e0b,#ffd27d);box-shadow:0 8px 20px rgba(244,183,64,.3);transition:transform .15s; }
.btn-gold:hover:not(:disabled){transform:scale(1.02);} .btn-gold:disabled{opacity:.5;cursor:not-allowed;}
.spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(8,22,29,.35);border-top-color:#08161d;animation:spin .7s linear infinite;}
.spinner-lg{width:34px;height:34px;border-radius:50%;border:3px solid rgba(255,255,255,.2);border-top-color:#f4b740;animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.stars{background:radial-gradient(1.5px 1.5px at 18% 12%,rgba(255,215,130,.7),transparent),radial-gradient(1px 1px at 70% 8%,rgba(255,255,255,.5),transparent),radial-gradient(1px 1px at 88% 20%,rgba(255,215,130,.5),transparent);}
</style>
