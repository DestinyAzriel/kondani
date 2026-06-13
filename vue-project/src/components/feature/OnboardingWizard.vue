<template>
  <div v-if="show" class="onboarding-overlay fixed inset-0 z-[100] bg-deep-950">
    <!-- Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
      <div 
        class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>

    <!-- Step 1: Welcome -->
    <div v-if="currentStep === 1" class="step-container">
      <div class="content-center">
        <div class="text-center mb-12 animate-fade-in">
          <div class="text-8xl mb-6 animate-bounce-slow">💚</div>
          <h1 class="text-5xl font-bold font-display text-white mb-4">
            Welcome to Kondani
          </h1>
          <p class="text-xl text-white/70 max-w-md mx-auto">
            Find real love in the Warm Heart of Africa
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div class="feature-card">
            <div class="text-4xl mb-4">🎯</div>
            <h3 class="text-lg font-bold text-white mb-2">Intent-Based</h3>
            <p class="text-sm text-white/60">Match based on real plans, not just photos</p>
          </div>
          <div class="feature-card">
            <div class="text-4xl mb-4">✅</div>
            <h3 class="text-lg font-bold text-white mb-2">Verified Users</h3>
            <p class="text-sm text-white/60">Real people with Malawian ID verification</p>
          </div>
          <div class="feature-card">
            <div class="text-4xl mb-4">🇲🇼</div>
            <h3 class="text-lg font-bold text-white mb-2">Made for Malawi</h3>
            <p class="text-sm text-white/60">Airtel/TNM payment, local culture</p>
          </div>
        </div>

        <button @click="nextStep" class="cta-button">
          Get Started
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Step 2: How It Works -->
    <div v-if="currentStep === 2" class="step-container">
      <div class="content-center">
        <h2 class="text-4xl font-bold font-display text-white mb-12 text-center">
          How Kondani Works
        </h2>

        <div class="max-w-2xl mx-auto space-y-8 mb-12">
          <div class="how-it-works-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3 class="text-xl font-bold text-white mb-2">Swipe to Match</h3>
              <p class="text-white/70">Swipe right to like, left to pass, up for super like</p>
            </div>
            <div class="step-demo">
              <div class="demo-card">
                <div class="text-6xl">👉</div>
              </div>
            </div>
          </div>

          <div class="how-it-works-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3 class="text-xl font-bold text-white mb-2">Get Matched</h3>
              <p class="text-white/70">When you both like each other, it's a match!</p>
            </div>
            <div class="step-demo">
              <div class="demo-card">
                <div class="text-6xl">💚</div>
              </div>
            </div>
          </div>

          <div class="how-it-works-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3 class="text-xl font-bold text-white mb-2">Start Chatting</h3>
              <p class="text-white/70">Send messages, voice notes, and plan your date</p>
            </div>
            <div class="step-demo">
              <div class="demo-card">
                <div class="text-6xl">💬</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4 justify-center">
          <button @click="prevStep" class="secondary-button">
            Back
          </button>
          <button @click="nextStep" class="cta-button">
            Continue
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Complete Profile -->
    <div v-if="currentStep === 3" class="step-container">
      <div class="content-center">
        <h2 class="text-4xl font-bold font-display text-white mb-4 text-center">
          Complete Your Profile
        </h2>
        <p class="text-white/60 text-center mb-12 max-w-md mx-auto">
          Profiles with photos get 10x more matches
        </p>

        <div class="max-w-lg mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-8">
          <div class="space-y-6">
            <div class="checklist-item" :class="{ completed: hasPhotos }">
              <div class="check-icon">
                <svg v-if="hasPhotos" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-white">Add Photos</h4>
                <p class="text-sm text-white/60">At least 2 photos</p>
              </div>
            </div>

            <div class="checklist-item" :class="{ completed: hasBio }">
              <div class="check-icon">
                <svg v-if="hasBio" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-white">Write Bio</h4>
                <p class="text-sm text-white/60">Tell people about yourself</p>
              </div>
            </div>

            <div class="checklist-item" :class="{ completed: hasInterests }">
              <div class="check-icon">
                <svg v-if="hasInterests" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-white">Add Interests</h4>
                <p class="text-sm text-white/60">At least 3 interests</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4 justify-center">
          <button @click="prevStep" class="secondary-button">
            Back
          </button>
          <button @click="skip" class="secondary-button">
            Skip for Now
          </button>
          <button @click="goToProfile" class="cta-button">
            Complete Profile
          </button>
        </div>
      </div>
    </div>

    <!-- Skip Button (all steps except last) -->
    <button 
      v-if="currentStep < 3"
      @click="skip" 
      class="fixed top-6 right-6 text-white/60 hover:text-white text-sm font-medium transition-colors"
    >
      Skip
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['complete', 'skip'])

const currentStep = ref(1)
const totalSteps = 3

const progress = computed(() => (currentStep.value / totalSteps) * 100)

// Check profile completion
const hasPhotos = computed(() => authStore.user?.photos?.length >= 2)
const hasBio = computed(() => authStore.user?.bio?.length >= 20)
const hasInterests = computed(() => authStore.user?.interests?.length >= 3)

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const skip = () => {
  emit('skip')
  // Mark onboarding as completed
  localStorage.setItem('onboarding_completed', 'true')
}

const goToProfile = () => {
  emit('complete')
  localStorage.setItem('onboarding_completed', 'true')
  router.push('/profile')
}
</script>

<style scoped>
.onboarding-overlay {
  overflow-y: auto;
}

.step-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px 24px;
}

.content-center {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
}

.how-it-works-step {
  display: flex;
  align-items: center;
  gap: 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-demo {
  flex-shrink: 0;
}

.demo-card {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s;
}

.checklist-item.completed {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.check-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.checklist-item.completed .check-icon {
  background: #10b981;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: bold;
  border-radius: 12px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.cta-button:active {
  transform: translateY(0);
}

.secondary-button {
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 600;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .how-it-works-step {
    flex-direction: column;
    text-align: center;
  }
  
  .step-demo {
    order: -1;
  }
}
</style>
