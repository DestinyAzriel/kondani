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
        {{ step === 1 ? 'Start with your Malawian phone number' : `Enter the code sent to +265 ${phone}` }}
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="glass-card py-8 px-4 sm:px-10 border-t-4 border-t-emerald-500">
        <!-- Step 1: Phone Input -->
        <div v-if="step === 1" class="space-y-6">
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
            <p class="mt-2 text-xs text-white/40">
              We'll send a 6-digit code to verify your number.
            </p>
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
            Send Verification Code
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

          <button
            @click="step = 1"
            class="w-full text-sm text-white/40 hover:text-emerald-400 transition-colors"
          >
            ← Change phone number
          </button>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
// Card component is replaced by direct glass-card class usage for better control

const router = useRouter()
const authStore = useAuthStore()

const phone = ref('')
const otp = ref('')
const step = ref(1)

// Validate Malawian phone (more flexible approach)
const isValidPhone = computed(() => {
  // Handle both cases where user might enter with or without +265
  let phoneToValidate = phone.value;
  
  // If phone starts with +265, remove it for validation
  if (phoneToValidate.startsWith('+265')) {
    phoneToValidate = phoneToValidate.substring(4);
  }
  
  // Clean the phone number (remove any non-digit characters)
  const cleaned = phoneToValidate.replace(/\D/g, '');
  
  // Check if it's a valid Malawian number (9 digits starting with 08 or 09)
  // This is more flexible to accommodate all Malawian mobile operators
  return cleaned.length === 9 && (cleaned.startsWith('9') || cleaned.startsWith('8'));
})

const sendOTP = async () => {
  // Ensure we're sending the correct format to backend
  let formattedPhone;
  if (phone.value.startsWith('+265')) {
    formattedPhone = phone.value; // Already in correct format
  } else {
    formattedPhone = `+265${phone.value}`; // Add country code
  }
  
  if (!isValidPhone.value) return
  
  try {
    await authStore.register(formattedPhone)
    step.value = 2
  } catch {
    // Error handled in store
  }
}

const verifyOTP = async () => {
  if (otp.value.length !== 6) return
  try {
    await authStore.login(`+265${phone.value}`, otp.value)
    // Check if user has completed profile (mock check for now)
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