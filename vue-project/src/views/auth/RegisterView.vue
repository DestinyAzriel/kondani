<template>
  <div class="min-h-screen bg-deep-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow" style="animation-delay: 2s"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <router-link to="/" class="flex justify-center items-center gap-3 mb-8 group">
        <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
          <span class="text-2xl">❤️</span>
        </div>
        <span class="text-3xl font-bold font-display tracking-tight text-white">Kondani</span>
      </router-link>
      
      <h2 class="text-center text-2xl font-bold text-white tracking-tight mb-2">
        {{ step === 1 ? 'Join Kondani' : 'Verify Number' }}
      </h2>
      <p class="text-center text-sm text-white/60">
        {{ step === 1 ? 'Start with your Malawian phone number' : `Enter the WhatsApp code sent to +265 ${phone}` }}
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="glass-card py-8 px-4 sm:px-10 border-t-4 border-t-emerald-500">
        <!-- Step 1: Registration Options -->
        <div v-if="step === 1" class="space-y-6">
          <!-- WhatsApp 1-Tap Button -->
          <button
            type="button"
            class="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-50"
            :disabled="waLoading"
            @click="startWhatsAppVerification"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>{{ waLoading ? 'Connecting…' : 'Register with WhatsApp' }}</span>
          </button>

          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-white/10"></div>
            <span class="flex-shrink mx-4 text-xs text-white/40">or use SMS</span>
            <div class="flex-grow border-t border-white/10"></div>
          </div>

          <div>
            <label class="block text-sm font-medium text-white/80 mb-1.5">
              Phone Number (Airtel/TNM)
            </label>
            <div class="relative flex rounded-xl shadow-sm group">
              <span class="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-white/10 bg-white/5 text-white/60 font-medium backdrop-blur-sm">
                🇲🇼 +265
              </span>
              <input
                v-model="phone"
                type="tel"
                class="flex-1 min-w-0 block w-full px-4 py-3 rounded-r-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none backdrop-blur-sm"
                placeholder="991234567"
                @keyup.enter="sendOTP"
              />
            </div>
          </div>

          <div v-if="authStore.error" class="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-200">
                  {{ authStore.error }}
                </h3>
              </div>
            </div>
          </div>

          <Button
            full-width
            :loading="authStore.loading"
            :disabled="!isValidPhone"
            @click="sendOTP"
          >
            Continue with SMS
          </Button>

          <div class="mt-8">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-white/10"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-deep-950/50 text-white/40 backdrop-blur-sm">
                  Already have an account?
                </span>
              </div>
            </div>

            <div class="mt-6">
              <router-link to="/login" class="w-full flex justify-center py-3 px-4 border border-white/10 rounded-xl shadow-sm bg-white/5 text-sm font-medium text-white hover:bg-white/10 transition-colors backdrop-blur-sm">
                Sign in
              </router-link>
            </div>
          </div>
        </div>

        <!-- Step 3: WhatsApp Waiting Screen -->
        <div v-else-if="step === 3" class="space-y-6 text-center">
          <div class="flex justify-center py-2">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#10b981">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </div>
          </div>

          <div class="bg-white/5 border border-white/10 rounded-xl p-4 text-left text-xs text-white/70 space-y-1.5">
            <p>1. Tap <b>Open WhatsApp</b> below.</p>
            <p>2. Tap <b>Send</b> on the pre-filled message.</p>
            <p>3. Return here to continue.</p>
          </div>

          <a :href="waSessionLink" target="_blank" rel="noopener" class="w-full block py-3.5 px-4 rounded-xl shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all text-center">
            Open WhatsApp
          </a>

          <div>
            <button type="button" @click="cancelWhatsApp" class="text-xs text-white/40 hover:text-white transition-colors cursor-pointer">
              Cancel
            </button>
          </div>
        </div>

        <!-- Step 2: OTP Input -->
        <div v-else-if="step === 2" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-white/80 mb-1.5">
              Verification Code
            </label>
            <input
              v-model="otp"
              type="text"
              inputmode="numeric"
              class="block w-full px-4 py-3 text-center text-2xl tracking-widest rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none backdrop-blur-sm"
              placeholder="000000"
              maxlength="6"
              @keyup.enter="verifyOTP"
            />
          </div>

          <div v-if="authStore.error" class="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-200">
                  {{ authStore.error }}
                </h3>
              </div>
            </div>
          </div>

          <Button
            full-width
            :loading="authStore.loading"
            :disabled="otp.length !== 6"
            @click="verifyOTP"
          >
            Verify Code
          </Button>

          <div class="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              @click="changeNumber"
              class="text-white/40 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              ← Change phone number
            </button>
            <button
              type="button"
              :disabled="authStore.loading || resendCooldown > 0"
              @click="sendOTP"
              class="text-emerald-400 hover:text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code' }}
            </button>
          </div>

          <p class="text-xs text-white/40 text-center leading-relaxed">
            Code valid for 5 minutes. SMS delivery may take 15–45 seconds depending on mobile network traffic.
          </p>
        </div>
      </div>

      <div class="mt-8 text-center text-xs text-white/30">
        By continuing, you agree to Kondani's 
        <a href="#" class="text-emerald-400 hover:text-emerald-300">Terms</a> and 
        <a href="#" class="text-emerald-400 hover:text-emerald-300">Privacy Policy</a>
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="mt-8 text-center text-sm text-white/20 relative z-10">
      <div class="max-w-md mx-auto px-4">
        © {{ new Date().getFullYear() }} Kondani. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth'
import { socketService } from '@/services/socketService'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

const phone = ref('')
const otp = ref('')
const step = ref(1)
const resendCooldown = ref(0)
let cooldownInterval = null

// WhatsApp verification state
const waLoading = ref(false)
const waSessionCode = ref('')
const waSessionLink = ref('')
let waPollTimer = null

const startCooldown = (seconds = 60) => {
  resendCooldown.value = seconds
  if (cooldownInterval) clearInterval(cooldownInterval)
  cooldownInterval = setInterval(() => {
    if (resendCooldown.value > 0) {
      resendCooldown.value--
    } else {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

const handleVerified = async (payload) => {
  if (waPollTimer) clearInterval(waPollTimer)
  try {
    await authStore.setSession(payload)
    sessionStorage.removeItem('kondani_auth_phone')
    sessionStorage.removeItem('kondani_auth_step')
    sessionStorage.removeItem('kondani_auth_time')
    if (authStore.user?.role === 'admin' || authStore.user?.role === 'moderator') {
      router.push('/admin')
      return
    }
    const user = authStore.user
    if (user && !user.isProfileComplete) {
      router.push('/onboarding')
    } else {
      router.push('/feed')
    }
  } catch (e) {
    console.error('Session transition error:', e)
  }
}

const startWhatsAppVerification = async () => {
  waLoading.value = true
  authStore.error = null
  try {
    socketService.connect()
    const socketId = socketService.socket?.id || ''
    const session = await authService.createWhatsAppSession(socketId, phone.value)

    waSessionCode.value = session.code
    waSessionLink.value = session.waLink
    step.value = 3

    if (socketService.socket) {
      socketService.socket.emit('subscribe_whatsapp_verification', session.code)
      socketService.socket.on('whatsapp_verified', handleVerified)
    }

    window.open(session.waLink, '_blank')

    if (waPollTimer) clearInterval(waPollTimer)
    waPollTimer = setInterval(async () => {
      try {
        const res = await authService.pollWhatsAppVerification(session.code)
        if (res.status === 'verified' && res.token) {
          handleVerified(res)
        }
      } catch (e) {}
    }, 2500)

  } catch (err) {
    authStore.error = err.response?.data?.error || err.message || 'Could not connect to verification service'
  } finally {
    waLoading.value = false
  }
}

const cancelWhatsApp = () => {
  if (waPollTimer) clearInterval(waPollTimer)
  step.value = 1
  waSessionCode.value = ''
  waSessionLink.value = ''
}

onMounted(() => {
  socketService.connect()

  const savedPhone = sessionStorage.getItem('kondani_auth_phone')
  if (savedPhone) {
    phone.value = savedPhone
  }
  const savedStep = sessionStorage.getItem('kondani_auth_step')
  const savedTime = sessionStorage.getItem('kondani_auth_time')
  if (savedStep === '2' && savedTime) {
    const elapsedSec = Math.floor((Date.now() - Number(savedTime)) / 1000)
    if (elapsedSec < 300) {
      step.value = 2
      if (elapsedSec < 60) {
        startCooldown(60 - elapsedSec)
      }
    } else {
      sessionStorage.removeItem('kondani_auth_step')
      sessionStorage.removeItem('kondani_auth_time')
    }
  }
})

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
  if (waPollTimer) clearInterval(waPollTimer)
  if (socketService.socket) {
    socketService.socket.off('whatsapp_verified', handleVerified)
  }
})

// Validate Malawian phone (more flexible approach)
const isValidPhone = computed(() => {
  let phoneToValidate = phone.value;
  if (phoneToValidate.startsWith('+265')) {
    phoneToValidate = phoneToValidate.substring(4);
  }
  const cleaned = phoneToValidate.replace(/\D/g, '');
  return cleaned.length === 9 && (cleaned.startsWith('9') || cleaned.startsWith('8'));
})

const sendOTP = async () => {
  let formattedPhone;
  if (phone.value.startsWith('+265')) {
    formattedPhone = phone.value;
  } else {
    formattedPhone = `+265${phone.value}`;
  }
  
  if (!isValidPhone.value || authStore.loading) return
  if (resendCooldown.value > 0 && step.value === 2) return
  
  try {
    sessionStorage.setItem('kondani_auth_phone', phone.value)
    sessionStorage.setItem('kondani_auth_step', '2')
    sessionStorage.setItem('kondani_auth_time', Date.now().toString())
    await authStore.register(formattedPhone)
    step.value = 2
    startCooldown(60)
  } catch {
    if (step.value === 1) {
      sessionStorage.removeItem('kondani_auth_step')
    }
  }
}

const changeNumber = () => {
  step.value = 1
  otp.value = ''
  sessionStorage.removeItem('kondani_auth_step')
  sessionStorage.removeItem('kondani_auth_time')
}

const verifyOTP = async () => {
  if (otp.value.length !== 6) return
  try {
    await authStore.login(`+265${phone.value}`, otp.value)
    sessionStorage.removeItem('kondani_auth_phone')
    sessionStorage.removeItem('kondani_auth_step')
    sessionStorage.removeItem('kondani_auth_time')
    if (authStore.user?.role === 'admin' || authStore.user?.role === 'moderator') {
      router.push('/admin')
      return
    }
    const user = authStore.user
    if (user && !user.isProfileComplete) {
      router.push('/onboarding')
    } else {
      router.push('/feed')
    }
  } catch {
    // Error handled in store
  }
}
</script>