<template>
  <div v-if="showInstall" class="fixed bottom-20 left-4 right-4 bg-white p-4 rounded-2xl shadow-lg border border-emerald-100 z-50">
    <div class="flex items-start">
      <div class="mr-3 mt-1">
        <span class="text-2xl">❤️</span>
      </div>
      <div class="flex-1">
        <h3 class="font-bold text-gray-900">Install Kondani</h3>
        <p class="text-gray-600 text-sm mt-1">
          Tap <strong>Add to Home Screen</strong> for faster access and offline use.
        </p>
      </div>
      <button 
        @click="dismiss" 
        class="text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>
    <div class="mt-3 flex justify-end">
      <button 
        @click="installApp" 
        class="px-3 py-1 bg-emerald-600 text-white text-sm rounded-full"
      >
        Install
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showInstall = ref(false)
const deferredPrompt = ref(null)

const beforeInstallPrompt = (e) => {
  e.preventDefault()
  deferredPrompt.value = e
  showInstall.value = true
}

const installApp = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      console.log('User installed Kondani')
    }
    deferredPrompt.value = null
    showInstall.value = false
  }
}

const dismiss = () => {
  showInstall.value = false
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', beforeInstallPrompt)
})
</script>