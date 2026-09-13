<template>
  <div class="call-view h-screen bg-night-950 text-white relative overflow-hidden select-none">
    <div class="absolute inset-0 bg-gradient-to-br from-night-900 via-night-950 to-black"></div>

    <!-- Hidden audio element ensures audio output pipeline is always active even if video is hidden -->
    <audio ref="remoteAudio" autoplay playsinline class="hidden"></audio>

    <!-- Remote video (also carries remote audio for video calls) -->
    <video ref="remoteVideo" autoplay playsinline
           class="w-full h-full object-cover relative z-10"
           :class="{ 'opacity-0': !isVideo || callStatus !== 'connected' }"></video>

    <!-- Audio-call / connecting backdrop -->
    <div v-if="!isVideo || callStatus !== 'connected'"
         class="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
      <div class="relative mb-7">
        <div class="absolute inset-0 rounded-full blur-2xl animate-pulse"
             style="background: rgba(45,212,191,.25)"></div>
        <img :src="mediaUrl(otherUser.photo)" class="relative w-32 h-32 rounded-full object-cover border-4 border-lagoon-400 shadow-2xl mx-auto" />
      </div>
      <h2 class="text-3xl font-bold font-display mb-2">{{ otherUser.name }}</h2>
      <p class="text-white/70 text-lg font-medium">
        <span v-if="callStatus === 'connected'" class="text-lagoon-300 font-mono">{{ callDuration }}</span>
        <span v-else-if="callStatus === 'calling'" class="animate-pulse">Calling…</span>
        <span v-else-if="callStatus === 'reconnecting'" class="text-amber-400 animate-pulse">Reconnecting…</span>
        <span v-else class="animate-pulse">Connecting…</span>
      </p>
      <p class="text-lagoon-400/80 text-sm mt-1 uppercase tracking-wider font-semibold">
        {{ isVideo ? 'Video Call' : 'Voice Call' }}
      </p>
    </div>

    <!-- Local video PiP (video calls only) -->
    <div v-if="isVideo" class="absolute top-6 right-6 w-28 h-44 bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 z-30">
      <video ref="localVideo" autoplay playsinline muted class="w-full h-full object-cover transform scale-x-[-1]"></video>
      <div v-if="!isCameraOn" class="absolute inset-0 bg-night-900 flex items-center justify-center text-white/50 text-xs">Camera off</div>
    </div>

    <!-- Controls -->
    <div class="absolute bottom-8 left-0 right-0 flex justify-center z-30 px-4">
      <div class="bg-black/50 backdrop-blur-xl rounded-full px-6 py-4 border border-white/10 shadow-2xl flex items-center gap-5">
        <button @click="toggleMic"
                :class="['p-4 rounded-full transition-all shadow-md', isMuted ? 'bg-white text-night-950' : 'bg-white/10 text-white hover:bg-white/20']"
                :title="isMuted ? 'Unmute microphone' : 'Mute microphone'">
          <MicOffIcon v-if="isMuted" size="22" /><MicIcon v-else size="22" />
        </button>

        <button @click="() => endCall(false)" class="p-5 rounded-full bg-gradient-to-br from-[#ff5e5e] to-[#e23b3b] text-white hover:scale-105 active:scale-95 transition-all shadow-xl" title="End call">
          <PhoneOffIcon size="26" class="stroke-[2.5]" />
        </button>

        <button v-if="isVideo" @click="toggleCamera"
                :class="['p-4 rounded-full transition-all shadow-md', !isCameraOn ? 'bg-white text-night-950' : 'bg-white/10 text-white hover:bg-white/20']"
                :title="!isCameraOn ? 'Turn camera on' : 'Turn camera off'">
          <VideoOffIcon v-if="!isCameraOn" size="22" /><VideoIcon v-else size="22" />
        </button>
      </div>
    </div>

    <!-- Interactive Media Permission / Status Banner -->
    <div v-if="errorMsg" class="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-night-900/95 border border-amber-500/40 px-5 py-3.5 rounded-2xl text-sm text-white shadow-2xl backdrop-blur-xl text-center max-w-md w-[92%] flex flex-col items-center gap-2">
      <div class="flex items-center gap-1.5 text-amber-300 font-semibold text-xs tracking-wider uppercase">
        <LockIcon size="14" />
        <span>Microphone / Audio Status</span>
      </div>
      <p class="text-xs text-white/85 leading-relaxed">{{ errorMsg }}</p>
      <div class="flex items-center gap-2 mt-1">
        <button v-if="permissionBlocked" @click="requestMicrophoneAccess" class="px-3.5 py-1.5 bg-lagoon-500 hover:bg-lagoon-400 text-night-950 font-bold text-xs rounded-lg transition-all shadow-md active:scale-95">
          Allow Microphone
        </button>
        <button @click="errorMsg = ''" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-all">
          Dismiss
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Video as VideoIcon,
  VideoOff as VideoOffIcon,
  PhoneOff as PhoneOffIcon,
  Lock as LockIcon
} from 'lucide-vue-next'
import { socketService } from '@/services/socketService'
import { mediaUrl } from '@/utils/media'
import { useAuthStore } from '@/stores/auth'
import { callState, clearCall } from '@/services/callState'
import { playOutgoingDialing, playCallEnded, stopCallSounds } from '@/utils/callSounds'

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
const remoteAudio = ref(null)
let localStream = null
let pc = null

const isMuted = ref(false)
const isCameraOn = ref(isVideo)
const callStatus = ref(isInitiator ? 'calling' : 'connecting')
const callDuration = ref('00:00')
const errorMsg = ref('')
const permissionBlocked = ref(false)
let isRealMicActive = false
let callStartTime = null
let callTimer = null

// ICE Candidate Queuing to eliminate race conditions
const candidateQueue = []
let isRemoteDescriptionSet = false

const otherUser = ref({
  name: route.query.name || callState.peerName || 'Kondani user',
  photo: route.query.photo || callState.peerPhoto || 'https://via.placeholder.com/150'
})

// WebRTC STUN/TURN configuration
// Eliminates dead server IPs (e.g. 54.206.117.205) and provides redundant high-availability relays
const isDeadHost = (url) => !url || url.includes('54.206.117.205')

const envStun = import.meta.env.VITE_STUN_SERVER_URL
const envTurn = import.meta.env.VITE_TURN_SERVER_URL

const rtcConfig = {
  iceServers: [
    // 1. Google Global STUN servers (Fastest, 100% reliable)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },

    // 2. High-Availability TURN relay on standard ports 80 & 443 (Permits mobile & symmetric NAT calls)
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },

    // 3. Dedicated VPS coturn
    {
      urls: [
        'turn:kondani.duckdns.org:3478',
        'stun:kondani.duckdns.org:3478'
      ],
      username: 'kondani',
      credential: 'Kondani2026TurnSecureKey'
    },

    // 4. Custom env servers if provided and not pointing to dead host
    (!isDeadHost(envStun) && envStun) ? { urls: envStun } : null,
    (!isDeadHost(envTurn) && envTurn) ? {
      urls: envTurn,
      username: import.meta.env.VITE_TURN_USERNAME || '',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || ''
    } : null
  ].filter(Boolean)
}

const updateDuration = () => {
  if (!callStartTime) return
  const s = Math.floor((Date.now() - callStartTime) / 1000)
  callDuration.value = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function createSilentAudioTrack() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return null
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const dst = ctx.createMediaStreamDestination()
    osc.connect(dst)
    osc.start()
    const track = dst.stream.getAudioTracks()[0]
    track.enabled = false
    return track
  } catch (e) {
    return null
  }
}

function createDummyVideoTrack() {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 240
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#0a0d14'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const stream = canvas.captureStream ? canvas.captureStream(5) : null
    return stream ? stream.getVideoTracks()[0] : null
  } catch (e) {
    return null
  }
}

const handleMediaError = (err) => {
  console.warn('Microphone/Camera error details:', err.name, err.message)
  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
    permissionBlocked.value = true
    errorMsg.value = 'Microphone permission blocked in browser. Click the lock/tune icon (🔒) in your address bar and toggle Microphone to Allow.'
  } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
    errorMsg.value = 'No microphone detected on your device. Joining call in listen-only mode.'
  } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
    errorMsg.value = 'Microphone is currently in use by another application. Joining in listen-only mode.'
  } else {
    errorMsg.value = 'Microphone unavailable (' + (err.name || 'error') + '). Joining in listen-only mode.'
  }
}

const initMedia = async () => {
  localStream = new MediaStream()

  if (isVideo) {
    // 1. Try full video + audio
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getTracks().forEach(t => localStream.addTrack(t))
      if (localVideo.value) localVideo.value.srcObject = localStream
      isRealMicActive = true
      isMuted.value = false
      return true
    } catch (err) {
      console.warn('Full media access failed, trying separate camera and mic...', err)
    }

    // 2. Try camera only
    try {
      const vStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      vStream.getVideoTracks().forEach(t => localStream.addTrack(t))
      if (localVideo.value) localVideo.value.srcObject = localStream
      isCameraOn.value = true
    } catch (vErr) {
      console.warn('Camera failed:', vErr)
      isCameraOn.value = false
      const dummyV = createDummyVideoTrack()
      if (dummyV) localStream.addTrack(dummyV)
    }

    // 3. Try microphone only
    try {
      const aStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      aStream.getAudioTracks().forEach(t => localStream.addTrack(t))
      isRealMicActive = true
      isMuted.value = false
    } catch (aErr) {
      console.warn('Mic failed:', aErr)
      handleMediaError(aErr)
      const silentAudio = createSilentAudioTrack()
      if (silentAudio) localStream.addTrack(silentAudio)
      isRealMicActive = false
      isMuted.value = true
    }

    return true
  } else {
    // Audio-only call
    try {
      const aStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      aStream.getAudioTracks().forEach(t => localStream.addTrack(t))
      isRealMicActive = true
      isMuted.value = false
      return true
    } catch (err) {
      console.warn('Audio call mic failed:', err)
      handleMediaError(err)
      const silentAudio = createSilentAudioTrack()
      if (silentAudio) localStream.addTrack(silentAudio)
      isRealMicActive = false
      isMuted.value = true
      return true
    }
  }
}

const requestMicrophoneAccess = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const realAudioTrack = stream.getAudioTracks()[0]
    if (realAudioTrack && localStream) {
      const oldTracks = localStream.getAudioTracks()
      oldTracks.forEach(t => {
        localStream.removeTrack(t)
        t.stop()
      })
      localStream.addTrack(realAudioTrack)

      // Replace track on peer connection senders
      if (pc) {
        const senders = pc.getSenders()
        const sender = senders.find(s => s.track && s.track.kind === 'audio')
        if (sender) {
          await sender.replaceTrack(realAudioTrack)
        }
      }

      isRealMicActive = true
      isMuted.value = false
      permissionBlocked.value = false
      errorMsg.value = ''
    }
  } catch (err) {
    console.warn('Re-request microphone error:', err)
    errorMsg.value = 'Still blocked. In Chrome/Edge, click the lock (🔒) or tune icon left of the website URL → switch Microphone to "Allow" → tap Allow Microphone again.'
  }
}

const queueOrAddIce = async (candidate) => {
  if (!candidate) return
  if (!pc || !isRemoteDescriptionSet) {
    candidateQueue.push(candidate)
    return
  }
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate))
  } catch (e) {
    console.warn('Could not add ICE candidate:', e)
  }
}

const flushCandidates = async () => {
  while (candidateQueue.length > 0) {
    const c = candidateQueue.shift()
    try {
      await pc.addIceCandidate(new RTCIceCandidate(c))
    } catch (e) {
      console.warn('Could not flush ICE candidate:', e)
    }
  }
}

const buildPc = () => {
  if (pc) {
    try { pc.close() } catch (e) {}
  }
  pc = new RTCPeerConnection(rtcConfig)

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socketService.sendIceCandidate({ to: peerId, candidate: e.candidate, from: myId })
    }
  }

  pc.ontrack = (e) => {
    const stream = e.streams && e.streams[0] ? e.streams[0] : new MediaStream([e.track])
    if (remoteVideo.value) {
      remoteVideo.value.srcObject = stream
      remoteVideo.value.play().catch(err => console.log('Video play policy info:', err))
    }
    if (remoteAudio.value) {
      remoteAudio.value.srcObject = stream
      remoteAudio.value.play().catch(err => console.log('Audio play policy info:', err))
    }
    callStatus.value = 'connected'
    stopCallSounds()
    if (!callStartTime) {
      callStartTime = Date.now()
      callTimer = setInterval(updateDuration, 1000)
    }
  }

  pc.oniceconnectionstatechange = () => {
    const state = pc.iceConnectionState
    console.log('WebRTC ICE Connection State:', state)
    if (state === 'connected' || state === 'completed') {
      callStatus.value = 'connected'
      stopCallSounds()
      if (!callStartTime) {
        callStartTime = Date.now()
        callTimer = setInterval(updateDuration, 1000)
      }
    } else if (state === 'disconnected') {
      callStatus.value = 'reconnecting'
    } else if (state === 'failed') {
      if (isInitiator && pc.restartIce) {
        console.log('Attempting restartIce...')
        pc.restartIce()
      } else {
        errorMsg.value = 'Connection failed. Please check network.'
      }
    }
  }

  if (localStream) {
    localStream.getTracks().forEach(t => pc.addTrack(t, localStream))
  }
}

const doCall = async () => {
  buildPc()
  playOutgoingDialing()
  const offer = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: isVideo
  })
  await pc.setLocalDescription(offer)
  socketService.callUser({
    userToCall: peerId,
    signalData: offer,
    from: myId,
    name: authStore.user?.name || '',
    photo: authStore.user?.photos?.[0] || '',
    mode
  })
}

const doAnswer = async () => {
  if (!callState.offer) {
    errorMsg.value = 'Call expired or unreachable.'
    setTimeout(() => router.back(), 2500)
    return
  }
  buildPc()
  await pc.setRemoteDescription(new RTCSessionDescription(callState.offer))
  isRemoteDescriptionSet = true

  // Transfer any early gathered candidates preserved by AppLayout
  if (callState.pendingCandidates && callState.pendingCandidates.length > 0) {
    callState.pendingCandidates.forEach(c => candidateQueue.push(c))
    callState.pendingCandidates = []
  }
  await flushCandidates()

  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  socketService.answerCall({ to: peerId, signal: answer })
}

const onAnswered = async (data) => {
  stopCallSounds()
  if (pc && data?.signal) {
    await pc.setRemoteDescription(new RTCSessionDescription(data.signal))
    isRemoteDescriptionSet = true
    await flushCandidates()
  }
}

const onIce = async (data) => {
  if (data?.candidate) {
    await queueOrAddIce(data.candidate)
  }
}

const onEnded = () => {
  playCallEnded()
  endCall(true)
}

const toggleMic = () => {
  if (!isRealMicActive) {
    // If on dummy silent track, request mic access on user click
    requestMicrophoneAccess()
    return
  }
  const t = localStream?.getAudioTracks()[0]
  if (t) {
    t.enabled = !t.enabled
    isMuted.value = !t.enabled
  }
}

const toggleCamera = () => {
  const t = localStream?.getVideoTracks()[0]
  if (t) {
    t.enabled = !t.enabled
    isCameraOn.value = t.enabled
  }
}

const endCall = (remote = false) => {
  stopCallSounds()
  if (callTimer) clearInterval(callTimer)
  localStream?.getTracks().forEach(t => t.stop())
  if (pc) {
    pc.close()
    pc = null
  }
  if (!remote && peerId) {
    socketService.emit('end_call', { to: peerId })
  }
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
  if (isInitiator) {
    await doCall()
  } else {
    await doAnswer()
  }
})

onUnmounted(() => {
  stopCallSounds()
  socketService.off('call_answered', onAnswered)
  socketService.off('ice_candidate', onIce)
  socketService.off('call_ended', onEnded)
  if (callTimer) clearInterval(callTimer)
  localStream?.getTracks().forEach(t => t.stop())
  if (pc) {
    pc.close()
    pc = null
  }
})
</script>
