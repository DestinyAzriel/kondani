<template>
  <div class="chats-view k-page relative overflow-hidden md:h-[100dvh]">
    <div class="k-stars"></div>
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[45%] rounded-full blur-[100px]"
           style="background: radial-gradient(circle, rgba(244,183,64,.11), transparent 70%)"></div>
    </div>

    <!-- ====== DESKTOP: Single clean chat panel (DesktopNav on left already handles list) ====== -->
    <div class="hidden md:flex flex-col h-full overflow-hidden">
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
    <div class="block md:hidden pb-16 relative z-10">
      <!-- Profile Strip (Identical to Desktop Screenshot 3) -->
      <div class="sticky top-0 z-20 bg-night-950/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div class="flex items-center justify-between mb-3 cursor-pointer" @click="router.push('/profile')">
          <div class="flex items-center gap-2.5">
            <div class="relative">
              <img
                v-if="authStore.user?.photos?.[0]"
                :src="mediaUrl(authStore.user.photos[0])"
                class="w-9 h-9 rounded-full object-cover border-2 border-gold-400 shadow-sm"
              />
              <div v-else class="w-9 h-9 rounded-full bg-night-900 flex items-center justify-center border border-white/10">
                <UserIcon :size="18" class="text-white/40" />
              </div>
            </div>
            <div class="flex flex-col">
              <span class="k-serif text-sm font-semibold text-white leading-tight">My Profile</span>
              <span class="text-[10px] text-white/40">View & Edit</span>
            </div>
          </div>

          <div v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'moderator'">
            <button
              @click.stop="router.push('/admin')"
              class="flex items-center gap-1 py-1 px-2.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold"
            >
              <Shield :size="12" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="relative flex items-center">
          <Search :size="15" class="absolute left-3.5 text-white/35 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="totalMatchesCount > 0 ? `Search ${totalMatchesCount} Matches` : 'Search matches and messages'"
            class="w-full pl-9 pr-3 py-2 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-gold-400/80 transition-colors"
          />
        </div>
      </div>

      <div class="space-y-4 pt-3">
        <!-- New Matches Shelf (Screenshot 3) -->
        <section class="px-4">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-[11px] font-bold uppercase tracking-wider text-white/50">New Matches</h2>
            <span v-if="filteredNewMatches.length" class="text-[10px] bg-gold-400/15 text-gold-300 font-bold px-1.5 py-0.5 rounded-full border border-gold-400/30">
              {{ filteredNewMatches.length }}
            </span>
          </div>

          <!-- If matches or likes exist: horizontal scroll -->
          <div v-if="likesCount > 0 || filteredNewMatches.length > 0" class="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <!-- Likes Gold Card -->
            <div v-if="likesCount > 0" @click="router.push('/likes')" class="shrink-0 flex flex-col items-center cursor-pointer group">
              <div class="relative w-[72px] h-[96px] rounded-xl overflow-hidden border-2 border-gold-400 bg-gradient-to-b from-gold-500/25 via-night-900 to-night-950 flex flex-col items-center justify-center p-2 shadow-md">
                <div class="w-8 h-8 rounded-full bg-gold-400/20 border border-gold-400/40 flex items-center justify-center text-gold-400 mb-1">
                  <Heart :size="16" class="fill-current animate-pulse" />
                </div>
                <span class="text-xs font-bold text-gold-300">{{ likesCount }}</span>
              </div>
              <span class="mt-1 text-[11px] font-semibold text-white/90 truncate max-w-[72px] text-center">
                {{ likesCount }} {{ likesCount === 1 ? 'Like' : 'Likes' }}
              </span>
            </div>

            <!-- Match Portrait Cards -->
            <div v-for="match in filteredNewMatches" :key="match.id"
                 class="shrink-0 flex flex-col items-center cursor-pointer group"
                 @click="openChatWithUser(match)">
              <div class="relative w-[72px] h-[96px] rounded-xl overflow-hidden border border-white/10 group-hover:border-gold-400 transition-all bg-night-900 shadow-md">
                <img :src="mediaUrl(match.photo)" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-night-950"></div>
              </div>
              <div class="mt-1 flex items-center justify-center gap-1 max-w-[72px]">
                <span class="text-[11px] font-semibold text-white/90 truncate">{{ match.name }}</span>
                <BadgeCheck v-if="match.isVerified" :size="11" class="text-gold-400 shrink-0" />
              </div>
            </div>
          </div>

          <!-- Empty Matches State (Screenshot 3) -->
          <div v-else class="py-3 px-4 text-center bg-white/[0.02] rounded-xl border border-white/5">
            <p class="text-white/35 text-[11px]">No uncontacted matches yet</p>
          </div>
        </section>

        <!-- Messages Section (Screenshot 3) -->
        <section class="px-4">
          <h2 class="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Messages</h2>

          <div v-if="isLoading" class="space-y-3">
            <SkeletonLoader v-for="i in 4" :key="i" type="chat" />
          </div>

          <!-- Conversations List -->
          <div v-else-if="filteredChats.length > 0" class="divide-y divide-white/[0.04]">
            <div v-for="chat in filteredChats" :key="chat.id"
                 class="flex items-center gap-3.5 py-3 cursor-pointer active:opacity-75 transition-opacity"
                 @click="openChat(chat.id)">
              <div class="relative shrink-0" @click.stop="openProfilePreview(chat)" title="View profile">
                <img :src="mediaUrl(chat.photo)" class="w-12 h-12 rounded-full object-cover border border-white/15" />
                <div v-if="chat.online" class="absolute bottom-0 right-0 w-3 h-3 bg-lagoon-400 rounded-full border-2 border-night-950"></div>
                <div v-if="chat.unread" class="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-night-950"></div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-0.5">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <h3 class="k-serif text-sm font-semibold text-white truncate leading-tight">
                      {{ chat.name }}
                    </h3>
                    <BadgeCheck v-if="chat.isVerified" :size="13" class="text-gold-400 shrink-0" />
                  </div>
                  <span v-if="chat.unread || chat.yourTurn" class="px-2 py-0.5 rounded-full bg-white/10 text-white/90 text-[10px] font-medium shrink-0">
                    Your Turn
                  </span>
                  <span v-else class="text-[11px] text-white/40 shrink-0">{{ formatTime(chat.lastMessageTime) }}</span>
                </div>

                <div class="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <span v-if="chat.lastMessageType === 'missed_voice_call' || chat.lastMessageType === 'missed_video_call' || String(chat.lastMessage).includes('Missed')" class="shrink-0 flex items-center mr-0.5 text-rose-400">
                    <PhoneMissedIcon :size="13" />
                  </span>
                  <span v-else-if="(chat.lastMessageFromMe || chat.isLastSender) && chat.lastMessage && chat.lastMessage !== 'Start chatting!'" class="shrink-0 flex items-center">
                    <CheckCheckIcon v-if="chat.lastMessageRead" :size="14" class="text-sky-400 stroke-[2.5]" title="Read" />
                    <CheckCheckIcon v-else-if="chat.lastMessageDelivered" :size="14" class="text-white/55 stroke-[2]" title="Delivered" />
                    <CheckIcon v-else :size="14" class="text-white/40 stroke-[2]" title="Sent" />
                  </span>
                  <p class="text-xs truncate leading-snug flex-1 text-white/55">
                    {{ chat.lastMessage || 'Start chatting!' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty Messages State (Screenshot 3) -->
          <div v-else class="py-6 px-4 text-center flex flex-col items-center gap-2.5 bg-white/[0.015] rounded-2xl border border-white/5 my-1">
            <div class="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <MessageCircleIcon :size="20" :stroke-width="1.5" class="text-white/35" />
            </div>
            <div>
              <p class="text-white/80 text-xs font-semibold">No messages yet</p>
              <p class="text-white/40 text-[11px] max-w-[220px] mx-auto mt-0.5">Click any match above to start chatting or discover new people.</p>
            </div>
            <button @click="router.push('/encounters')" class="mt-1 px-3.5 py-1.5 rounded-full bg-gold-400/15 hover:bg-gold-400/25 border border-gold-400/30 text-gold-300 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer">
              <Sparkles :size="12" /> Discover Matches
            </button>
          </div>
        </section>

        <!-- Gold Upsell Card (Screenshot 3) -->
        <div class="px-4 pt-1">
          <div class="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-xl p-3 text-center border border-gold-400/20 shadow-md">
            <p class="text-[10px] font-bold text-gold-300 uppercase tracking-widest mb-0.5">Kondani Gold</p>
            <p class="text-[11px] text-white/60 mb-2">See who likes you and match faster.</p>
            <button @click="router.push(likesCount > 0 ? '/likes' : '/premium')" class="w-full py-1.5 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-lg text-xs font-bold transition-all hover:opacity-95 shadow-sm cursor-pointer">
              {{ likesCount > 0 ? 'View Likes' : 'Upgrade' }}
            </button>
          </div>
        </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { intentService } from '@/services/intentService'
import { socketService } from '@/services/socketService'
import { Check as CheckIcon, CheckCheck as CheckCheckIcon, BadgeCheck, MessageCircle as MessageCircleIcon, Shield, Search, Heart, PhoneMissed as PhoneMissedIcon, User as UserIcon, Sparkles } from 'lucide-vue-next'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
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

const rawCachedChats = getCached('kondani_chats', [])
const chats = ref(Array.isArray(rawCachedChats) ? rawCachedChats.filter(Boolean) : [])
if (Array.isArray(chats.value)) {
  chats.value.forEach(c => {
    if (c && !c.online && !c.lastMessageRead) {
      c.lastMessageDelivered = false
    }
  })
}
const rawMatches = getCached('kondani_matches', [])
const newMatches = ref(Array.isArray(rawMatches) ? rawMatches.filter(Boolean) : [])
const likesCount = ref(Number(getCached('kondani_likes_count', 0)) || 0)
const rawContacted = getCached('kondani_contacted_matches', [])
const contactedUserIds = ref(new Set(Array.isArray(rawContacted) ? rawContacted : []))
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
