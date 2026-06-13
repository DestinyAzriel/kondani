<script setup>
import { ref, onMounted } from 'vue'
import Toast from '@/components/ui/Toast.vue'
import OnboardingWizard from '@/components/feature/OnboardingWizard.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const showOnboarding = ref(false)

onMounted(() => {
  // Show onboarding if authenticated and not completed before
  const completed = localStorage.getItem('onboarding_completed')
  if (authStore.isAuthenticated && !completed) {
    showOnboarding.value = true
  }
})

const handleOnboardingComplete = () => {
  showOnboarding.value = false
  localStorage.setItem('onboarding_completed', 'true')
}

const handleOnboardingSkip = () => {
  showOnboarding.value = false
  localStorage.setItem('onboarding_completed', 'true')
}
</script>

<template>
  <div id="app" class="min-h-screen font-sans bg-deep-950">
    <!-- Onboarding Wizard -->
    <OnboardingWizard 
      :show="showOnboarding" 
      @complete="handleOnboardingComplete"
      @skip="handleOnboardingSkip"
    />

    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'page'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    
    <!-- Global Toast Notifications -->
    <Toast />
  </div>
</template>

<style>
/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Fade Transition (fallback) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>