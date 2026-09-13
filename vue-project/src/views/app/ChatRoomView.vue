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
        <div class="relative flex-shrink-0 cursor-pointer" @click="openProfilePreview">
          <img :src="mediaSrc(chatUser.photo)" class="w-10 h-10 rounded-full object-cover bg-night-800 ring-2 ring-transparent hover:ring-gold-400/50 transition-all" />
          <div v-if="chatUser.online" class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lagoon-400 rounded-full border-2 border-night-900"></div>
        </div>
        <div class="min-w-0 cursor-pointer" @click="openProfilePreview">
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
        <!-- Three-dots menu -->
        <div class="relative" ref="menuRef">
          <button @click="showMenu = !showMenu" class="p-2.5 text-white/60 bg-white/5 rounded-full hover:bg-white/10 hover:text-white transition-colors" title="More options">
            <MoreVerticalIcon size="19" />
          </button>

          <!-- Dropdown menu -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-90 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-90 -translate-y-1"
          >
            <div v-if="showMenu" class="absolute right-0 top-full mt-2 w-56 bg-night-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 backdrop-blur-xl">
              <div class="py-1.5">
                <button @click="handleMenuAction('unmatch')" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors">
                  <HeartOffIcon size="17" class="text-white/50" />
                  <span>Unmatch</span>
                </button>
                <button @click="handleMenuAction('delete')" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors">
                  <Trash2Icon size="17" class="text-white/50" />
                  <span>Delete chat</span>
                </button>
                <div class="h-px bg-white/5 mx-3 my-0.5"></div>
                <button @click="handleMenuAction('report')" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-amber-400/90 hover:bg-amber-400/5 hover:text-amber-400 transition-colors">
                  <FlagIcon size="17" class="text-amber-400/60" />
                  <span>Report</span>
                </button>
                <button @click="handleMenuAction('block')" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#ff7a6b]/90 hover:bg-[#ff7a6b]/5 hover:text-[#ff7a6b] transition-colors">
                  <ShieldOffIcon size="17" class="text-[#ff7a6b]/60" />
                  <span>Block</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative z-10" ref="messagesContainer" @click="showMenu = false">
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

    <!-- Confirmation Dialog -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="confirmDialog.show" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6" @click.self="confirmDialog.show = false">
        <div class="w-full max-w-sm bg-night-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div class="p-6 text-center">
            <div class="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4" :class="confirmDialog.type === 'danger' ? 'bg-[#ff7a6b]/10 text-[#ff7a6b]' : 'bg-amber-400/10 text-amber-400'">
              <AlertTriangleIcon size="28" />
            </div>
            <h3 class="text-lg font-bold text-white mb-2">{{ confirmDialog.title }}</h3>
            <p class="text-sm text-white/60 leading-relaxed">{{ confirmDialog.message }}</p>
          </div>
          <div class="flex border-t border-white/5">
            <button @click="confirmDialog.show = false" class="flex-1 py-3.5 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors border-r border-white/5">
              Cancel
            </button>
            <button @click="executeConfirmedAction" class="flex-1 py-3.5 text-sm font-bold transition-colors" :class="confirmDialog.type === 'danger' ? 'text-[#ff7a6b] hover:bg-[#ff7a6b]/10' : 'text-amber-400 hover:bg-amber-400/10'">
              {{ confirmDialog.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Report Dialog -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showReportDialog" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6" @click.self="showReportDialog = false">
        <div class="w-full max-w-sm bg-night-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-5">
              <div class="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <FlagIcon size="20" />
              </div>
              <h3 class="text-lg font-bold text-white">Report {{ chatUser.name }}</h3>
            </div>
            <p class="text-xs text-white/40 font-semibold uppercase tracking-wider mb-3">Select a reason</p>
            <div class="space-y-2">
              <button
                v-for="reason in reportReasons"
                :key="reason"
                @click="selectedReportReason = reason"
                class="w-full text-left px-4 py-3 rounded-xl text-sm transition-all border"
                :class="selectedReportReason === reason
                  ? 'bg-amber-400/10 border-amber-400/30 text-amber-300 font-semibold'
                  : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/8'"
              >
                {{ reason }}
              </button>
            </div>
            <textarea
              v-model="reportDescription"
              placeholder="Additional details (optional)…"
              class="w-full mt-4 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-white/30 resize-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 outline-none"
              rows="2"
            ></textarea>
          </div>
          <div class="flex border-t border-white/5">
            <button @click="showReportDialog = false" class="flex-1 py-3.5 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors border-r border-white/5">
              Cancel
            </button>
            <button
              @click="submitReport"
              :disabled="!selectedReportReason"
              class="flex-1 py-3.5 text-sm font-bold text-amber-400 hover:bg-amber-400/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Profile Preview Modal -->
    <ProfilePreviewModal
      :show="showProfilePreview"
      :user="profileUser"
      @close="showProfilePreview = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { intentService } from '@/services/intentService'
import { socketService } from '@/services/socketService'
import { useAuthStore } from '@/stores/auth'
import ProfilePreviewModal from '@/components/feature/modal/ProfilePreviewModal.vue'
import {
  ChevronLeft as ChevronLeftIcon, Check as CheckIcon, CheckCheck as CheckCheckIcon,
  Video as VideoIcon, Phone as PhoneIcon, Mic as MicIcon, Send as SendIcon, X as XIcon,
  BadgeCheck, Sparkles, MoreVertical as MoreVerticalIcon,
  HeartOff as HeartOffIcon, Trash2 as Trash2Icon, Flag as FlagIcon,
  ShieldOff as ShieldOffIcon, AlertTriangle as AlertTriangleIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

import { mediaUrl } from '@/utils/media'
const mediaSrc = (u) => mediaUrl(u)

const messagesContainer = ref(null)
const messages = ref([])
const newMessage = ref('')
const chatUser = ref({})
const isLoading = ref(true)
const otherTyping = ref(false)
const typingTimeout = ref(null)

/* ---- Three-dots menu ---- */
const showMenu = ref(false)
const menuRef = ref(null)

/* ---- Profile preview ---- */
const showProfilePreview = ref(false)
const profileUser = ref({})

/* ---- Confirm dialog ---- */
const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  confirmLabel: '',
  type: 'danger',
  action: null
})

/* ---- Report dialog ---- */
const showReportDialog = ref(false)
const selectedReportReason = ref('')
const reportDescription = ref('')
const reportReasons = [
  'Inappropriate messages',
  'Fake profile',
  'Spam or scam',
  'Harassment or bullying',
  'Underage user',
  'Other'
]

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

/* ---- Close menu on outside click ---- */
const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    showMenu.value = false
  }
}

onMounted(async () => {
  socketService.connect()
  if (myId) socketService.emit('join', String(myId))
  socketService.on('new_message', handleNewMessage)
  document.addEventListener('click', handleClickOutside)

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
  document.removeEventListener('click', handleClickOutside)
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

/* ---- Profile Preview ---- */
const openProfilePreview = async () => {
  showMenu.value = false
  try {
    const data = await intentService.getChatProfile(chatId)
    profileUser.value = data?.user || chatUser.value
  } catch (e) {
    console.warn('Could not load full profile, using chat data', e)
    profileUser.value = chatUser.value
  }
  showProfilePreview.value = true
}

/* ---- Three-dots menu actions ---- */
const handleMenuAction = (action) => {
  showMenu.value = false
  switch (action) {
    case 'unmatch':
      confirmDialog.value = {
        show: true,
        title: 'Unmatch?',
        message: `You will no longer be matched with ${chatUser.value.name || 'this person'}. This action cannot be undone.`,
        confirmLabel: 'Unmatch',
        type: 'danger',
        action: 'unmatch'
      }
      break
    case 'delete':
      confirmDialog.value = {
        show: true,
        title: 'Delete chat?',
        message: `All messages with ${chatUser.value.name || 'this person'} will be permanently deleted.`,
        confirmLabel: 'Delete',
        type: 'danger',
        action: 'delete'
      }
      break
    case 'report':
      selectedReportReason.value = ''
      reportDescription.value = ''
      showReportDialog.value = true
      break
    case 'block':
      confirmDialog.value = {
        show: true,
        title: 'Block user?',
        message: `${chatUser.value.name || 'This person'} will no longer be able to see your profile or message you.`,
        confirmLabel: 'Block',
        type: 'danger',
        action: 'block'
      }
      break
  }
}

const executeConfirmedAction = async () => {
  const action = confirmDialog.value.action
  confirmDialog.value.show = false
  try {
    if (action === 'unmatch') {
      await intentService.unmatchUser(chatId)
      router.replace('/chats')
    } else if (action === 'delete') {
      await intentService.deleteChat(chatId)
      router.replace('/chats')
    } else if (action === 'block') {
      await intentService.blockUser(recipientId)
      router.replace('/chats')
    }
  } catch (e) {
    console.error(`${action} failed`, e)
  }
}

const submitReport = async () => {
  if (!selectedReportReason.value) return
  showReportDialog.value = false
  try {
    await intentService.reportUser(recipientId, selectedReportReason.value, reportDescription.value)
  } catch (e) {
    console.error('Report failed', e)
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

    // Pick the best supported MIME type for recording
    const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
    let mimeType = ''
    for (const mt of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mt)) { mimeType = mt; break }
    }

    mediaRecorder = mimeType
      ? new MediaRecorder(micStream, { mimeType })
      : new MediaRecorder(micStream)

    audioChunks = []
    cancelled = false
    mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) audioChunks.push(e.data) }
    mediaRecorder.onstop = async () => {
      stopTracks()
      if (cancelled) return
      const recordedType = mediaRecorder.mimeType || mimeType || 'audio/webm'
      const blob = new Blob(audioChunks, { type: recordedType })
      const ext = recordedType.includes('mp4') ? 'mp4' : recordedType.includes('ogg') ? 'ogg' : 'webm'
      await uploadAndSendVoice(blob, `voice.${ext}`)
    }
    mediaRecorder.onerror = (e) => {
      console.error('MediaRecorder error', e)
      recordError.value = 'Recording failed. Please try again.'
      isRecording.value = false
      stopTracks()
    }
    mediaRecorder.start(250) // collect in 250ms chunks for reliability
    isRecording.value = true
    recordSeconds.value = 0
    recordTimer = setInterval(() => {
      recordSeconds.value++
      if (recordSeconds.value >= 120) stopAndSendRecording() // 2 min cap
    }, 1000)
  } catch (err) {
    console.error('Mic error', err)
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      recordError.value = 'Microphone permission denied. Please allow microphone access in your browser settings.'
    } else if (err.name === 'NotFoundError') {
      recordError.value = 'No microphone found on this device.'
    } else {
      recordError.value = 'Could not access microphone. Please check your device settings.'
    }
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

const uploadAndSendVoice = async (blob, filename = 'voice.webm') => {
  const tempId = 'tmp-' + Date.now()
  const localUrl = URL.createObjectURL(blob)
  messages.value.push({ id: tempId, mediaUrl: localUrl, time: new Date(), isMe: true, messageType: 'voice', delivered: false, read: false })
  scrollToBottom()
  try {
    const { url } = await intentService.uploadChatMedia(blob, filename)
    const res = await intentService.sendMessage(chatId, '', 'voice', url)
    const i = messages.value.findIndex(m => m.id === tempId)
    if (i !== -1) messages.value[i] = res.message
    relay(res.message)
  } catch (e) {
    console.error('Voice send failed', e)
    recordError.value = 'Could not send voice note. Please try again.'
    messages.value = messages.value.filter(m => m.id !== tempId)
  }
}

const startCall = (mode) => {
  router.push({
    path: `/video-call/${chatId}`,
    query: { mode, name: chatUser.value.name || '', photo: chatUser.value.photo || '', to: String(recipientId), initiator: 'true' }
  })
}
</script>
