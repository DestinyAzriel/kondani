<template>
  <div class="chats-view k-page relative overflow-hidden" :class="{ 'desktop-layout': isDesktop }">
    <div class="k-stars"></div>
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[45%] rounded-full blur-[100px]"
           style="background: radial-gradient(circle, rgba(244,183,64,.11), transparent 70%)"></div>
    </div>

    <!-- ====== DESKTOP: Single clean chat panel (DesktopNav on left already handles list) ====== -->
    <div v-if="isDesktop" class="h-full flex flex-col overflow-hidden">
      <ChatPanel v-if="activeChatId" :key="activeChatId" :chatId="activeChatId" :embedded="true" class="h-full" />
      <div v-else class="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div class="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-5">
          <MessageCircleIcon :size="36" :stroke-width="1.2" class="text-white/20" />
        </div>
        <h2 class="k-serif text-xl text-white/60 mb-2">Select a conversation</h2>
        <p class="text-white/35 text-sm max-w-xs">Choose a match or message from the left sidebar to start chatting.</p>
      </div>
    </div>

    <!-- ====== MOBILE: Tinder-Grade Architecture (Screenshot 3) ====== -->
    <div v-else class="pb-28 relative z-10">
      <!-- Top App Bar -->
      <div class="sticky top-0 z-20 bg-night-950/90 backdrop-blur-xl border-b border-white/5 px-4 pt-3 pb-2.5">
        <div class="flex items-center justify-between mb-2">
          <h1 class="text-2xl font-bold tracking-tight text-white font-display">Chat</h1>
          <div class="flex items-center gap-2">
            <button @click="router.push('/safety')" class="p-2 text-white/70 hover:text-white transition-colors" title="Safety Center">
              <Shield :size="20" />
            </button>
            <button @click="router.push('/profile')" class="p-2 text-white/70 hover:text-white transition-colors" title="My Profile">
              <Smile :size="20" />
            </button>
          </div>
        </div>

        <!-- Search Bar (Tinder: Search N Matches) -->
        <div class="relative flex items-center">
          <Search :size="16" class="absolute left-3.5 text-white/40 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="totalMatchesCount > 0 ? `Search ${totalMatchesCount} Matches` : 'Search matches and messages'"
            class="w-full pl-10 pr-4 py-2 rounded-full bg-white/[0.07] border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-400/80 transition-colors"
          />
        </div>
      </div>

      <div class="space-y-6 pt-3">
        <!-- New Matches Horizontal Shelf -->
        <section v-if="likesCount > 0 || filteredNewMatches.length > 0" class="px-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">New Matches</h2>
          <div class="flex gap-3.5 overflow-x-auto pb-1 scrollbar-hide">
            <!-- 1 Likes Gold Card (Tinder Screenshot 3) -->
            <div v-if="likesCount > 0" @click="router.push('/likes')" class="flex-shrink-0 flex flex-col items-center cursor-pointer group">
              <div class="relative w-[76px] h-[100px] rounded-2xl overflow-hidden border-2 border-gold-400 bg-gradient-to-b from-gold-500/25 via-night-900 to-night-950 flex flex-col items-center justify-center p-2 shadow-lg group-hover:scale-105 transition-transform">
                <div class="w-10 h-10 rounded-full bg-gold-400/20 border border-gold-400/40 flex items-center justify-center text-gold-400 mb-1">
                  <Heart :size="18" class="fill-current animate-pulse" />
                </div>
                <span class="text-xs font-bold text-gold-300">{{ likesCount }}</span>
              </div>
              <span class="mt-1.5 text-xs font-semibold text-white/90 truncate max-w-[76px] text-center">
                {{ likesCount }} {{ likesCount === 1 ? 'Like' : 'Likes' }}
              </span>
            </div>

            <!-- Match Portrait Cards -->
            <div v-for="match in filteredNewMatches" :key="match.id"
                 class="flex-shrink-0 flex flex-col items-center cursor-pointer group"
                 @click="openChatWithUser(match)">
              <div class="relative w-[76px] h-[100px] rounded-2xl overflow-hidden border border-white/10 group-hover:border-gold-400 group-hover:scale-105 transition-all bg-night-900 shadow-md">
                <img :src="mediaUrl(match.photo)" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <!-- Red unread dot (Tinder signature) -->
                <div class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border border-night-950 shadow-sm"></div>
              </div>
              <div class="mt-1.5 flex items-center justify-center gap-1 max-w-[76px]">
                <span class="text-xs font-semibold text-white/90 truncate">{{ match.name }}</span>
                <BadgeCheck v-if="match.isVerified" :size="12" class="text-gold-400 shrink-0" />
              </div>
            </div>
          </div>
        </section>

        <!-- Messages Conversation List -->
        <section class="px-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Messages</h2>

          <div v-if="isLoading" class="space-y-3">
            <SkeletonLoader v-for="i in 4" :key="i" type="chat" />
          </div>

          <div v-else-if="filteredChats.length > 0" class="divide-y divide-white/[0.04]">
            <div v-for="chat in filteredChats" :key="chat.id"
                 class="flex items-center gap-3.5 py-3.5 cursor-pointer active:opacity-75 transition-opacity"
                 @click="openChat(chat.id)">
              <!-- 52px Circular Avatar -->
              <div class="relative shrink-0" @click.stop="openProfilePreview(chat)" title="View profile">
                <img :src="mediaUrl(chat.photo)" class="w-13 h-13 rounded-full object-cover border border-white/15" />
                <div v-if="chat.online" class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-lagoon-400 rounded-full border-2 border-night-950"></div>
                <div v-if="chat.unread" class="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-night-950 shadow-sm"></div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-0.5">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <h3 class="k-serif text-base font-semibold text-white truncate leading-tight">
                      {{ chat.name }}
                    </h3>
                    <BadgeCheck v-if="chat.isVerified" :size="14" class="text-gold-400 shrink-0" />
                  </div>

                  <!-- Your Turn pill badge (Tinder Screenshot 3 signature) -->
                  <span v-if="chat.unread || chat.yourTurn" class="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-[11px] font-medium shrink-0">
                    Your Turn
                  </span>
                  <span v-else class="text-xs text-white/40 shrink-0 font-normal">{{ formatTime(chat.lastMessageTime) }}</span>
                </div>

                <div v-if="chat.typing" class="flex items-center gap-1.5 mt-0.5">
                  <div class="flex gap-1">
                    <div class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce"></div>
                    <div class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce" style="animation-delay:.2s"></div>
                    <div class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce" style="animation-delay:.4s"></div>
                  </div>
                  <span class="text-xs text-lagoon-300 font-medium">typing...</span>
                </div>

                <div v-else class="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <!-- Missed call preview icon -->
                  <span v-if="chat.lastMessageType === 'missed_voice_call' || chat.lastMessageType === 'missed_video_call' || String(chat.lastMessage).includes('Missed')" class="shrink-0 flex items-center mr-0.5 text-rose-400">
                    <PhoneMissedIcon :size="13" />
                  </span>
                  <!-- WhatsApp Tick for messages sent by me -->
                  <span v-else-if="(chat.lastMessageFromMe || chat.isLastSender) && chat.lastMessage && chat.lastMessage !== 'Start chatting!'" class="shrink-0 flex items-center">
                    <!-- Blue/Cyan double tick = Read -->
                    <CheckCheckIcon v-if="chat.lastMessageRead" :size="15" class="text-sky-400 stroke-[2.5]" title="Read" />
                    <!-- Grey double tick = Delivered -->
                    <CheckCheckIcon v-else-if="chat.lastMessageDelivered" :size="15" class="text-white/55 stroke-[2]" title="Delivered" />
                    <!-- Grey single tick = Sent / Recipient Offline -->
                    <CheckIcon v-else :size="15" class="text-white/40 stroke-[2]" title="Sent" />
                  </span>
                  <p class="text-sm truncate leading-snug flex-1"
                     :class="[
                       chat.unread ? 'text-white font-medium' : 'text-white/55',
                       (chat.lastMessageType === 'missed_voice_call' || String(chat.lastMessage).includes('Missed')) ? 'text-rose-400/90' : ''
                     ]">
                    {{ chat.lastMessage || 'Start chatting!' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <EmptyState v-else type="no-chats" title="No conversations yet"
            message="When you match with someone, your chats appear here."
            action-text="Start discovering" @action="router.push('/encounters')" />
        </section>
      </div>
    </div>

    <!-- Profile Preview Modal -->
    <ProfilePreviewModal
      :show="showProfilePreview"
      :user="profileUser"
      @close="showProfilePreview = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { intentService } from '@/services/intentService'
import { socketService } from '@/services/socketService'
import { Check as CheckIcon, CheckCheck as CheckCheckIcon, BadgeCheck, MessageCircle as MessageCircleIcon, Shield, Smile, Search, Heart, PhoneMissed as PhoneMissedIcon } from 'lucide-vue-next'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ChatPanel from '@/components/feature/ChatPanel.vue'
import ProfilePreviewModal from '@/components/feature/modal/ProfilePreviewModal.vue'
import { mediaUrl } from '@/utils/media'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

/* LocalStorage Cache helpers to prevent disappearing/flicker on reload */
const getCached = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch (e) {
    return fallback
  }
}

const setCached = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (e) {}
}

const chats = ref(getCached('kondani_chats', []))
if (Array.isArray(chats.value)) {
  chats.value.forEach(c => {
    if (!c.online && !c.lastMessageRead) {
      c.lastMessageDelivered = false
    }
  })
}
const newMatches = ref(getCached('kondani_matches', []))
const likesCount = ref(getCached('kondani_likes_count', 0))
const contactedUserIds = ref(new Set(getCached('kondani_contacted_matches', [])))
const isLoading = ref(chats.value.length === 0 && newMatches.value.length === 0)
const activeChatId = ref(null)
const searchQuery = ref('')

/* Profile preview modal */
const showProfilePreview = ref(false)
const profileUser = ref({})

const openProfilePreview = async (item) => {
  profileUser.value = item
  showProfilePreview.value = true
  if (item.id) {
    try {
      const data = await intentService.getChatProfile(item.id)
      if (data?.user) {
        profileUser.value = { ...item, ...data.user }
      }
    } catch (e) {
      // Keep existing data
    }
  }
}

// User IDs who already have an active conversation
const activeChatUserIds = computed(() => {
  const set = new Set(contactedUserIds.value)
  chats.value.forEach(c => {
    if (c.userId) set.add(String(c.userId))
    if (c.id) {
      set.add(String(c.id))
      if (typeof c.id === 'string' && c.id.includes('_')) {
        c.id.split('_').forEach(part => set.add(part))
      }
    }
    if (c.participantId) set.add(String(c.participantId))
  })
  return set
})

// Only matches who have NOT been contacted or added to Messages yet
const uncontactedMatches = computed(() => {
  const myId = String(authStore.user?._id || authStore.user?.id || '')
  return newMatches.value.filter(m => {
    const mId = String(m.id || m._id || '')
    if (!mId || mId === myId) return false
    return !activeChatUserIds.value.has(mId)
  })
})

const totalMatchesCount = computed(() => {
  return uncontactedMatches.value.length + (likesCount.value || 0)
})

const filteredNewMatches = computed(() => {
  if (!searchQuery.value.trim()) return uncontactedMatches.value
  const q = searchQuery.value.toLowerCase()
  return uncontactedMatches.value.filter(m => (m.name || '').toLowerCase().includes(q))
})

const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return chats.value
  const q = searchQuery.value.toLowerCase()
  return chats.value.filter(c => (c.name || '').toLowerCase().includes(q) || (c.lastMessage || '').toLowerCase().includes(q))
})

const isDesktop = ref(window.innerWidth >= 768)
const onResize = () => { isDesktop.value = window.innerWidth >= 768 }

const syncFromStorage = () => {
  const cached = getCached('kondani_chats') || getCached('kondani_desktop_chats')
  if (cached && Array.isArray(cached)) {
    chats.value = cached
    if (activeChatId.value) {
      const active = chats.value.find(c => 
        String(c.id) === activeChatId.value ||
        (c.userId && String(c.userId) === activeChatId.value) ||
        (typeof c.id === 'string' && c.id.includes(activeChatId.value))
      )
      if (active) {
        active.unread = false
        active.yourTurn = false
      }
    }
  }
}

const handleNewMessage = (message) => {
  const i = chats.value.findIndex(c => String(c.id) === String(message.chatId))
  const myId = String(authStore.user?._id || authStore.user?.id || '')
  const isMe = Boolean(message.isMe || String(message.sender || message.from) === myId)

  if (i !== -1) {
    const chat = chats.value[i]
    chat.lastMessage = message.content
    chat.lastMessageType = message.messageType
    chat.lastMessageTime = new Date().toISOString()
    chat.lastMessageFromMe = isMe
    chat.lastMessageRead = Boolean(message.read)
    chat.lastMessageDelivered = Boolean(message.delivered || (chat.online && isMe))
    chat.typing = false
    if (String(message.chatId) === activeChatId.value || isMe) {
      chat.unread = false
      chat.yourTurn = false
    } else {
      chat.unread = true
      chat.yourTurn = true
    }
    chats.value.splice(i, 1)
    chats.value.unshift(chat)
    setCached('kondani_chats', chats.value)
    setCached('kondani_desktop_chats', chats.value)
  }
}

const handleUserTyping = ({ chatId, from, isTyping }) => {
  const myId = String(authStore.user?._id || authStore.user?.id || '')
  if (String(from) === myId) return
  const chat = chats.value.find(c =>
    String(c.id) === String(chatId) ||
    String(c.userId) === String(from) ||
    (typeof c.id === 'string' && c.id.includes(String(from)))
  )
  if (chat) {
    chat.typing = Boolean(isTyping)
  }
}

const handleMessageDelivered = ({ chatId }) => {
  const chat = chats.value.find(c => String(c.id) === String(chatId))
  if (chat && chat.lastMessageFromMe) {
    chat.lastMessageDelivered = true
  }
}

const handleMessagesRead = ({ chatId }) => {
  const chat = chats.value.find(c => String(c.id) === String(chatId))
  if (chat && chat.lastMessageFromMe) {
    chat.lastMessageRead = true
    chat.lastMessageDelivered = true
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const diffH = Math.floor((Date.now() - date) / 3600000)
  if (diffH < 1) return 'now'
  if (diffH < 24) return `${diffH}h`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

watch([isDesktop, chats], ([desktop, list]) => {
  if (desktop && list.length && !activeChatId.value) {
    activeChatId.value = String(list[0].id)
  }
}, { immediate: true })

const openChat = (id) => {
  const strId = String(id)
  const myId = String(authStore.user?._id || authStore.user?.id || '')
  let cleanId = strId
  const chat = chats.value.find(c => String(c.id) === strId || (c.userId && String(c.userId) === strId) || (typeof c.id === 'string' && c.id.includes(strId)))
  if (chat) {
    chat.unread = false
    chat.yourTurn = false
    cleanId = chat.userId || (String(chat.id).includes('_') ? String(chat.id).split('_').find(x => x && x !== myId) : chat.id)
    setCached('kondani_chats', chats.value)
    setCached('kondani_desktop_chats', chats.value)
  } else if (strId.includes('_')) {
    cleanId = strId.split('_').find(x => x && x !== myId) || strId
  }
  router.push(`/chats/${cleanId}`)
}

// Clicking a match: removes from New Matches, moves to Messages, and opens chat
const openChatWithUser = (m) => {
  const targetId = typeof m === 'object' ? String(m.id || m._id) : String(m)
  const myId = String(authStore.user?._id || authStore.user?.id || '')
  const chatId = [myId, targetId].sort().join('_')

  contactedUserIds.value.add(targetId)
  setCached('kondani_contacted_matches', Array.from(contactedUserIds.value))
  setCached('kondani_desktop_contacted_matches', Array.from(contactedUserIds.value))

  const existingChat = chats.value.find(c =>
    String(c.id) === chatId ||
    String(c.userId) === targetId ||
    (typeof c.id === 'string' && c.id.includes(targetId))
  )

  if (!existingChat && typeof m === 'object') {
    chats.value.unshift({
      id: chatId,
      userId: targetId,
      name: m.name,
      photo: m.photo,
      isVerified: m.isVerified,
      lastMessage: 'Start chatting!',
      lastMessageTime: new Date().toISOString(),
      unread: false,
      yourTurn: true
    })
    setCached('kondani_chats', chats.value)
    setCached('kondani_desktop_chats', chats.value)
  }

  router.push(`/chats/${targetId}`)
}

const handleUserStatus = ({ userId, isOnline }) => {
  const chat = chats.value.find(c => String(c.userId) === String(userId))
  if (chat) {
    chat.online = isOnline
    // When recipient comes online, immediately upgrade sidebar tick to double grey
    if (isOnline && chat.lastMessageFromMe && !chat.lastMessageRead) {
      chat.lastMessageDelivered = true
    }
  }
  const match = newMatches.value.find(m => String(m.id) === String(userId))
  if (match) match.online = isOnline
}

onMounted(async () => {
  window.addEventListener('resize', onResize)
  window.addEventListener('kondani:chats_changed', syncFromStorage)
  socketService.connect()
  socketService.on('new_message', handleNewMessage)
  socketService.on('user_typing', handleUserTyping)
  socketService.on('message_delivered', handleMessageDelivered)
  socketService.on('messages_read', handleMessagesRead)
  socketService.on('user_status', handleUserStatus)

  try {
    await intentService.setUserOnline()
    const chatData = await intentService.getChats()
    if (chatData?.chats) {
      const cachedList = getCached('kondani_chats') || chats.value || []
      chats.value = chatData.chats.map(chat => {
        const cached = cachedList.find(x => String(x.id) === String(chat.id) || String(x.userId) === String(chat.userId))
        const fromMe = chat.lastMessageFromMe !== undefined
          ? Boolean(chat.lastMessageFromMe)
          : (cached && cached.lastMessage === chat.lastMessage ? Boolean(cached.lastMessageFromMe) : false)
        const delivered = chat.lastMessageDelivered !== undefined
          ? Boolean(chat.lastMessageDelivered)
          : Boolean(chat.online && fromMe)
        const read = chat.lastMessageRead !== undefined
          ? Boolean(chat.lastMessageRead)
          : (cached && cached.lastMessage === chat.lastMessage ? Boolean(cached.lastMessageRead) : false)

        return {
          ...chat,
          lastMessageFromMe: fromMe,
          lastMessageDelivered: delivered,
          lastMessageRead: read
        }
      })
      setCached('kondani_chats', chats.value)
    }

    const likeData = await intentService.getLikes()
    if (likeData) {
      newMatches.value = likeData?.mutualLikes || []
      likesCount.value = likeData?.likesCount || 0
      setCached('kondani_matches', newMatches.value)
      setCached('kondani_likes_count', likesCount.value)
    }

    // Auto-select first chat on desktop
    if (isDesktop.value && chats.value.length > 0 && !activeChatId.value) {
      activeChatId.value = String(chats.value[0].id)
    }
  } catch (e) {
    // Keep cached data
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('kondani:chats_changed', syncFromStorage)
  socketService.off('new_message', handleNewMessage)
  socketService.off('user_typing', handleUserTyping)
  socketService.off('message_delivered', handleMessageDelivered)
  socketService.off('messages_read', handleMessagesRead)
  socketService.off('user_status', handleUserStatus)
  intentService.setUserOffline()
})
</script>

<style scoped>
.desktop-layout { overflow: hidden; height: 100vh; height: 100dvh; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
