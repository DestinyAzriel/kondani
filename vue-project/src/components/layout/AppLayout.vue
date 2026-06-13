<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '@/components/layout/BottomNav.vue'
import DesktopNav from '@/components/layout/DesktopNav.vue'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer.vue'
import { Phone as PhoneIcon, PhoneOff as PhoneOffIcon, Video as VideoIcon } from 'lucide-vue-next'
import { socketService } from '@/services/socketService'
import { useAuthStore } from '@/stores/auth'
import { callState } from '@/services/callState'

const router = useRouter()
const authStore = useAuthStore()
const myId = String(authStore.user?._id || authStore.user?.id || '')
const incomingCall = ref(null) // { offer, from, name, mode }

const handleIncomingCall = (data) => {
  incomingCall.value = {
    offer: data.offer,
    from: data.from,
    name: data.name || 'Kondani user',
    mode: data.mode || 'video',
    photo: 'https://via.placeholder.com/150'
  }
}

const acceptCall = () => {
  const c = incomingCall.value
  if (!c) return
  // Hand the offer to the call view via shared state
  callState.offer = c.offer
  callState.peerId = c.from
  callState.mode = c.mode
  callState.peerName = c.name
  incomingCall.value = null
  router.push({
    path: `/video-call/${c.from}`,
    query: { initiator: 'false', mode: c.mode, name: c.name, to: c.from }
  })
}

const rejectCall = () => {
  if (incomingCall.value) socketService.emit('end_call', { to: incomingCall.value.from })
  incomingCall.value = null
}

onMounted(() => {
  socketService.connect()
  if (myId) socketService.emit('join', myId)
  socketService.on('call_made', handleIncomingCall)
  socketService.on('call_ended', () => { incomingCall.value = null })
})

onUnmounted(() => {
  socketService.off('call_made', handleIncomingCall)
})
</script>

<template>
  <div class="app-layout min-h-screen bg-night-950 text-white">
    <DesktopNav class="hidden md:flex" />

    <ResponsiveContainer>
      <main class="relative z-10 w-full min-h-screen md:max-w-none transition-all duration-300">
        <router-view v-slot="{ Component, route }">
          <transition :name="route.meta.transition || 'fade'" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>

      <BottomNav class="md:hidden z-50 fixed bottom-0 left-0 right-0 max-w-md mx-auto" />
    </ResponsiveContainer>

    <!-- Incoming call ring -->
    <div v-if="incomingCall" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div class="bg-night-900 border border-white/10 rounded-3xl p-7 w-full max-w-sm text-center shadow-2xl">
        <div class="relative w-24 h-24 mx-auto mb-4">
          <div class="absolute inset-0 rounded-full blur-xl animate-pulse" style="background: rgba(45,212,191,.3)"></div>
          <img :src="incomingCall.photo" class="relative w-full h-full rounded-full object-cover border-4 border-lagoon-400" />
        </div>
        <h3 class="text-xl font-bold font-display mb-1">{{ incomingCall.name }}</h3>
        <p class="text-lagoon-300 text-sm font-medium mb-8">
          Incoming {{ incomingCall.mode === 'audio' ? 'audio' : 'video' }} call…
        </p>

        <div class="flex justify-center gap-10">
          <button @click="rejectCall" class="flex flex-col items-center gap-2 text-white/60">
            <div class="w-14 h-14 rounded-full bg-[#ff5e5e]/20 flex items-center justify-center border border-[#ff5e5e]/50">
              <PhoneOffIcon size="24" class="text-[#ff5e5e]" />
            </div>
            <span class="text-xs font-bold">Decline</span>
          </button>
          <button @click="acceptCall" class="flex flex-col items-center gap-2">
            <div class="w-14 h-14 rounded-full bg-lagoon-500 flex items-center justify-center shadow-lg animate-bounce">
              <component :is="incomingCall.mode === 'audio' ? PhoneIcon : VideoIcon" size="24" class="text-night-950" />
            </div>
            <span class="text-xs font-bold">Accept</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .app-layout { padding-bottom: 72px; }
}
</style>
