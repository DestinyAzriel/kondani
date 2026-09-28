<script setup>
import Toast from '@/components/ui/Toast.vue'
</script>

<template>
  <div id="app" class="flex flex-col font-sans bg-deep-950" style="min-height: 100dvh">

    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'page'" mode="out-in">
        <component :is="Component" :key="route.path" class="flex-1" />
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