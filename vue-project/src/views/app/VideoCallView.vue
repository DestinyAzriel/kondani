<template>
  <div class="call-view h-screen bg-night-950 text-white relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-night-900 via-night-950 to-black"></div>

    <!-- Remote video (also carries remote audio for audio calls) -->
    <video ref="remoteVideo" autoplay playsinline
           class="w-full h-full object-cover relative z-10"
           :class="{ 'opacity-0': !isVideo || callStatus !== 'connected' }"></video>

    <!-- Audio-call / connecting backdrop -->
    <div v-if="!isVideo || callStatus !== 'connected'"
         class="absolute inset-0 z-10 flex flex-col items-center justify-center">
      <div class="relative mb-7">
        <div class="absolute inset-0 rounded-full blur-2xl animate-pulse"
             style="background: rgba(45,212,191,.25)"></div>
        <img :src="otherUser.photo" class="relative w-32 h-32 rounded-full object-cover border-4 border-lagoon-400 shadow-2xl" />
      </div>
      <h2 class="text-3xl font-bold font-display mb-2">{{ otherUser.name }}</h2>
      <p class="text-white/60 text-lg">
        <span v-if="callStatus === 'connected'">{{ callDuration }}</span>
        <span v-else-if="callStatus === 'calling'">Calling…</span>
        <span v-else>Connecting…</span>
      </p>
      <p class="text-lagoon-300 text-sm mt-1">{{ isVideo ? 'Video call' : 'Audio call' }}</p>
    </div>

    <!-- Local video PiP (video calls only) -->
    <div v-if="isVideo" class="absolute top-6 right-6 w-28 h-44 bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 z-30">
      <video ref="localVideo" autoplay playsinline muted class="w-full h-full object-cover transform scale-x-[-1]"></video>
      <div v-if="!isCameraOn" class="absolute inset-0 bg-night-900 flex items-center justify-center text-white/50 text-xs">Camera off</div>
    </div>

    <!-- Controls -->
    <div class="absolute bottom-8 left-0 right-0 flex justify-center z-30">
      <div class="bg-black/40 backdrop-blur-xl rounded-full px-6 py-4 border border-white/10 shadow-2xl flex items-center gap-4">
        <button @click="toggleMic"
                :class="['p-4 rounded-full transition-all', isMuted ? 'bg-white text-night-950' : 'bg-white/10 text-white hover:bg-white/20']">
          <MicOffIcon v-if="isMuted" size="22" /><MicIcon v-else size="22" />
        </button>

        <button @click="endCall" class="p-5 rounded-full bg-gradient-to-br from-[#ff5e5e] to-[#e23b3b] text-white hover:scale-105 active:scale-95 transition-all shadow-xl">
          <PhoneOffIcon size="26" class="stroke-[2.5]" />
        </button>

        <button v-if="isVideo" @click="toggleCamera"
                :class="['p-4 rounded-full transition-all', !isCameraOn ? 'bg-white text-night-950' : 'bg-white/10 text-white hover:bg-white/20']">
          <VideoOffIcon v-if="!isCameraOn" size="22" /><VideoIcon v-else size="22" />
        </button>
      </div>
    </div>

    <p v-if="errorMsg" class="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-black/60 px-4 py-2 rounded-full text-sm text-[#ff7a6b]">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Mic as MicIcon, MicOff as MicOffIcon, Video as VideoIcon, VideoOff as VideoOffIcon, PhoneOff as PhoneOffIcon } from 'lucide-vue-next'
import { socketService } from '@/services/socketService'
import { useAuthStore } from '@/stores/auth'
import { callState, clearCall } from '@/services/callState'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const myId = String(authStore.user?._id || authStore.user?.id || '')
const peerId = String(route.query.to || route.params.id || callState.peerId || '')
const mode = route.query.mode || callState.mode || 'video'
const isVideo = mode === 'video'
const isInitiator = route.query.initiator === 'true'

const localVideo = ref(null)
const remoteVideo = ref(null)
let localStream = null
let pc = null

const isMuted = ref(false)
const isCameraOn = ref(isVideo)
const callStatus = ref(isInitiator ? 'calling' : 'connecting')
const callDuration = ref('00:00')
const errorMsg = ref('')
let callStartTime = null
let callTimer = null

const otherUser = ref({
  name: route.query.name || callState.peerName || 'Kondani user',
  photo: 'https://via.placeholder.com/150'
})

const rtcConfig = {
  iceServers: [
    { urls: import.meta.env.VITE_STUN_SERVER_URL || 'stun:stun.l.google.com:19302' },
    import.meta.env.VITE_TURN_SERVER_URL ? {
      urls: import.meta.env.VITE_TURN_SERVER_URL,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL
    } : null
  ].filter(Boolean)
}

const updateDuration = () => {
  if (!callStartTime) return
  const s = Math.floor((Date.now() - callStartTime) / 1000)
  callDuration.value = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const initMedia = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true })
    if (isVideo && localVideo.value) localVideo.value.srcObject = localStream
    return true
  } catch (err) {
    console.error('Media error', err)
    errorMsg.value = 'Could not access ' + (isVideo ? 'camera/microphone' : 'microphone')
    return false
  }
}

const buildPc = () => {
  pc = new RTCPeerConnection(rtcConfig)
  pc.onicecandidate = (e) => {
    if (e.candidate) socketService.sendIceCandidate({ to: peerId, candidate: e.candidate })
  }
  pc.ontrack = (e) => {
    if (remoteVideo.value) remoteVideo.value.srcObject = e.streams[0]
    callStatus.value = 'connected'
    if (!callStartTime) { callStartTime = Date.now(); callTimer = setInterval(updateDuration, 1000) }
  }
  localStream.getTracks().forEach(t => pc.addTrack(t, localStream))
}

const doCall = async () => {
  buildPc()
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  socketService.callUser({ userToCall: peerId, signalData: offer, from: myId, name: authStore.user?.name || '', mode })
}

const doAnswer = async () => {
  if (!callState.offer) { errorMsg.value = 'Call expired'; return }
  buildPc()
  await pc.setRemoteDescription(new RTCSessionDescription(callState.offer))
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  socketService.answerCall({ to: peerId, signal: answer })
}

const onAnswered = async (data) => {
  if (pc && data?.signal) await pc.setRemoteDescription(new RTCSessionDescription(data.signal))
}
const onIce = async (data) => {
  if (pc && data?.candidate) {
    try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)) } catch (e) { console.error(e) }
  }
}
const onEnded = () => endCall(true)

const toggleMic = () => {
  const t = localStream?.getAudioTracks()[0]
  if (t) { t.enabled = !t.enabled; isMuted.value = !t.enabled }
}
const toggleCamera = () => {
  const t = localStream?.getVideoTracks()[0]
  if (t) { t.enabled = !t.enabled; isCameraOn.value = t.enabled }
}

const endCall = (remote = false) => {
  if (callTimer) clearInterval(callTimer)
  localStream?.getTracks().forEach(t => t.stop())
  if (pc) { pc.close(); pc = null }
  if (!remote) socketService.emit('end_call', { to: peerId })
  clearCall()
  router.back()
}

onMounted(async () => {
  socketService.connect()
  if (myId) socketService.emit('join', myId)
  socketService.on('call_answered', onAnswered)
  socketService.on('ice_candidate', onIce)
  socketService.on('call_ended', onEnded)

  const ok = await initMedia()
  if (!ok) return
  if (isInitiator) await doCall()
  else await doAnswer()
})

onUnmounted(() => {
  socketService.off('call_answered', onAnswered)
  socketService.off('ice_candidate', onIce)
  socketService.off('call_ended', onEnded)
  if (callTimer) clearInterval(callTimer)
  localStream?.getTracks().forEach(t => t.stop())
  if (pc) { pc.close(); pc = null }
})
</script>
