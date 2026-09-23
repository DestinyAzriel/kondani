<template>
  <div class="chat-room k-page flex flex-col h-screen relative overflow-hidden">
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[45%] rounded-full blur-[100px]"
           style="background: radial-gradient(circle, rgba(45,212,191,.12), transparent 70%)"></div>
    </div>

    <!-- Header (high z-index so dropdown sits above messages) -->
    <div class="flex items-center justify-between px-3 py-3 bg-[#0c1822] border-b border-white/10 relative z-30 shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <button @click="router.back()" class="p-1.5 -ml-1 text-white/70 hover:text-white"><ChevronLeftIcon size="24" /></button>
        <div class="relative flex-shrink-0 cursor-pointer group" @click="openProfilePreview">
          <img :src="mediaSrc(chatUser.photo)" class="w-10 h-10 rounded-full object-cover bg-night-800 ring-2 ring-transparent group-hover:ring-gold-400 transition-all" />
          <div v-if="chatUser.online" class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lagoon-400 rounded-full border-2 border-night-900"></div>
        </div>
        <div class="min-w-0 cursor-pointer" @click="openProfilePreview">
          <div class="flex items-center gap-1.5">
            <h1 class="k-serif text-base truncate hover:text-gold-300 transition-colors">{{ chatUser.name || 'Chat' }}</h1>
            <BadgeCheck v-if="chatUser.isVerified" :size="14" style="color:var(--k-gold)" />
          </div>
          <span v-if="otherTyping" class="text-xs text-lagoon-300 font-medium animate-pulse flex items-center gap-1">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-lagoon-400 animate-ping"></span>
            typing…
          </span>
          <span v-else class="text-xs" :class="chatUser.online ? 'text-lagoon-300' : 'text-white/40'">{{ chatUser.online ? 'Online now' : 'Offline' }}</span>
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
          <button
            @click.stop="showMenu = !showMenu"
            class="p-2.5 text-white/70 bg-white/5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
            :class="{ 'bg-white/15 text-white': showMenu }"
            title="More options"
          >
            <MoreVerticalIcon size="19" />
          </button>

          <!-- Dropdown menu -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-90 -translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-90 -translate-y-2"
          >
            <div
              v-if="showMenu"
              @click.stop
              class="absolute right-0 top-full mt-2 w-60 bg-[#0e1f29] border border-white/15 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden z-50 p-1.5"
            >
              <div class="space-y-0.5">
                <button
                  @click.stop="handleMenuAction('unmatch')"
                  class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-white/90 hover:bg-white/10 active:bg-white/15 transition-all group cursor-pointer text-left"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <HeartOffIcon size="16" />
                    </div>
                    <div>
                      <span class="font-medium block leading-snug">Unmatch</span>
                      <span class="text-[11px] text-white/40 block">Remove connection</span>
                    </div>
                  </div>
                  <ChevronRightIcon size="14" class="text-white/30 group-hover:text-white/70 transition-colors" />
                </button>

                <button
                  @click.stop="handleMenuAction('delete')"
                  class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-white/90 hover:bg-white/10 active:bg-white/15 transition-all group cursor-pointer text-left"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Trash2Icon size="16" />
                    </div>
                    <div>
                      <span class="font-medium block leading-snug">Delete chat</span>
                      <span class="text-[11px] text-white/40 block">Clear message history</span>
                    </div>
                  </div>
                  <ChevronRightIcon size="14" class="text-white/30 group-hover:text-white/70 transition-colors" />
                </button>

                <div class="h-px bg-white/10 mx-2 my-1"></div>

                <button
                  @click.stop="handleMenuAction('report')"
                  class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-amber-300 hover:bg-amber-400/10 active:bg-amber-400/15 transition-all group cursor-pointer text-left"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FlagIcon size="16" />
                    </div>
                    <div>
                      <span class="font-medium block leading-snug">Report</span>
                      <span class="text-[11px] text-amber-400/50 block">Flag safety concerns</span>
                    </div>
                  </div>
                  <ChevronRightIcon size="14" class="text-amber-400/40 group-hover:text-amber-400 transition-colors" />
                </button>

                <button
                  @click.stop="handleMenuAction('block')"
                  class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-[#ff7a6b] hover:bg-[#ff7a6b]/10 active:bg-[#ff7a6b]/15 transition-all group cursor-pointer text-left"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-[#ff7a6b]/20 text-[#ff7a6b] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShieldOffIcon size="16" />
                    </div>
                    <div>
                      <span class="font-medium block leading-snug">Block</span>
                      <span class="text-[11px] text-[#ff7a6b]/50 block">Prevent future contact</span>
                    </div>
                  </div>
                  <ChevronRightIcon size="14" class="text-[#ff7a6b]/40 group-hover:text-[#ff7a6b] transition-colors" />
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Messages Container (stacked below header) -->
    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative z-10" ref="messagesContainer" @click="showMenu = false">
      <div v-if="messages.length === 0 && !isLoading" class="flex flex-col items-center text-center text-white/40 text-sm pt-12 gap-3">
        <Sparkles :size="30" :stroke-width="1.5" style="color:var(--k-gold)" />
        <span>Say hello — start the conversation.</span>
      </div>

      <div v-for="msg in messages" :key="msg.id" :class="['flex flex-col max-w-[85%]', msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start']">
        <!-- Missed / Outgoing Call Card (WhatsApp Style) -->
        <div v-if="msg.messageType === 'missed_voice_call' || msg.messageType === 'missed_video_call'"
             class="rounded-2xl p-3 border transition-all shadow-lg min-w-[220px] max-w-[280px]"
             :class="msg.isMe 
               ? 'bg-white/[0.07] border-white/10 text-white rounded-br-md' 
               : 'bg-rose-950/40 border-rose-500/30 text-white rounded-bl-md'">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                 :class="msg.isMe ? 'bg-white/10 text-white/70' : 'bg-rose-500/20 text-rose-400'">
              <component :is="msg.isMe ? (msg.messageType === 'missed_video_call' ? VideoIcon : PhoneOutgoingIcon) : (msg.messageType === 'missed_video_call' ? VideoOffIcon : PhoneMissedIcon)" size="20" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold leading-tight truncate"
                 :class="msg.isMe ? 'text-white/90' : 'text-rose-300'">
                {{ msg.isMe ? (msg.messageType === 'missed_video_call' ? 'Outgoing video call' : 'Outgoing voice call') : (msg.messageType === 'missed_video_call' ? 'Missed video call' : 'Missed voice call') }}
              </p>
              <p class="text-[11px] text-white/50 mt-0.5">
                {{ msg.isMe ? 'No answer' : 'Tap to call back' }}
              </p>
            </div>
          </div>
          
          <div class="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
            <span class="text-[10.5px] text-white/40 font-mono">{{ formatTime(msg.time) }}</span>
            <button @click.stop="startCall(msg.messageType === 'missed_video_call' ? 'video' : 'audio')"
                    class="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    :class="msg.isMe ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-rose-500/25 hover:bg-rose-500/35 text-rose-200 border border-rose-500/30'">
              <component :is="msg.messageType === 'missed_video_call' ? VideoIcon : PhoneIcon" size="12" />
              <span>{{ msg.isMe ? 'Call again' : 'Call back' }}</span>
            </button>
          </div>
        </div>

        <!-- Normal message bubble (text, voice, image) -->
        <div v-else :class="['rounded-2xl px-3.5 py-2.5', msg.isMe ? 'bg-gradient-to-br from-gold-500 to-gold-300 text-night-950 rounded-br-md' : 'bg-white/8 text-white rounded-bl-md']">
          <!-- text -->
          <p v-if="msg.messageType === 'text' || !msg.messageType" class="text-sm leading-relaxed whitespace-pre-wrap break-words">{{ msg.content }}</p>
          <!-- voice -->
          <audio v-else-if="msg.messageType === 'voice'" :src="mediaSrc(msg.mediaUrl)" controls class="max-w-[220px] h-9"></audio>
          <!-- image -->
          <img v-else-if="msg.messageType === 'image'" :src="mediaSrc(msg.mediaUrl)" class="rounded-xl max-w-[220px] max-h-[280px] object-cover" />
        </div>

        <div v-if="msg.messageType !== 'missed_voice_call' && msg.messageType !== 'missed_video_call'" class="flex items-center gap-1.5 mt-1 px-1">
          <span class="text-[10px] text-white/35">{{ formatTime(msg.time) }}</span>
          <span v-if="msg.isMe" class="inline-flex items-center">
            <!-- Double Blue/Cyan Ticks: Read -->
            <CheckCheckIcon v-if="msg.read" size="14" class="text-sky-400 stroke-[2.5]" title="Read" />
            <!-- Double Gray Ticks: Delivered -->
            <CheckCheckIcon v-else-if="msg.delivered" size="14" class="text-white/55 stroke-2" title="Delivered" />
            <!-- Single Gray Tick: Sent to server (recipient offline) -->
            <CheckIcon v-else size="13" class="text-white/40 stroke-2" title="Sent" />
          </span>
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

    <!-- Teleport Dialogs to body so they are never clipped -->
    <Teleport to="body">
      <!-- Confirmation Dialog -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="confirmDialog.show" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm px-6" @click.self="confirmDialog.show = false">
          <div class="w-full max-w-sm bg-[#0e1f29] border border-white/15 rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
            <div class="p-6 text-center">
              <div class="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4" :class="confirmDialog.type === 'danger' ? 'bg-[#ff7a6b]/15 text-[#ff7a6b]' : 'bg-amber-400/15 text-amber-400'">
                <AlertTriangleIcon size="28" />
              </div>
              <h3 class="text-lg font-bold text-white mb-2">{{ confirmDialog.title }}</h3>
              <p class="text-sm text-white/60 leading-relaxed">{{ confirmDialog.message }}</p>
            </div>
            <div class="flex border-t border-white/10">
              <button @click="confirmDialog.show = false" class="flex-1 py-3.5 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors border-r border-white/10 cursor-pointer">
                Cancel
              </button>
              <button @click="executeConfirmedAction" class="flex-1 py-3.5 text-sm font-bold transition-colors cursor-pointer" :class="confirmDialog.type === 'danger' ? 'text-[#ff7a6b] hover:bg-[#ff7a6b]/10' : 'text-amber-400 hover:bg-amber-400/10'">
                {{ confirmDialog.confirmLabel }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Report Dialog -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showReportDialog" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm px-6" @click.self="showReportDialog = false">
          <div class="w-full max-w-sm bg-[#0e1f29] border border-white/15 rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
            <div class="p-6">
              <div class="flex items-center gap-3 mb-5">
                <div class="p-2.5 rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/20">
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
                  class="w-full text-left px-4 py-3 rounded-xl text-sm transition-all border cursor-pointer"
                  :class="selectedReportReason === reason
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 font-semibold'
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
            <div class="flex border-t border-white/10">
              <button @click="showReportDialog = false" class="flex-1 py-3.5 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors border-r border-white/10 cursor-pointer">
                Cancel
              </button>
              <button
                @click="submitReport"
                :disabled="!selectedReportReason"
                class="flex-1 py-3.5 text-sm font-bold text-amber-400 hover:bg-amber-400/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Profile Preview Modal -->
    <ProfilePreviewModal
      :show="showProfilePreview"
      :user="profileUser"
      @close="showProfilePreview = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { intentService } from '@/services/intentService'
import { socketService } from '@/services/socketService'
import { useAuthStore } from '@/stores/auth'
import ProfilePreviewModal from '@/components/feature/modal/ProfilePreviewModal.vue'
import {
  ChevronLeft as ChevronLeftIcon, Check as CheckIcon, CheckCheck as CheckCheckIcon,
  Video as VideoIcon, Phone as PhoneIcon, Mic as MicIcon, Send as SendIcon, X as XIcon,
  PhoneMissed as PhoneMissedIcon, PhoneOutgoing as PhoneOutgoingIcon, VideoOff as VideoOffIcon,
  BadgeCheck, Sparkles, MoreVertical as MoreVerticalIcon,
  HeartOff as HeartOffIcon, Trash2 as Trash2Icon, Flag as FlagIcon,
  ShieldOff as ShieldOffIcon, AlertTriangle as AlertTriangleIcon, ChevronRight as ChevronRightIcon
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

const chatId = computed(() => String(route.params.id || ''))

const getMyId = () => {
  if (authStore.user?._id) return String(authStore.user._id)
  if (authStore.user?.id) return String(authStore.user.id)
  try {
    const raw = localStorage.getItem('kondani_user')
    if (raw) {
      const u = JSON.parse(raw)
      return String(u._id || u.id || '')
    }
  } catch (_) {}
  return ''
}

const myId = computed(() => getMyId())

const recipientId = computed(() => {
  const cId = chatId.value
  const mId = myId.value
  if (cId.includes('_')) {
    const parts = cId.split('_')
    const other = parts.find(id => id && id !== mId)
    return other || parts[0]
  }
  return cId
})

const scrollToBottom = () => nextTick(() => {
  if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
})

const formatTime = (t) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
const otherTypingTimer = ref(null)

const clearSidebarUnread = () => {
  try {
    const rId = String(recipientId.value || '')
    const cId = String(chatId.value || '')
    ;['kondani_chats', 'kondani_desktop_chats'].forEach(key => {
      const stored = localStorage.getItem(key)
      if (stored) {
        const arr = JSON.parse(stored)
        if (Array.isArray(arr)) {
          let updated = false
          arr.forEach(c => {
            const match = String(c.id) === cId ||
                          (c.userId && String(c.userId) === rId) ||
                          (typeof c.id === 'string' && (c.id.includes(rId) || c.id.includes(cId)))
            if (match) {
              c.unread = false
              c.yourTurn = false
              updated = true
            }
          })
          if (updated) {
            localStorage.setItem(key, JSON.stringify(arr))
          }
        }
      }
    })
    window.dispatchEvent(new CustomEvent('kondani:chats_changed', { detail: { chatId: chatId.value } }))
  } catch (e) {}
}

const updateSidebarLastMessage = (content) => {
  try {
    const rId = String(recipientId.value || '')
    const cId = String(chatId.value || '')
    ;['kondani_chats', 'kondani_desktop_chats'].forEach(key => {
      const stored = localStorage.getItem(key)
      if (stored) {
        let arr = JSON.parse(stored)
        if (Array.isArray(arr)) {
          const idx = arr.findIndex(c => 
            String(c.id) === cId || 
            (c.userId && String(c.userId) === rId) ||
            (typeof c.id === 'string' && (c.id.includes(rId) || c.id.includes(cId)))
          )
          if (idx !== -1) {
            const chat = arr[idx]
            chat.lastMessage = content
            chat.lastMessageFromMe = true
            chat.lastMessageTime = new Date().toISOString()
            chat.unread = false
            chat.yourTurn = false
            chat.lastMessageDelivered = true
            chat.lastMessageRead = false
            arr.splice(idx, 1)
            arr.unshift(chat)
            localStorage.setItem(key, JSON.stringify(arr))
          }
        }
      }
    })
    window.dispatchEvent(new CustomEvent('kondani:chats_changed', { detail: { chatId: chatId.value } }))
  } catch (e) {}
}

const handleNewMessage = (message) => {
  if (String(message.chatId) !== String(chatId)) return
  const isMe = Boolean(message.isMe || String(message.sender || message.from) === String(myId))
  messages.value.push({ ...message, isMe })

  if (!isMe) {
    // When the other party messages or replies, previous sent messages are delivered & read!
    messages.value.forEach(m => {
      if (m.isMe) {
        m.delivered = true
        m.read = true
      }
    })
  }

  scrollToBottom()
  // Recipient is actively inside this room — immediately notify sender of read status!
  socketService.emit('mark_read', { chatId, readerId: String(myId), senderId: String(recipientId) })
  clearSidebarUnread()
}

const handleMessageDelivered = ({ messageId, chatId: cId }) => {
  if (String(cId) !== String(chatId)) return
  const msg = messages.value.find(m => String(m.id) === String(messageId))
  if (msg) msg.delivered = true
  else {
    const lastSent = [...messages.value].reverse().find(m => m.isMe)
    if (lastSent) lastSent.delivered = true
  }
}

const handleMessagesRead = ({ chatId: cId }) => {
  if (String(cId) !== String(chatId)) return
  messages.value.forEach(m => {
    if (m.isMe) {
      m.read = true
      m.delivered = true
    }
  })
}

const handleUserTyping = (data) => {
  if (String(data?.chatId) !== String(chatId) || String(data?.from) !== String(recipientId)) return
  otherTyping.value = !!data.isTyping
  if (data.isTyping) {
    scrollToBottom()
    if (otherTypingTimer.value) clearTimeout(otherTypingTimer.value)
    otherTypingTimer.value = setTimeout(() => { otherTyping.value = false }, 3500)
  }
}

const handleTyping = () => {
  if (typingTimeout.value) clearTimeout(typingTimeout.value)
  socketService.emit('typing', { chatId, to: String(recipientId), from: String(myId), isTyping: true })
  intentService.setTyping(chatId, true).catch(() => {})
  typingTimeout.value = setTimeout(() => {
    socketService.emit('typing', { chatId, to: String(recipientId), from: String(myId), isTyping: false })
    intentService.setTyping(chatId, false).catch(() => {})
  }, 1800)
}

const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    showMenu.value = false
  }
}

const handleUserStatus = ({ userId, isOnline }) => {
  if (String(chatUser.value?.userId) === String(userId) || String(recipientId.value) === String(userId)) {
    chatUser.value = { ...chatUser.value, online: isOnline }
  }
}

async function loadChat() {
  const cId = chatId.value
  const rId = recipientId.value
  if (!cId) return
  isLoading.value = true

  const matchUser = (c) => {
    if (!c) return false
    const cid = String(c.id || '')
    const uid = String(c.userId || '')
    return cid === cId || uid === cId || uid === rId || (cid && cId.includes(cid)) || (cId && cid.includes(cId)) || (cid && rId.includes(cid))
  }

  // 1. Instantly restore chatUser & messages from local cache to prevent blank screen / offline flicker
  try {
    const cachedChats = JSON.parse(localStorage.getItem('kondani_desktop_chats') || localStorage.getItem('kondani_chats') || '[]')
    const cached = cachedChats.find(matchUser)
    if (cached) {
      chatUser.value = { ...cached }
    }
    const cachedMsgs = localStorage.getItem('kondani_msgs_' + cId)
    if (cachedMsgs) {
      messages.value = JSON.parse(cachedMsgs)
    }
  } catch (_) {}

  // 2. Fetch fresh data from server
  try {
    const chatData = await intentService.getChats()
    const found = (chatData?.chats || []).find(matchUser)
    if (found) {
      chatUser.value = found
    }
    if (!chatUser.value?.name) {
      const profileData = await intentService.getChatProfile(cId)
      if (profileData?.user) {
        chatUser.value = { ...profileData.user }
      }
    }

    const data = await intentService.getChatMessages(cId)
    if (data?.messages) {
      messages.value = data.messages
      try {
        localStorage.setItem('kondani_msgs_' + cId, JSON.stringify(data.messages))
      } catch (_) {}
    }

    if (chatUser.value?.online) {
      messages.value.forEach(m => {
        if (m.isMe) m.delivered = true
      })
    }

    socketService.emit('mark_read', { chatId: cId, readerId: String(myId.value), senderId: String(recipientId.value) })
    clearSidebarUnread()
  } catch (e) {
    console.error('Failed to load chat', e)
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

onMounted(async () => {
  socketService.connect()
  if (myId.value) socketService.emit('join', String(myId.value))
  socketService.on('new_message', handleNewMessage)
  socketService.on('message_delivered', handleMessageDelivered)
  socketService.on('messages_read', handleMessagesRead)
  socketService.on('user_typing', handleUserTyping)
  socketService.on('user_status', handleUserStatus)
  document.addEventListener('click', handleClickOutside)

  await loadChat()
})

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadChat()
  }
})

onUnmounted(() => {
  socketService.off('new_message', handleNewMessage)
  socketService.off('message_delivered', handleMessageDelivered)
  socketService.off('messages_read', handleMessagesRead)
  socketService.off('user_typing', handleUserTyping)
  socketService.off('user_status', handleUserStatus)
  socketService.emit('typing', { chatId: chatId.value, to: String(recipientId.value), from: String(myId.value), isTyping: false })
  document.removeEventListener('click', handleClickOutside)
  if (typingTimeout.value) clearTimeout(typingTimeout.value)
  if (otherTypingTimer.value) clearTimeout(otherTypingTimer.value)
  intentService.setTyping(chatId.value, false).catch(() => {})
  stopTracks()
})

const relay = (message) => {
  socketService.emit('send_message', {
    id: message.id || message._id,
    content: message.content,
    messageType: message.messageType,
    mediaUrl: message.mediaUrl,
    time: message.time || message.createdAt,
    chatId: chatId.value,
    from: String(myId.value),
    to: String(recipientId.value)
  })
}

const sendText = async () => {
  const content = newMessage.value.trim()
  if (!content) return
  const tempId = 'tmp-' + Date.now()
  messages.value.push({ id: tempId, content, time: new Date(), isMe: true, messageType: 'text', delivered: false, read: false })
  newMessage.value = ''
  scrollToBottom()
  updateSidebarLastMessage(content)
  try {
    const res = await intentService.sendMessage(chatId.value, content)
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
    const data = await intentService.getChatProfile(chatId.value)
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
      await intentService.unmatchUser(chatId.value)
      router.replace('/chats')
    } else if (action === 'delete') {
      await intentService.deleteChat(chatId.value)
      router.replace('/chats')
    } else if (action === 'block') {
      await intentService.blockUser(recipientId.value)
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
    await intentService.reportUser(recipientId.value, selectedReportReason.value, reportDescription.value)
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
    mediaRecorder.start(250)
    isRecording.value = true
    recordSeconds.value = 0
    recordTimer = setInterval(() => {
      recordSeconds.value++
      if (recordSeconds.value >= 120) stopAndSendRecording()
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
    const res = await intentService.sendMessage(chatId.value, '', 'voice', url)
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
    path: `/video-call/${chatId.value}`,
    query: { mode, name: chatUser.value.name || '', photo: chatUser.value.photo || '', to: String(recipientId.value), initiator: 'true' }
  })
}
</script>
