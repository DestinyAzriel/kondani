<template>
  <div class="login min-h-screen flex">
    <!-- Left: photo panel (desktop) — copy + image differ by mode -->
    <div class="photo-side" :class="isSignup ? 'is-signup' : 'is-signin'">
      <img :src="heroImg" alt="" />
      <div class="photo-scrim"></div>
      <div class="photo-copy">
        <div class="brand"><KondaniMark :size="40" /><b>Kondani</b></div>
        <template v-if="isSignup">
          <h2 class="serif">Find <em>love</em> in the warm heart of Africa.</h2>
          <p>Kondani means love. Join thousands of verified Malawians looking for something real.</p>
        </template>
        <template v-else>
          <h2 class="serif">Welcome <em>back</em>.</h2>
          <p>Your matches and conversations are waiting for you.</p>
        </template>
      </div>
    </div>

    <!-- Right: form -->
    <div class="form-side">
      <div class="stars"></div>
      <div class="form-inner">
        <router-link to="/" class="brand mob-brand"><KondaniMark :size="36" /><b>Kondani</b></router-link>

        <h1 class="serif heading">{{ step === 2 ? 'Enter your code' : (isSignup ? 'Create your account' : 'Sign in') }}</h1>
        <p class="sub">{{ step === 2
          ? `We sent a 6-digit code to +265 ${cleanedPhone}`
          : (isSignup
            ? 'Join free in under a minute — all you need is your phone number.'
            : 'Enter your number and we\'ll text you a code.') }}</p>

        <!-- Signup-only value props -->
        <div v-if="step === 1 && isSignup" class="perks">
          <div class="perk"><BadgeCheck :size="17" /><span>Verified profiles only</span></div>
          <div class="perk"><MapPin :size="17" /><span>Real people near you</span></div>
          <div class="perk"><Heart :size="17" /><span>Free to join</span></div>
        </div>

        <!-- Step 1 -->
        <form v-if="step === 1" @submit.prevent="sendOTP" class="space">
          <label class="lbl">Phone number</label>
          <div class="phone-field">
            <span class="cc">🇲🇼 +265</span>
            <input v-model="phone" type="tel" inputmode="numeric" placeholder="991 23 45 67" />
          </div>
          <p v-if="authStore.error" class="err">{{ authStore.error }}</p>
          <button type="submit" class="btn-gold" :disabled="!isValidPhone || authStore.loading">
            <span v-if="authStore.loading" class="spin"></span>{{ authStore.loading ? 'Sending…' : (isSignup ? 'Create account' : 'Sign in') }}
          </button>

          <div v-if="isSignup" class="note">
            <Lock :size="16" />
            <p><span class="hl">Quick &amp; secure.</span> We send a one-time code to confirm your number — it keeps Kondani real and bot-free.</p>
          </div>

          <p class="switch">
            <template v-if="isSignup">Already have an account?
              <router-link to="/login">Sign in</router-link>
            </template>
            <template v-else>New to Kondani?
              <router-link to="/login?signup=1">Create an account</router-link>
            </template>
          </p>
        </form>

        <!-- Step 2 -->
        <form v-else @submit.prevent="verifyOTP" class="space">
          <label class="lbl">Verification code</label>
          <input v-model="otp" type="text" inputmode="numeric" maxlength="6" placeholder="••••••" class="otp-input" />
          <p v-if="authStore.error" class="err">{{ authStore.error }}</p>
          <button type="submit" class="btn-gold" :disabled="otp.length !== 6 || authStore.loading">
            <span v-if="authStore.loading" class="spin"></span>{{ authStore.loading ? 'Verifying…' : (isSignup ? 'Create account' : 'Verify & sign in') }}
          </button>
          <div class="row-between">
            <button type="button" class="textlink" @click="step = 1">← Change number</button>
            <button type="button" class="textlink" :disabled="authStore.loading" @click="sendOTP">Resend code</button>
          </div>
        </form>

        <p class="terms">By continuing you agree to our
          <router-link to="/privacy">Terms &amp; Privacy</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import KondaniMark from '@/components/ui/KondaniMark.vue'
import { BadgeCheck, MapPin, Heart, Lock } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isSignup = computed(() => route.query.signup === '1')
// Single approved African-couple image; modes differ via copy, not photo.
const heroImg = 'https://images.unsplash.com/photo-1719179542047-a4d84fd35c1f?w=1100&q=80&fit=crop'

const phone = ref('')
const otp = ref('')
const step = ref(1)

const cleanedPhone = computed(() => phone.value.replace(/\D/g, ''))
const isValidPhone = computed(() => cleanedPhone.value.length === 9 && /^[89]/.test(cleanedPhone.value))

const sendOTP = async () => {
  if (!isValidPhone.value || authStore.loading) return
  try {
    await authStore.register(`+265${cleanedPhone.value}`)
    step.value = 2
  } catch { /* error shown via authStore.error */ }
}

const verifyOTP = async () => {
  if (otp.value.length !== 6) return
  try {
    await authStore.login(`+265${cleanedPhone.value}`, otp.value)
    const done = authStore.user?.isProfileComplete
    router.push(done ? '/encounters' : '/onboarding')
  } catch { /* error shown via authStore.error */ }
}
</script>

<style scoped>
.login { background: #050d12; color: #f1f8f6; font-family: 'Inter', sans-serif; }

/* photo side */
.photo-side { display: none; position: relative; width: 44%; overflow: hidden; }
.photo-side img { width: 100%; height: 100%; object-fit: cover; object-position: center 25%; }
.photo-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,13,18,.5), rgba(5,13,18,.25) 40%, rgba(5,13,18,.92)); }
.photo-copy { position: absolute; left: 0; right: 0; bottom: 0; padding: 48px; }
.photo-copy .brand b { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; }
.photo-copy h2 { font-family: 'Fraunces', serif; font-weight: 600; font-size: 38px; line-height: 1.1; margin: 22px 0 12px; }
.photo-copy h2 em, .heading em { font-style: italic; color: #ffd98a; }
.photo-copy p { color: rgba(255,255,255,.75); font-size: 16px; }
.brand { display: flex; align-items: center; gap: 12px; }

/* form side */
.form-side { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; padding: 32px 24px; }
.stars { position: absolute; inset: 0; pointer-events: none; background:
  radial-gradient(1.5px 1.5px at 20% 18%, rgba(255,215,130,.5), transparent),
  radial-gradient(1px 1px at 70% 10%, rgba(255,255,255,.4), transparent),
  radial-gradient(1px 1px at 85% 30%, rgba(255,215,130,.4), transparent); }
.form-inner { position: relative; width: 100%; max-width: 400px; }
.mob-brand { display: flex; justify-content: center; gap: 12px; text-decoration: none; color: #fff; margin-bottom: 26px; }
.mob-brand b { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800; }
.serif { font-family: 'Fraunces', serif; font-weight: 600; }
.heading { font-size: 34px; text-align: center; letter-spacing: -.01em; margin-bottom: 8px; }
.sub { text-align: center; color: rgba(241,248,246,.55); font-size: 14px; margin-bottom: 28px; line-height: 1.5; }
.space > * + * { margin-top: 18px; }
.lbl { display: block; font-size: 12px; font-weight: 600; color: rgba(241,248,246,.6); margin-bottom: 8px; }
.phone-field { display: flex; align-items: center; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; background: rgba(255,255,255,.05); overflow: hidden; }
.phone-field:focus-within { border-color: #f4b740; box-shadow: 0 0 0 1px #f4b740; }
.phone-field .cc { padding: 0 14px; font-weight: 600; border-right: 1px solid rgba(255,255,255,.1); white-space: nowrap; }
.phone-field input { flex: 1; min-width: 0; padding: 14px; background: transparent; border: none; outline: none; color: #fff; letter-spacing: 1px; }
.otp-input { width: 100%; padding: 16px; text-align: center; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 24px; letter-spacing: .4em; border-radius: 12px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: #fff; outline: none; }
.otp-input:focus { border-color: #f4b740; box-shadow: 0 0 0 1px #f4b740; }
.btn-gold { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 15px; border-radius: 99px; font-weight: 700; color: #1a1205; border: none; cursor: pointer; background: linear-gradient(95deg, #f4b740, #ffd98a); box-shadow: 0 10px 26px rgba(244,183,64,.4); transition: transform .15s; }
.btn-gold:hover:not(:disabled) { transform: translateY(-2px); }
.btn-gold:disabled { opacity: .5; cursor: not-allowed; }
.err { color: #ff9d8f; font-size: 13px; background: rgba(255,94,94,.1); border: 1px solid rgba(255,94,94,.25); padding: 10px 12px; border-radius: 10px; }
.note { display: flex; gap: 11px; align-items: flex-start; border: 1px solid rgba(244,183,64,.25); background: rgba(244,183,64,.06); border-radius: 12px; padding: 13px; }
.note .hl { color: #ffd98a; font-weight: 600; }
.note p { font-size: 12.5px; color: rgba(241,248,246,.6); line-height: 1.5; }
.row-between { display: flex; justify-content: space-between; }
.textlink { background: none; border: none; color: rgba(241,248,246,.5); font-size: 13px; cursor: pointer; }
.textlink:hover { color: #ffd98a; }
.terms { text-align: center; font-size: 11px; color: rgba(241,248,246,.35); margin-top: 26px; }
.terms a { color: rgba(241,248,246,.55); }

/* signup value props */
.perks { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.perk { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: rgba(241,248,246,.8); }
.perk svg { color: #f4b740; flex-shrink: 0; }

/* mode switch link */
.switch { text-align: center; font-size: 13px; color: rgba(241,248,246,.5); }
.switch a { color: #ffd98a; font-weight: 600; text-decoration: none; }
.switch a:hover { text-decoration: underline; }
.note svg { color: #ffd98a; flex-shrink: 0; margin-top: 1px; }

@media (min-width: 1024px) {
  .photo-side { display: block; }
  .mob-brand { display: none; }
}
</style>
