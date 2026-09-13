<template>
  <div class="app-container">
    <!-- Fluid Layout for all screens -->
    <div class="main-wrapper" :class="{ 'desktop-active': isDesktop }">
      <div class="content-area">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isDesktop = ref(window.innerWidth >= 768)

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #0a0e1a;
}

.main-wrapper {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.content-area {
  width: 100%;
  max-width: 100%;
  flex: 1;
}

/* Desktop: shift content right by exactly the sidebar width */
@media (min-width: 768px) {
  .main-wrapper.desktop-active {
    padding-left: 340px; /* matches DesktopNav w-[340px] exactly */
    background: radial-gradient(circle at top right, #0d121f, #05070a);
  }

  /* Let each view control its own max-width — no global cap here */
  .content-area {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
}

/* Subtle fade-in for content transitions */
.content-area {
  animation: fadeIn 0.35s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
