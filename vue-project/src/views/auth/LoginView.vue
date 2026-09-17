<template>
  <div class="login min-h-screen flex">
    <!-- Left: photo panel (desktop) -->
    <div class="photo-side" :class="isSignup ? 'is-signup' : 'is-signin'">
      <img :src="heroImg" alt="Kondani Love" />
      <div class="photo-scrim"></div>
      <div class="photo-copy">
        <div class="brand"><KondaniMark :size="40" /><b>Kondani</b></div>
        <template v-if="isSignup">
          <h2 class="serif">Find <em>love</em> in the warm heart of Africa.</h2>
          <p>Kondani means love. Join thousands of verified Malawians looking for meaningful connections.</p>
        </template>
        <template v-else>
          <h2 class="serif">Welcome <em>back</em>.</h2>
          <p>Your matches, chats, and encounters are waiting for you.</p>
        </template>
      </div>
    </div>

    <!-- Right: form & Google auth -->
    <div class="form-side">
      <div class="stars"></div>
      <div class="glow-orb"></div>

      <div class="form-inner">
        <router-link to="/" class="brand mob-brand">
          <KondaniMark :size="36" />
          <b>Kondani</b>
        </router-link>

        <h1 class="serif heading">{{ isSignup ? 'Join Kondani' : 'Sign in' }}</h1>
        <p class="sub">
          {{ isSignup
            ? 'Connect with verified Malawians across all 28 districts.'
            : 'Fast, secure 1-tap entry with your Google account.' }}
        </p>

        <!-- Perks list -->
        <div class="perks">
          <div class="perk">
            <BadgeCheck :size="18" class="perk-icon" />
            <span>Verified Malawian singles only</span>
          </div>
          <div class="perk">
            <MapPin :size="18" class="perk-icon" />
            <span>Discover matches in your district</span>
          </div>
          <div class="perk">
            <ShieldCheck :size="18" class="perk-icon" />
            <span>100% private — zero spam or phone verification</span>
          </div>
        </div>

        <!-- Google Auth Action Area -->
        <div class="auth-card">
          <!-- Loading state -->
          <div v-if="authStore.loading || isVerifying" class="auth-loading">
            <div class="spinner-gold"></div>
            <p class="text-sm font-medium text-white/80">Signing you in with Google…</p>
            <span class="text-xs text-white/40">Securing your session</span>
          </div>

          <div v-else class="space-y-4">
            <!-- Google Official Render Container -->
            <div id="googleBtnWrapper" class="google-wrapper">
              <div id="googleBtnContainer" class="flex justify-center w-full min-h-[46px]"></div>
            </div>

            <!-- Custom fallback / prominent button in case iframe is blocked -->
            <button
              type="button"
              class="btn-google-custom"
              @click="triggerGooglePrompt"
            >
              <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{{ isSignup ? 'Sign up with Google' : 'Continue with Google' }}</span>
            </button>

            <!-- Error message if any -->
            <p v-if="authStore.error || localError" class="err">
              {{ authStore.error || localError }}
            </p>
          </div>
        </div>

        <!-- Privacy reassurance -->
        <div class="trust-badge">
          <Lock :size="15" class="text-gold-300 shrink-0 mt-0.5" />
          <p>
            <strong class="text-white/90">Safe &amp; Private.</strong>
            We will never post anything to your Google account or share your email with anyone.
          </p>
        </div>

        <!-- Mode switcher -->
        <p class="switch">
          <template v-if="isSignup">
            Already have an account?
            <router-link to="/login">Sign in</router-link>
          </template>
          <template v-else>
            New to Kondani?
            <router-link to="/login?signup=1">Create an account</router-link>
          </template>
        </p>

        <p class="terms">
          By continuing you agree to Kondani's
          <router-link to="/privacy">Terms of Service &amp; Privacy Policy</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import KondaniMark from '@/components/ui/KondaniMark.vue'
import { BadgeCheck, MapPin, ShieldCheck, Lock } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isSignup = computed(() => route.query.signup === '1')
const heroImg = 'https://images.unsplash.com/photo-1719179542047-a4d84fd35c1f?w=1100&q=80&fit=crop'

const isVerifying = ref(false)
const localError = ref('')

const GOOGLE_CLIENT_ID = '910792519747-3lndl3s9g8lhkvgpn0chq3b59ah4nqtr.apps.googleusercontent.com'

const handleCredentialResponse = async (response) => {
  if (!response?.credential) {
    localError.value = 'Google sign-in was interrupted. Please try again.'
    return
  }

  isVerifying.value = true
  localError.value = ''
  authStore.error = null

  try {
    const data = await authStore.googleLogin(response.credential)

    if (authStore.user?.role === 'admin' || authStore.user?.role === 'moderator') {
      router.push('/admin')
      return
    }

    if (data.isNewUser || !authStore.user?.isProfileComplete) {
      router.push('/onboarding')
    } else {
      router.push('/encounters')
    }
  } catch (err) {
    console.error('Google login error:', err)
    localError.value = authStore.error || 'Failed to authenticate with Google. Please try again.'
  } finally {
    isVerifying.value = false
  }
}

const triggerGooglePrompt = () => {
  localError.value = ''
  if (window.google?.accounts?.id) {
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        console.log('One-tap not displayed, triggering click on rendered button')
        const nativeBtn = document.querySelector('#googleBtnContainer div[role="button"]')
        if (nativeBtn) nativeBtn.click()
      }
    })
  }
}

const initGoogle = () => {
  if (window.google?.accounts?.id) {
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      })

      const container = document.getElementById('googleBtnContainer')
      if (container) {
        window.google.accounts.id.renderButton(container, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: isSignup.value ? 'signup_with' : 'continue_with',
          width: 320,
          logo_alignment: 'left'
        })
      }

      // Automatically display One-Tap prompt
      window.google.accounts.id.prompt()
    } catch (e) {
      console.warn('Google Identity initialization notice:', e)
    }
  } else {
    setTimeout(initGoogle, 250)
  }
}

onMounted(() => {
  initGoogle()
})
</script>

<style scoped>
.login { background: #050d12; color: #f1f8f6; overflow: hidden; }

/* photo panel (desktop) */
.photo-side { display: none; }
@media (min-width: 1024px) {
  .photo-side {
    display: block;
    position: relative;
    width: 48%;
    min-height: 100vh;
    overflow: hidden;
  }
  .photo-side img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 25%;
    filter: brightness(.85);
  }
  .photo-scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(5,13,18,.35) 0%, rgba(5,13,18,.88) 100%),
                radial-gradient(circle at 50% 80%, rgba(244,183,64,.18), transparent 70%);
  }
  .photo-copy {
    position: absolute;
    bottom: 48px;
    left: 48px;
    right: 48px;
    z-index: 2;
  }
  .photo-copy .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 22px;
    color: #fff;
  }
  .photo-copy .brand b {
    font-family: 'Outfit', sans-serif;
    font-size: 26px;
    font-weight: 800;
  }
  .photo-copy h2 {
    font-size: 38px;
    line-height: 1.15;
    margin-bottom: 12px;
    color: #fff;
  }
  .photo-copy h2 em {
    color: #ffd98a;
    font-style: italic;
  }
  .photo-copy p {
    font-size: 15px;
    color: rgba(241,248,246,.75);
    line-height: 1.6;
    max-width: 420px;
  }
}

/* right form side */
.form-side {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}
.stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(1.5px 1.5px at 20% 18%, rgba(255,215,130,.5), transparent),
    radial-gradient(1px 1px at 70% 10%, rgba(255,255,255,.4), transparent),
    radial-gradient(1px 1px at 85% 30%, rgba(255,215,130,.4), transparent),
    radial-gradient(1.5px 1.5px at 45% 75%, rgba(244,183,64,.3), transparent);
}
.glow-orb {
  position: absolute;
  top: -10%;
  right: -10%;
  width: 50%;
  height: 45%;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(244,183,64,.12), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
}

.form-inner {
  position: relative;
  width: 100%;
  max-width: 420px;
  z-index: 10;
}

.mob-brand {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #fff;
  margin-bottom: 24px;
}
.mob-brand b {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 800;
}
@media (min-width: 1024px) {
  .mob-brand { display: none; }
}

.serif { font-family: 'Fraunces', serif; font-weight: 600; }
.heading {
  font-size: 34px;
  text-align: center;
  letter-spacing: -.02em;
  margin-bottom: 8px;
  color: #fff;
}
.sub {
  text-align: center;
  color: rgba(241,248,246,.6);
  font-size: 14.5px;
  margin-bottom: 26px;
  line-height: 1.5;
}

/* perks list */
.perks {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 26px;
  background: rgba(255,255,255,.025);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 16px;
  padding: 16px 18px;
}
.perk {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  color: rgba(241,248,246,.85);
}
.perk-icon {
  color: #f4b740;
  flex-shrink: 0;
}

/* auth card */
.auth-card {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(244,183,64,.2);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 12px 36px rgba(0,0,0,.35), 0 0 24px rgba(244,183,64,.08);
  backdrop-filter: blur(16px);
  margin-bottom: 20px;
}

.google-wrapper {
  display: flex;
  justify-content: center;
  overflow: hidden;
  border-radius: 9999px;
}

.btn-google-custom {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 15px;
  color: #ffffff;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.15);
  cursor: pointer;
  transition: all .2s ease;
}
.btn-google-custom:hover {
  background: rgba(255,255,255,.12);
  border-color: rgba(244,183,64,.4);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,0,0,.3);
}

.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
  gap: 10px;
}
.spinner-gold {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(244,183,64,.2);
  border-top-color: #f4b740;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.err {
  color: #ff9d8f;
  font-size: 13px;
  text-align: center;
  background: rgba(255,94,94,.1);
  border: 1px solid rgba(255,94,94,.25);
  padding: 10px 14px;
  border-radius: 12px;
}

.trust-badge {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: rgba(255,255,255,.025);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 18px;
}
.trust-badge p {
  font-size: 12.5px;
  color: rgba(241,248,246,.5);
  line-height: 1.5;
}

.switch {
  text-align: center;
  font-size: 13.5px;
  color: rgba(241,248,246,.5);
  margin-bottom: 10px;
}
.switch a {
  color: #f4b740;
  font-weight: 600;
  text-decoration: none;
}
.switch a:hover {
  text-decoration: underline;
}

.terms {
  text-align: center;
  font-size: 12px;
  color: rgba(241,248,246,.35);
  line-height: 1.5;
}
.terms a {
  color: #f4b740;
  text-decoration: none;
}
.terms a:hover {
  text-decoration: underline;
}

.text-gold-300 { color: #ffd98a; }
</style>
