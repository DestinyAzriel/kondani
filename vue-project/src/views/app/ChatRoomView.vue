<template>
  <div class="chat-room k-page flex flex-col h-screen relative overflow-hidden">
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[45%] rounded-full blur-[100px]"
           style="background: radial-gradient(circle, rgba(45,212,191,.12), transparent 70%)"></div>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between px-3 py-3 bg-night-900/80 backdrop-blur-md border-b border-white/5 z-10">
      <div class="flex items-center gap-3 min-w-0">
        <button @click="router.back()" class="p-1.5 -ml-1 text-white/70 hover:text-white"><ChevronLeftIcon size="24" /></button>
        <div class="relative flex-shrink-0">
          <img :src="mediaSrc(chatUser.photo)" class="w-10 h-10 rounded-full object-cover bg-night-800" />
          <div v-if="chatUser.online" class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lagoon-400 rounded-full border-2 border-night-900"></div>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <h1 class="k-serif text-base truncate">{{ chatUser.name || 'Chat' }}</h1>
            <BadgeCheck v-if="chatUser.isVerified" :size="14" style="color:var(--k-gold)" />
          </div>
          <span class="text-xs" :class="chatUser.online ? 'text-lagoon-300' : 'text-white/40'">{{ chatUser.online ? 'Online now' : 'Offline' }}</span>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <button @click="startCall('audio')" class="p-2.5 text-lagoon-300 bg-white/5 rounded-full hover:bg-white/10 transition-colors" title="Audio call">
          <PhoneIcon size="19" />
        </button>
        <button @click="startCall('video')" class="p-2.5 text-gold-300 bg-white/5 rounded-full hover:bg-white/10 transition-colors" title="Video call">
          <VideoIcon size="19" />
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative z-10" ref="messagesContainer">
      <div v-if="messages.length === 0 && !isLoading" class="flex flex-col items-center text-center text-white/40 text-sm pt-12 gap-3">
        <Sparkles :size="30" :stroke-width="1.5" style="color:var(--k-gold)" />
        <span>Say hello — start the conversation.</span>
      </div>

      <div v-for="msg in messages" :key="msg.id" :class="['flex flex-col max-w-[80%]', msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start']">
        <div :class="['rounded-2xl px-3.5 py-2.5', msg.isMe ? 'bg-gradient-to-br from-gold-500 to-gold-300 text-night-950 rounded-br-md' : 'bg-white/8 text-white rounded-bl-md']">
          <!-- text -->
          <p v-if="msg.messageType === 'text' || !msg.messageType" class="text-sm leading-relaxed whitespace-pre-wrap break-words">{{ msg.content }}</p>
          <!-- voice -->
          <audio v-else-if="msg.messageType === 'voice'" :src="mediaSrc(msg.mediaUrl)" controls class="max-w-[220px] h-9"></audio>
          <!-- image -->
          <img v-else-if="msg.messageType === 'image'" :src="mediaSrc(msg.mediaUrl)" class="rounded-xl max-w-[220px] max-h-[280px] object-cover" />
        </div>
        <div class="flex items-center gap-1 mt-1 px-1">
          <span class="text-[10px] text-white/35">{{ formatTime(msg.time) }}</span>
          <CheckCheckIcon v-if="msg.isMe && msg.read" size="12" class="text-lagoon-300" />
          <CheckIcon v-else-if="msg.isMe && msg.delivered" size="12" class="text-white/40" />
        </div>
      </div>

      <div v-if="otherTyping" class="flex mr-auto">
        <div class="bg-white/8 rounded-2xl rounded-bl-md px-4 py-3">
          <div class="flex gap-1">
            <div class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce"></div>
            <div class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce" style="animation-delay:.2s"></div>
            <div class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce" style="animation-delay:.4s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Composer -->
    <div class="px-3 py-3 bg-night-900/85 backdrop-blur-md border-t border-white/5 relative z-10">
      <!-- Recording bar -->
      <div v-if="isRecording" class="flex items-center gap-3">
        <button @click="cancelRecording" class="p-2 text-white/60 hover:text-[#ff7a6b]"><XIcon size="22" /></button>
        <div class="flex-1 flex items-center gap-2 bg-white/5 rounded-full px-4 py-2.5 border border-[#ff7a6b]/30">
          <span class="w-2.5 h-2.5 rounded-full bg-[#ff7a6b] animate-pulse"></span>
          <span class="text-sm text-white/80">Recording… {{ recordSeconds }}s</span>
        </div>
        <button @click="stopAndSendRecording" class="p-3 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-full" title="Send"><SendIcon size="18" /></button>
      </div>

      <!-- Normal composer -->
      <div v-else class="flex items-center gap-2">
        <div class="flex-1">
          <input
            v-model="newMessage"
            @keyup.enter="sendText"
            @input="handleTyping"
            type="text"
            placeholder="Message…"
            class="w-full bg-white/5 border border-white/10 rounded-full py-3 px-4 text-white placeholder-white/40 focus:border-lagoon-400 focus:ring-1 focus:ring-lagoon-400 outline-none transition-all"
          />
        </div>
        <button v-if="!newMessage.trim()" @click="startRecording" class="p-3 text-white/70 bg-white/5 rounded-full hover:bg-white/10 transition-all" title="Record voice note">
          <MicIcon size="20" />
        </button>
        <button v-else @click="sendText" class="p-3 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-full transition-all" title="Send">
          <SendIcon size="20" />
        </button>
      </div>
      <p v-if="recordError" class="text-xs text-[#ff7a6b] mt-2 px-2">{{ recordError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { intentService } from '@/services/intentService'
import { socketService } from '@/services/socketService'
import { useAuthStore } from '@/stores/auth'
import {
  ChevronLeft as ChevronLeftIcon, Check as CheckIcon, CheckCheck as CheckCheckIcon,
  Video as VideoIcon, Phone as PhoneIcon, Mic as MicIcon, Send as SendIcon, X as XIcon,
  BadgeCheck, Sparkles
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const API_ORIGIN = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
const mediaSrc = (u) => {
  if (!u) return 'https://via.placeholder.com/150'
  if (u.startsWith('http') || u.startsWith('blob:') || u.startsWith('data:')) return u
  return API_ORIGIN + u
}

const messagesContainer = ref(null)
const messages = ref([])
const newMessage = ref('')
const chatUser = ref({})
const isLoading = ref(true)
const otherTyping = ref(false)
const typingTimeout = ref(null)

const chatId = route.params.id
const myId = authStore.user?._id || authStore.user?.id
const recipientId = String(chatId).includes('_')
  ? String(chatId).split('_').find(id => id !== String(myId))
  : chatId

const scrollToBottom = () => nextTick(() => {
  if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
})

const formatTime = (t) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

const handleNewMessage = (message) => {
  if (String(message.chatId) !== String(chatId)) return
  messages.value.push({ ...message, isMe: false })
  scrollToBottom()
}

const handleTyping = () => {
  if (typingTimeout.value) clearTimeout(typingTimeout.value)
  intentService.setTyping(chatId, true)
  typingTimeout.value = setTimeout(() => intentService.setTyping(chatId, false), 1200)
}

onMounted(async () => {
  socketService.connect()
  if (myId) socketService.emit('join', String(myId))
  socketService.on('new_message', handleNewMessage)

  try {
    // Resolve the other person's info from the chat list
    const chatData = await intentService.getChats()
    const found = (chatData?.chats || []).find(c => String(c.id) === String(chatId))
    if (found) chatUser.value = found

    const data = await intentService.getChatMessages(chatId)
    messages.value = data?.messages || []
  } catch (e) {
    console.error('Failed to load chat', e)
    messages.value = []
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
})

onUnmounted(() => {
  socketService.off('new_message', handleNewMessage)
  if (typingTimeout.value) clearTimeout(typingTimeout.value)
  intentService.setTyping(chatId, false)
  stopTracks()
})

const relay = (message) => {
  // Real-time deliver to the other user's room
  socketService.emit('send_message', { ...message, chatId, to: String(recipientId) })
}

const sendText = async () => {
  const content = newMessage.value.trim()
  if (!content) return
  const tempId = 'tmp-' + Date.now()
  messages.value.push({ id: tempId, content, time: new Date(), isMe: true, messageType: 'text', delivered: false, read: false })
  newMessage.value = ''
  scrollToBottom()
  try {
    const res = await intentService.sendMessage(chatId, content)
    const i = messages.value.findIndex(m => m.id === tempId)
    if (i !== -1) messages.value[i] = res.message
    relay(res.message)
  } catch (e) {
    console.error('Send failed', e)
    messages.value = messages.value.filter(m => m.id !== tempId)
  }
}

/* ---- Voice notes ---- */
const isRecording = ref(false)
const recordSeconds = ref(0)
const recordError = ref('')
let mediaRecorder = null
let audioChunks = []
let micStream = null
let recordTimer = null
let cancelled = false

const stopTracks = () => {
  if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null }
  if (recordTimer) { clearInterval(recordTimer); recordTimer = null }
}

const startRecording = async () => {
  recordError.value = ''
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(micStream)
    audioChunks = []
    cancelled = false
    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data)
    mediaRecorder.onstop = async () => {
      stopTracks()
      if (cancelled) return
      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      await uploadAndSendVoice(blob)
    }
    mediaRecorder.start()
    isRecording.value = true
    recordSeconds.value = 0
    recordTimer = setInterval(() => {
      recordSeconds.value++
      if (recordSeconds.value >= 120) stopAndSendRecording() // 2 min cap
    }, 1000)
  } catch (err) {
    console.error('Mic error', err)
    recordError.value = 'Microphone access denied.'
    isRecording.value = false
  }
}

const stopAndSendRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
  isRecording.value = false
}

const cancelRecording = () => {
  cancelled = true
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
  isRecording.value = false
}

const uploadAndSendVoice = async (blob) => {
  const tempId = 'tmp-' + Date.now()
  const localUrl = URL.createObjectURL(blob)
  messages.value.push({ id: tempId, mediaUrl: localUrl, time: new Date(), isMe: true, messageType: 'voice', delivered: false, read: false })
  scrollToBottom()
  try {
    const { url } = await intentService.uploadChatMedia(blob, 'voice.webm')
    const res = await intentService.sendMessage(chatId, '', 'voice', url)
    const i = messages.value.findIndex(m => m.id === tempId)
    if (i !== -1) messages.value[i] = res.message
    relay(res.message)
  } catch (e) {
    console.error('Voice send failed', e)
    recordError.value = 'Could not send voice note.'
    messages.value = messages.value.filter(m => m.id !== tempId)
  }
}

const startCall = (mode) => {
  router.push({
    path: `/video-call/${chatId}`,
    query: { mode, name: chatUser.value.name || '', to: String(recipientId), initiator: 'true' }
  })
}
</script>
