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
  background: #0a0e1a; /* deep-950 */
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

/* Desktop Styles - Expansive & Premium */
@media (min-width: 768px) {
  .main-wrapper.desktop-active {
    padding-left: 375px;
    background: radial-gradient(circle at top right, #0d121f, #05070a);
  }

  .content-area {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
}

/* Add nice fade in for content */
.content-area {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
