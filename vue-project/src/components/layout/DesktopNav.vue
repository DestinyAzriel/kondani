<template>
  <nav class="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[320px] bg-night-950/95 backdrop-blur-2xl border-r border-white/5 z-50 overflow-hidden text-white" role="navigation">
    <!-- Brand -->
    <div class="px-4 py-3 flex items-center justify-between border-b border-white/5">
      <div class="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity select-none group" @click="router.push('/encounters')" title="Go to Discover">
        <KondaniMark :size="32" class="transition-transform group-hover:scale-105" />
        <span class="k-serif text-2xl tracking-tight text-white group-hover:text-gold-300 transition-colors">Kondani</span>
      </div>
      <div class="flex items-center gap-0.5">
        <button v-for="item in topNavItems" :key="item.name" @click.stop="router.push(item.route)"
          class="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all relative"
          :class="{ 'text-gold-400 bg-gold-500/10': isActive(item.route) }" :title="item.label">
          <component :is="item.icon" :size="18" />
          <!-- Kondani theme golden dot for Plans when new plans exist in vicinity -->
          <span v-if="item.name === 'plans' && item.badge > 0"
                class="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-br from-gold-300 via-gold-400 to-amber-500 rounded-full border border-night-950 shadow-sm shadow-gold-400/60 animate-pulse pointer-events-none">
          </span>
          <!-- Kondani theme gold badge for Likes (e.g. 1, 2) -->
          <span v-else-if="item.name === 'likes' && item.badge > 0"
                class="absolute -top-1 -right-1 text-[9.5px] font-black rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-md bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 text-night-950 shadow-gold-400/40 border border-gold-300/40 animate-pulse pointer-events-none">
            {{ item.badge > 99 ? '99+' : item.badge }}
          </span>
        </button>
      </div>
    </div>

    <!-- Profile strip -->
    <div class="px-3.5 py-2.5 border-b border-white/5 bg-white/[0.02]">
      <div class="flex items-center justify-between cursor-pointer group" @click="router.push('/profile')">
        <div class="flex items-center gap-2.5">
          <div class="relative">
            <img v-if="profile?.photos?.[0]" :src="src(profile.photos[0])" class="w-8 h-8 rounded-full object-cover border-2 border-gold-400 shadow-sm" />
            <div v-else class="w-8 h-8 rounded-full bg-night-900 flex items-center justify-center border border-white/10"><UserIcon size="16" class="text-white/40" /></div>
          </div>
          <div class="flex flex-col">
            <span class="k-serif text-[13.5px] font-semibold text-white group-hover:text-gold-300 transition-colors leading-tight">My Profile</span>
            <span class="text-[10px] text-white/40">View & Edit</span>
          </div>
        </div>

        <div v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'moderator'">
          <button
            @click.stop="router.push('/admin')"
            class="flex items-center gap-1 py-0.5 px-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold hover:bg-amber-500/25 transition-all shadow-sm"
          >
            <Shield :size="11" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search Bar (Tinder: Search N Matches) -->
    <div class="px-3.5 py-2 border-b border-white/5 bg-white/[0.015]">
      <div class="relative flex items-center">
        <Search :size="13" class="absolute left-3 text-white/35 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="totalMatchesCount > 0 ? `Search ${totalMatchesCount} Matches` : 'Search matches and messages'"
          class="w-full pl-8 pr-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-gold-400/80 transition-colors"
        />
      </div>
    </div>

    <!-- Unified Tinder Stream: MATCHES ON TOP, MESSAGES BELOW -->
    <div class="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
      <!-- 1. NEW MATCHES SHELF (ON TOP) -->
      <div class="pt-2.5 pb-2 border-b border-white/5 bg-white/[0.01]">
        <div class="px-4 flex items-center justify-between mb-1.5">
          <h2 class="text-[10.5px] font-bold uppercase tracking-wider text-white/50">New Matches</h2>
          <span v-if="filteredNewMatches.length" class="text-[9.5px] bg-gold-400/15 text-gold-300 font-bold px-1.5 py-0.5 rounded-full border border-gold-400/30">
            {{ filteredNewMatches.length }}
          </span>
        </div>

        <!-- Horizontal scroll shelf of compact portrait cards -->
        <div v-if="likesCount > 0 || filteredNewMatches.length > 0" class="px-3.5">
          <div class="flex items-start gap-2.5 overflow-x-auto scrollbar-hide py-1">
            <!-- 1 Likes Gold Card (Tinder Screenshot 2 signature) -->
            <div v-if="likesCount > 0" @click="router.push('/likes')"
                 class="shrink-0 flex flex-col items-center cursor-pointer group"
                 title="View who likes you">
              <div class="relative w-[70px] h-[92px] rounded-xl overflow-hidden border-2 border-gold-400 bg-gradient-to-b from-gold-500/25 via-night-900 to-night-950 flex flex-col items-center justify-center p-2 shadow-md group-hover:scale-105 transition-transform">
                <div class="w-8 h-8 rounded-full bg-gold-400/20 border border-gold-400/40 flex items-center justify-center text-gold-400 mb-1">
                  <Heart :size="15" class="fill-current animate-pulse" />
                </div>
                <span class="text-xs font-bold text-gold-300">{{ likesCount }}</span>
              </div>
              <span class="mt-1 text-[11px] font-semibold text-white/90 truncate max-w-[70px] text-center">
                {{ likesCount }} {{ likesCount === 1 ? 'Like' : 'Likes' }}
              </span>
            </div>

            <!-- Match Portrait Cards -->
            <div v-for="match in filteredNewMatches" :key="match.id"
                 class="shrink-0 flex flex-col items-center cursor-pointer group"
                 @click="openChatWith(match)">
              <div class="relative w-[70px] h-[92px] rounded-xl overflow-hidden border border-white/10 group-hover:border-gold-400/80 group-hover:scale-105 transition-all bg-night-900 shadow-md">
                <img :src="src(match.photo)" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>

                <!-- Online status dot -->
                <div v-if="match.online" class="absolute top-1.5 left-1.5 w-2 h-2 bg-lagoon-400 rounded-full border border-night-950 shadow-sm"></div>

                <!-- Red unread dot (Tinder signature) -->
                <div class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-night-950 shadow-sm"></div>
              </div>

              <!-- Name & Verified badge -->
              <div class="mt-1 flex items-center justify-center gap-1 max-w-[70px]">
                <span class="text-[11px] font-semibold text-white/90 truncate text-center">{{ match.name }}</span>
                <BadgeCheck v-if="match.isVerified" :size="11" class="text-gold-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="px-4 py-2.5 text-center">
          <p class="text-white/35 text-[11px]">No uncontacted matches yet</p>
        </div>
      </div>

      <!-- 2. MESSAGES LIST (BELOW MATCHES) -->
      <div class="flex-1 flex flex-col pt-2.5">
        <div class="px-4 flex items-center justify-between mb-1.5">
          <h2 class="text-[10.5px] font-bold uppercase tracking-wider text-white/50">Messages</h2>
          <span v-if="totalUnreadCount > 0" class="text-[9.5px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full shadow-sm">
            {{ totalUnreadCount }}
          </span>
        </div>

        <!-- Conversations list -->
        <div v-if="filteredChats.length" class="divide-y divide-white/[0.04] flex-1">
          <div v-for="chat in filteredChats" :key="chat.id"
               class="flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
               :class="{ 'bg-white/[0.06] border-l-2 border-gold-400': isActiveChat(chat.id) }"
               @click="openChat(chat.id)">
            <div class="relative shrink-0">
              <img :src="src(chat.photo)" class="w-11 h-11 rounded-full object-cover border border-white/10 ring-2 ring-transparent group-hover:ring-gold-400/40 transition-all" />
              <div v-if="chat.online" class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lagoon-400 rounded-full border-2 border-night-950"></div>
              <div v-if="chat.unread" class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-night-950 shadow-sm"></div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-0.5">
                <div class="flex items-center gap-1.5 min-w-0">
                  <h3 class="k-serif text-[14.5px] font-semibold text-white truncate group-hover:text-gold-300 transition-colors leading-tight">
                    {{ chat.name }}
                  </h3>
                  <BadgeCheck v-if="chat.isVerified" :size="13" class="text-gold-400 shrink-0" />
                </div>
                <span class="text-[10.5px] text-white/40 shrink-0 font-normal">{{ formatTime(chat.lastMessageTime) }}</span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <!-- Live Typing State -->
                <div v-if="chat.typing" class="flex items-center gap-1.5 min-w-0 flex-1">
                  <div class="flex gap-0.5">
                    <span class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce"></span>
                    <span class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce" style="animation-delay:.2s"></span>
                    <span class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce" style="animation-delay:.4s"></span>
                  </div>
                  <span class="text-xs text-lagoon-300 font-medium">typing...</span>
                </div>

                <!-- Last message preview with WhatsApp ticks -->
                <div v-else class="flex items-center gap-1 min-w-0 flex-1">
                  <!-- Missed call preview icon -->
                  <span v-if="chat.lastMessageType === 'missed_voice_call' || chat.lastMessageType === 'missed_video_call' || String(chat.lastMessage).includes('Missed')" class="shrink-0 flex items-center mr-0.5 text-rose-400">
                    <PhoneMissedIcon :size="12" />
                  </span>
                  <!-- WhatsApp Tick for messages sent by me -->
                  <span v-else-if="isMessageFromMe(chat) && chat.lastMessage && chat.lastMessage !== 'Start chatting!'" class="shrink-0 flex items-center mr-0.5">
                    <!-- Blue/Cyan double tick = Read -->
                    <CheckCheckIcon v-if="chat.lastMessageRead" :size="13" class="text-sky-400 stroke-[2.5]" title="Read" />
                    <!-- Grey double tick = Delivered -->
                    <CheckCheckIcon v-else-if="chat.lastMessageDelivered" :size="13" class="text-white/55 stroke-[2]" title="Delivered" />
                    <!-- Grey single tick = Sent / Recipient Offline -->
                    <CheckIcon v-else :size="13" class="text-white/40 stroke-[2]" title="Sent" />
                  </span>
                  <p class="text-xs truncate leading-normal flex-1"
                     :class="[
                       chat.unread ? 'text-white font-semibold' : 'text-white/50',
                       (chat.lastMessageType === 'missed_voice_call' || String(chat.lastMessage).includes('Missed')) ? 'text-rose-400/90' : ''
                     ]">
                    {{ chat.lastMessage || 'Start chatting!' }}
                  </p>
                </div>

                <span v-if="chat.unread" class="px-2 py-0.5 text-[9.5px] font-bold bg-lagoon-400 text-night-950 rounded-full shrink-0">NEW</span>
                <span v-else-if="chat.yourTurn" class="px-2 py-0.5 text-[9.5px] font-medium bg-white/10 text-white/80 rounded-full shrink-0">Your Turn</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="py-10 px-6 text-center flex flex-col items-center gap-2.5">
          <div class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <MessageCircle :size="18" :stroke-width="1.5" class="text-white/30" />
          </div>
          <p class="text-white/60 text-xs font-medium">No messages yet</p>
          <p class="text-white/35 text-[11px] max-w-[190px]">Click any match above to start chatting.</p>
        </div>
      </div>
    </div>

    <!-- Gold upsell footer -->
    <div class="p-3 border-t border-white/5 bg-night-950 shrink-0">
      <div class="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-xl p-2.5 text-center border border-gold-400/20">
        <p class="text-[10px] font-bold text-gold-300 uppercase tracking-widest mb-0.5">Kondani Gold</p>
        <p v-if="likesCount > 0" class="text-xs text-gold-300 font-semibold mb-0.5">{{ likesCount }} {{ likesCount === 1 ? 'person likes you' : 'people like you' }}</p>
        <p class="text-[11px] text-white/60 mb-2">{{ likesCount > 0 ? 'See who they are and match instantly.' : 'See who likes you and match faster.' }}</p>
        <button @click="router.push(likesCount > 0 ? '/likes' : '/premium')" class="w-full py-1.5 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-lg text-xs font-bold transition-all hover:opacity-95 shadow-sm">
          {{ likesCount > 0 ? 'View Likes' : 'Upgrade' }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Flame, Sparkles, Star, User as UserIcon, Heart, MessageCircle, Shield, BadgeCheck, Search, Check as CheckIcon, CheckCheck as CheckCheckIcon, PhoneMissed as PhoneMissedIcon } from 'lucide-vue-next'
import { useProfile } from '@/composables/useProfile'
import { intentService } from '@/services/intentService'
import { socketService } from '@/services/socketService'
import { useAuthStore } from '@/stores/auth'
import KondaniMark from '@/components/ui/KondaniMark.vue'
import { mediaUrl } from '@/utils/media'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { profile } = useProfile()

const searchQuery = ref('')

/* Cache helpers to avoid disappearing/flickering on page reload */
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

const chats = ref(getCached('kondani_desktop_chats', []))
// Ensure any stale delivered flags for offline contacts are cleared
if (Array.isArray(chats.value)) {
  chats.value.forEach(c => {
    if (!c.online && !c.lastMessageRead) {
      c.lastMessageDelivered = false
    }
  })
}
const newMatches = ref(getCached('kondani_desktop_matches', []))
const likesCount = ref(getCached('kondani_desktop_likes_count', 0))
const contactedUserIds = ref(new Set(getCached('kondani_contacted_matches', [])))

const src = (u) => mediaUrl(u)

// All user IDs with an existing conversation in Messages
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

// Uncontacted matches only: matches who don't already have an active conversation in Messages
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
  return chats.value.filter(c =>
    (c.name || '').toLowerCase().includes(q) ||
    (c.lastMessage || '').toLowerCase().includes(q)
  )
})

const totalUnreadCount = computed(() => {
  return chats.value.filter(c => c.unread).length
})

const plansCount = ref(getCached('kondani_desktop_plans_count', 0))

const isMessageFromMe = (chat) => {
  if (!chat || !chat.lastMessage || chat.lastMessage === 'Start chatting!') return false
  if (chat.lastMessageFromMe === true) return true
  if (chat.isLastSender === true) return true
  const cid = String(chat.id || '')
  if (localStorage.getItem('kondani_sent_' + cid) === chat.lastMessage) return true
  return false
}

const topNavItems = computed(() => [
  { name: 'discover', route: '/encounters', label: 'Discover', icon: Flame },
  { name: 'likes', route: '/likes', label: 'Likes', icon: Heart, badge: likesCount.value },
  { name: 'plans', route: '/feed', label: 'Plans', icon: Sparkles, badge: plansCount.value },
  { name: 'picks', route: '/daily-picks', label: 'Picks', icon: Star }
])

const isActive = (p) => route.path === p

const getActiveRouteChatId = () => {
  if (route.params.id) return String(route.params.id)
  if (route.path.startsWith('/chats/')) {
    const segment = route.path.replace(/^\/chats\//, '').split('/')[0]
    if (segment) return segment
  }
  return ''
}

const isActiveChat = (id) => {
  const currentId = getActiveRouteChatId()
  if (!currentId) return false
  const strId = String(id || '')
  return strId === currentId || strId.includes(currentId) || currentId.includes(strId)
}

const formatTime = (t) => {
  if (!t) return ''
  const d = new Date(t), diffH = Math.floor((Date.now() - d) / 3600000)
  if (diffH < 1) return 'now'
  if (diffH < 24) return `${diffH}h`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const clearActiveChatUnread = () => {
  const currentId = getActiveRouteChatId()
  if (!currentId) return
  let changed = false
  chats.value.forEach(c => {
    if (isActiveChat(c.id) || (c.userId && String(c.userId) === currentId)) {
      if (c.unread || c.yourTurn) changed = true
      c.unread = false
      c.yourTurn = false
    }
  })
  if (changed) {
    setCached('kondani_desktop_chats', chats.value)
    setCached('kondani_chats', chats.value)
  }
}

const syncFromStorage = () => {
  const cached = getCached('kondani_desktop_chats') || getCached('kondani_chats')
  if (cached && Array.isArray(cached)) {
    cached.forEach(c => {
      if (!c.online && !c.lastMessageRead) {
        c.lastMessageDelivered = false
      }
    })
    chats.value = cached
    clearActiveChatUnread()
  }
}

watch(() => [route.path, route.params.id], () => {
  clearActiveChatUnread()
}, { immediate: true })

const openChat = (id) => {
  const strId = String(id)
  chats.value.forEach(c => {
    if (String(c.id) === strId || (c.userId && String(c.userId) === strId) || (typeof c.id === 'string' && c.id.includes(strId))) {
      c.unread = false
      c.yourTurn = false
    }
  })
  setCached('kondani_desktop_chats', chats.value)
  setCached('kondani_chats', chats.value)
  router.push(`/chats/${id}`)
}

// Clicking a match: moves them immediately to Messages, removes from New Matches, and opens chat
const openChatWith = (m) => {
  const targetId = typeof m === 'object' ? String(m.id || m._id) : String(m)
  const myId = String(authStore.user?._id || authStore.user?.id || '')
  const chatId = [myId, targetId].sort().join('_')

  // Immediately track as contacted so they leave New Matches shelf
  contactedUserIds.value.add(targetId)
  setCached('kondani_contacted_matches', Array.from(contactedUserIds.value))

  // Find or insert into chats list
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
    setCached('kondani_desktop_chats', chats.value)
    setCached('kondani_chats', chats.value)
  }

  router.push(`/chats/${chatId}`)
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
    if (isActiveChat(chat.id) || isMe) {
      chat.unread = false
      chat.yourTurn = false
    } else {
      chat.unread = true
      chat.yourTurn = true
    }
    chats.value.splice(i, 1)
    chats.value.unshift(chat)
    setCached('kondani_desktop_chats', chats.value)
    setCached('kondani_chats', chats.value)
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

const handleUserStatus = ({ userId, isOnline }) => {
  const m = newMatches.value.find(match => String(match.id) === String(userId))
  if (m) m.online = isOnline
  const c = chats.value.find(chat => String(chat.userId) === String(userId))
  if (c) {
    c.online = isOnline
    // When recipient comes online, immediately upgrade sidebar tick to double grey
    if (isOnline && c.lastMessageFromMe && !c.lastMessageRead) {
      c.lastMessageDelivered = true
    }
  }
}

// Real-time badge handlers
const handleNewLike = () => {
  likesCount.value += 1
  setCached('kondani_desktop_likes_count', likesCount.value)
  setCached('kondani_likes_count', likesCount.value)
}

const handleNewMatch = (data) => {
  if (data && data.matchData) {
    newMatches.value.unshift({ id: data.matchData.id, name: data.matchData.name, photo: data.matchData.avatar })
    setCached('kondani_desktop_matches', newMatches.value)
    setCached('kondani_matches', newMatches.value)
  }
}

const handleNewPlan = () => {
  plansCount.value += 1
  setCached('kondani_desktop_plans_count', plansCount.value)
}

onMounted(async () => {
  window.addEventListener('kondani:chats_changed', syncFromStorage)
  socketService.connect()
  socketService.on('new_message', handleNewMessage)
  socketService.on('user_typing', handleUserTyping)
  socketService.on('message_delivered', handleMessageDelivered)
  socketService.on('messages_read', handleMessagesRead)
  socketService.on('user_status', handleUserStatus)
  socketService.on('new_like', handleNewLike)
  socketService.on('new_match', handleNewMatch)
  socketService.on('new_plan', handleNewPlan)

  try {
    const c = await intentService.getChats()
    if (c?.chats) {
      const cachedList = getCached('kondani_desktop_chats') || chats.value || []
      chats.value = c.chats.map(chat => {
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
      clearActiveChatUnread()
      setCached('kondani_desktop_chats', chats.value)
      setCached('kondani_chats', chats.value)
    }
    const l = await intentService.getLikes()
    if (l) {
      newMatches.value = l?.mutualLikes || []
      likesCount.value = l?.likesCount || 0
      setCached('kondani_desktop_matches', newMatches.value)
      setCached('kondani_desktop_likes_count', likesCount.value)
      setCached('kondani_matches', newMatches.value)
      setCached('kondani_likes_count', likesCount.value)
    }
    // Fetch nearby plans count
    try {
      const p = await intentService.getPlans()
      if (p) {
        plansCount.value = p?.total || p?.plans?.length || 0
        setCached('kondani_desktop_plans_count', plansCount.value)
      }
    } catch (_) {}
  } catch (e) {
    // Keep cached state if API fails
  }
})

onUnmounted(() => {
  window.removeEventListener('kondani:chats_changed', syncFromStorage)
  socketService.off('new_message', handleNewMessage)
  socketService.off('user_typing', handleUserTyping)
  socketService.off('message_delivered', handleMessageDelivered)
  socketService.off('messages_read', handleMessagesRead)
  socketService.off('user_status', handleUserStatus)
  socketService.off('new_like', handleNewLike)
  socketService.off('new_match', handleNewMatch)
  socketService.off('new_plan', handleNewPlan)
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
