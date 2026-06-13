<template>
  <div class="min-h-screen bg-night-950 text-white flex flex-col justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
    <!-- Lake of Stars ambiance -->
    <div class="stars absolute inset-0 pointer-events-none"></div>
    <div class="absolute top-[-15%] left-[-15%] w-[60%] h-[45%] rounded-full blur-[110px] pointer-events-none"
         style="background: radial-gradient(circle, rgba(45,212,191,.20), transparent 70%)"></div>
    <div class="absolute bottom-[-10%] right-[-15%] w-[55%] h-[40%] rounded-full blur-[110px] pointer-events-none"
         style="background: radial-gradient(circle, rgba(244,183,64,.15), transparent 70%)"></div>

    <div class="mx-auto w-full max-w-md relative z-10">
      <router-link to="/" class="flex justify-center items-center gap-3 mb-8 group">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-gold-500/25 bg-gradient-to-br from-gold-300 to-gold-500 group-hover:scale-105 transition-transform">
          <span class="text-2xl text-night-950">✦</span>
        </div>
        <span class="text-3xl font-bold font-display tracking-tight">Kondani</span>
      </router-link>

      <h2 class="text-center text-2xl font-bold font-display tracking-tight mb-2">
        {{ step === 1 ? 'Welcome back' : 'Enter your code' }}
      </h2>
      <p class="text-center text-sm text-white/55 mb-8">
        {{ step === 1
          ? "Enter your number — we'll send you a verification code."
          : `We sent a 6-digit code to +265 ${phone}` }}
      </p>

      <div class="glass-card py-8 px-5 sm:px-8">
        <!-- Step 1: phone -->
        <form v-if="step === 1" class="space-y-5" @submit.prevent="sendOTP">
          <div>
            <label class="block text-xs font-semibold text-white/60 mb-2">Phone number</label>
            <div class="flex rounded-xl overflow-hidden border border-white/10 focus-within:border-lagoon-400 focus-within:ring-1 focus-within:ring-lagoon-400 transition-all bg-white/5">
              <span class="inline-flex items-center px-4 text-white/70 font-medium border-r border-white/10">🇲🇼 +265</span>
              <input
                v-model="phone"
                type="tel"
                inputmode="numeric"
                class="flex-1 min-w-0 px-4 py-3 bg-transparent text-white placeholder-white/25 outline-none tracking-wide"
                placeholder="991 23 45 67"
              />
            </div>
          </div>

          <p v-if="authStore.error" class="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
            {{ authStore.error }}
          </p>

          <button
            type="submit"
            :disabled="!isValidPhone || authStore.loading"
            class="btn-gold w-full"
          >
            <span v-if="authStore.loading" class="spinner"></span>
            <span>{{ authStore.loading ? 'Sending…' : 'Send code' }}</span>
          </button>

          <div class="flex items-start gap-3 rounded-xl border border-lagoon-400/25 bg-lagoon-400/5 px-3 py-3">
            <span class="text-lg">🔒</span>
            <p class="text-xs leading-relaxed text-white/55">
              <span class="text-lagoon-300 font-semibold">Quick &amp; secure.</span>
              We send a one-time code to confirm your number — it keeps Kondani real and bot-free.
            </p>
          </div>
        </form>

        <!-- Step 2: OTP -->
        <form v-else class="space-y-5" @submit.prevent="verifyOTP">
          <div>
            <label class="block text-xs font-semibold text-white/60 mb-2">Verification code</label>
            <input
              v-model="otp"
              type="text"
              inputmode="numeric"
              maxlength="6"
              class="block w-full px-4 py-4 text-center text-2xl font-display font-bold tracking-[0.4em] rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-lagoon-400 focus:ring-1 focus:ring-lagoon-400 outline-none transition-all"
              placeholder="••••••"
            />
          </div>

          <p v-if="authStore.error" class="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
            {{ authStore.error }}
          </p>

          <button
            type="submit"
            :disabled="otp.length !== 6 || authStore.loading"
            class="btn-gold w-full"
          >
            <span v-if="authStore.loading" class="spinner"></span>
            <span>{{ authStore.loading ? 'Verifying…' : 'Verify & continue' }}</span>
          </button>

          <div class="flex items-center justify-between text-xs">
            <button type="button" @click="step = 1" class="text-white/45 hover:text-lagoon-300 transition-colors">
              ← Change number
            </button>
            <button type="button" :disabled="authStore.loading" @click="sendOTP" class="text-white/45 hover:text-lagoon-300 transition-colors">
              Resend code
            </button>
          </div>
        </form>
      </div>

      <p class="mt-6 text-center text-xs text-white/30">
        By continuing you agree to our
        <router-link to="/privacy" class="text-white/50 hover:text-lagoon-300">Terms &amp; Privacy</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const phone = ref('')
const otp = ref('')
const step = ref(1)

const cleanedPhone = computed(() => phone.value.replace(/\D/g, ''))
// Malawi mobile numbers: 9 digits starting with 8 or 9 (Airtel 99/88, TNM 31/88 etc.)
const isValidPhone = computed(() => cleanedPhone.value.length === 9 && /^[89]/.test(cleanedPhone.value))

const sendOTP = async () => {
  if (!isValidPhone.value || authStore.loading) return
  try {
    await authStore.register(`+265${cleanedPhone.value}`)
    step.value = 2
  } catch {
    /* error shown via authStore.error */
  }
}

const verifyOTP = async () => {
  if (otp.value.length !== 6) return
  try {
    await authStore.login(`+265${cleanedPhone.value}`, otp.value)
    // New users (incomplete profile) go to onboarding; everyone else to the app.
    const done = authStore.user?.isProfileComplete
    router.push(done ? '/encounters' : '/onboarding')
  } catch {
    /* error shown via authStore.error */
  }
}
</script>

<style scoped>
.stars {
  background:
    radial-gradient(1.5px 1.5px at 18% 14%, rgba(255,215,130,.9), transparent),
    radial-gradient(1.5px 1.5px at 62% 9%, rgba(255,255,255,.7), transparent),
    radial-gradient(1px 1px at 82% 20%, rgba(255,215,130,.8), transparent),
    radial-gradient(1px 1px at 38% 6%, rgba(255,255,255,.55), transparent),
    radial-gradient(1.5px 1.5px at 90% 7%, rgba(255,255,255,.5), transparent),
    radial-gradient(1px 1px at 10% 26%, rgba(255,215,130,.6), transparent),
    radial-gradient(1px 1px at 50% 16%, rgba(255,255,255,.45), transparent),
    radial-gradient(1px 1px at 73% 30%, rgba(255,215,130,.5), transparent);
}
.btn-gold {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 0.875rem 1rem; border-radius: 9999px; font-weight: 700;
  color: #08161d; border: none; cursor: pointer;
  background: linear-gradient(90deg, #f59e0b, #ffd27d);
  box-shadow: 0 8px 20px rgba(244,183,64,.3);
  transition: transform .15s ease, opacity .15s ease;
}
.btn-gold:hover:not(:disabled) { transform: scale(1.02); }
.btn-gold:active:not(:disabled) { transform: scale(.98); }
.btn-gold:disabled { opacity: .5; cursor: not-allowed; }
.spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid rgba(8,22,29,.35); border-top-color: #08161d;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
