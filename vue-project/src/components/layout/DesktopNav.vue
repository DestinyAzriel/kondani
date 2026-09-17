<template>
  <nav class="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[375px] bg-night-950/95 backdrop-blur-2xl border-r border-white/5 z-50 overflow-hidden text-white" role="navigation">
    <!-- Brand -->
    <div class="p-5 flex items-center justify-between border-b border-white/5">
      <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/encounters')">
        <KondaniMark :size="36" />
        <span class="k-serif text-2xl tracking-tight">Kondani</span>
      </div>
      <div class="flex items-center gap-1">
        <button v-for="item in topNavItems" :key="item.name" @click.stop="router.push(item.route)"
          class="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all relative"
          :class="{ 'text-gold-400 bg-gold-500/10': isActive(item.route) }" :title="item.label">
          <component :is="item.icon" :size="18" />
          <span v-if="item.badge && item.badge > 0" class="absolute -top-1 -right-1 bg-gold-400 text-night-950 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-md">
            {{ item.badge > 9 ? '9+' : item.badge }}
          </span>
        </button>
      </div>
    </div>

    <!-- Profile strip -->
    <div class="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
      <div class="flex items-center justify-between cursor-pointer group" @click="router.push('/profile')">
        <div class="flex items-center gap-3">
          <div class="relative">
            <img v-if="profile?.photos?.[0]" :src="src(profile.photos[0])" class="w-10 h-10 rounded-full object-cover border-2 border-gold-400 shadow-sm" />
            <div v-else class="w-10 h-10 rounded-full bg-night-900 flex items-center justify-center border border-white/10"><UserIcon size="20" class="text-white/40" /></div>
          </div>
          <div class="flex flex-col">
            <span class="k-serif text-[15px] font-semibold text-white group-hover:text-gold-300 transition-colors leading-tight">My Profile</span>
            <span class="text-[11px] text-white/40">View & Edit</span>
          </div>
        </div>

        <div v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'moderator'">
          <button
            @click.stop="router.push('/admin')"
            class="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-all shadow-sm"
          >
            <Shield :size="13" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search Bar (Tinder: Search N Matches) -->
    <div class="px-4 py-2.5 border-b border-white/5 bg-white/[0.015]">
      <div class="relative flex items-center">
        <Search :size="15" class="absolute left-3 text-white/35 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="totalMatchesCount > 0 ? `Search ${totalMatchesCount} Matches` : 'Search matches and messages'"
          class="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-gold-400/80 transition-colors"
        />
      </div>
    </div>

    <!-- Unified Tinder Stream: MATCHES ON TOP, MESSAGES BELOW -->
    <div class="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
      <!-- 1. NEW MATCHES SHELF (ON TOP) -->
      <div class="pt-3 pb-2 border-b border-white/5 bg-white/[0.01]">
        <div class="px-4 flex items-center justify-between mb-2">
          <h2 class="text-[11px] font-bold uppercase tracking-wider text-white/50">New Matches</h2>
          <span v-if="filteredNewMatches.length" class="text-[10px] bg-gold-400/15 text-gold-300 font-bold px-2 py-0.5 rounded-full border border-gold-400/30">
            {{ filteredNewMatches.length }}
          </span>
        </div>

        <!-- Horizontal scroll shelf of compact portrait cards -->
        <div v-if="likesCount > 0 || filteredNewMatches.length > 0" class="px-4">
          <div class="flex items-start gap-3 overflow-x-auto scrollbar-hide py-1">
            <!-- 1 Likes Gold Card (Tinder Screenshot 2 signature) -->
            <div v-if="likesCount > 0" @click="router.push('/likes')"
                 class="shrink-0 flex flex-col items-center cursor-pointer group"
                 title="View who likes you">
              <div class="relative w-[76px] h-[100px] rounded-2xl overflow-hidden border-2 border-gold-400 bg-gradient-to-b from-gold-500/25 via-night-900 to-night-950 flex flex-col items-center justify-center p-2 shadow-md group-hover:scale-105 transition-transform">
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
                 class="shrink-0 flex flex-col items-center cursor-pointer group"
                 @click="openChatWith(match)">
              <div class="relative w-[76px] h-[100px] rounded-2xl overflow-hidden border border-white/10 group-hover:border-gold-400/80 group-hover:scale-105 transition-all bg-night-900 shadow-md">
                <img :src="src(match.photo)" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>

                <!-- Online status dot -->
                <div v-if="match.online" class="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-lagoon-400 rounded-full border border-night-950 shadow-sm"></div>

                <!-- Red unread dot (Tinder signature) -->
                <div class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border border-night-950 shadow-sm"></div>
              </div>

              <!-- Name & Verified badge -->
              <div class="mt-1.5 flex items-center justify-center gap-1 max-w-[76px]">
                <span class="text-xs font-semibold text-white/90 truncate text-center">{{ match.name }}</span>
                <BadgeCheck v-if="match.isVerified" :size="12" class="text-gold-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="px-4 py-3 text-center">
          <p class="text-white/35 text-xs">No uncontacted matches yet</p>
        </div>
      </div>

      <!-- 2. MESSAGES LIST (BELOW MATCHES) -->
      <div class="flex-1 flex flex-col pt-3">
        <div class="px-4 flex items-center justify-between mb-2">
          <h2 class="text-[11px] font-bold uppercase tracking-wider text-white/50">Messages</h2>
          <span v-if="totalUnreadCount > 0" class="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full shadow-sm">
            {{ totalUnreadCount }}
          </span>
        </div>

        <!-- Conversations list -->
        <div v-if="filteredChats.length" class="divide-y divide-white/[0.04] flex-1">
          <div v-for="chat in filteredChats" :key="chat.id"
               class="flex items-center gap-3.5 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
               :class="{ 'bg-white/[0.06] border-l-2 border-gold-400': isActiveChat(chat.id) }"
               @click="openChat(chat.id)">
            <div class="relative shrink-0">
              <img :src="src(chat.photo)" class="w-12 h-12 rounded-full object-cover border border-white/10 ring-2 ring-transparent group-hover:ring-gold-400/40 transition-all" />
              <div v-if="chat.online" class="absolute bottom-0 right-0 w-3 h-3 bg-lagoon-400 rounded-full border-2 border-night-950"></div>
              <div v-if="chat.unread" class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-night-950 shadow-sm"></div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-0.5">
                <div class="flex items-center gap-1.5 min-w-0">
                  <h3 class="k-serif text-[15px] font-semibold text-white truncate group-hover:text-gold-300 transition-colors leading-tight">
                    {{ chat.name }}
                  </h3>
                  <BadgeCheck v-if="chat.isVerified" :size="14" class="text-gold-400 shrink-0" />
                </div>
                <span class="text-[11px] text-white/40 shrink-0 font-normal">{{ formatTime(chat.lastMessageTime) }}</span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs truncate flex-1 leading-normal" :class="chat.unread ? 'text-white font-semibold' : 'text-white/50'">
                  {{ chat.lastMessage || 'Start chatting!' }}
                </p>
                <span v-if="chat.unread" class="px-2 py-0.5 text-[10px] font-bold bg-lagoon-400 text-night-950 rounded-full shrink-0">NEW</span>
                <span v-else-if="chat.yourTurn" class="px-2 py-0.5 text-[10px] font-medium bg-white/10 text-white/80 rounded-full shrink-0">Your Turn</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="py-12 px-6 text-center flex flex-col items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <MessageCircle :size="22" :stroke-width="1.5" class="text-white/30" />
          </div>
          <p class="text-white/60 text-sm font-medium">No messages yet</p>
          <p class="text-white/35 text-xs max-w-[200px]">Click any match above to start chatting.</p>
        </div>
      </div>
    </div>

    <!-- Gold upsell footer -->
    <div class="p-4 border-t border-white/5 bg-night-950 shrink-0">
      <div class="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl p-3.5 text-center border border-gold-400/20">
        <p class="text-[11px] font-bold text-gold-300 uppercase tracking-widest mb-0.5">Kondani Gold</p>
        <p v-if="likesCount > 0" class="text-xs text-gold-300 font-semibold mb-1">{{ likesCount }} {{ likesCount === 1 ? 'person likes you right now!' : 'people like you right now!' }}</p>
        <p class="text-xs text-white/60 mb-2.5">{{ likesCount > 0 ? 'See who they are and match instantly.' : 'See who likes you and match faster.' }}</p>
        <button @click="router.push(likesCount > 0 ? '/likes' : '/premium')" class="w-full py-2 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-xl text-xs font-bold transition-all hover:opacity-95 shadow-sm">
          {{ likesCount > 0 ? 'View Likes' : 'Upgrade' }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Flame, Sparkles, Star, User as UserIcon, Heart, MessageCircle, Shield, BadgeCheck, Search } from 'lucide-vue-next'
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

const topNavItems = computed(() => [
  { name: 'discover', route: '/encounters', label: 'Discover', icon: Flame },
  { name: 'likes', route: '/likes', label: 'Likes', icon: Heart, badge: likesCount.value },
  { name: 'plans', route: '/feed', label: 'Plans', icon: Sparkles },
  { name: 'picks', route: '/daily-picks', label: 'Picks', icon: Star }
])

const isActive = (p) => route.path === p
const isActiveChat = (id) => route.path === `/chats/${id}` || route.params.id === String(id)

const formatTime = (t) => {
  if (!t) return ''
  const d = new Date(t), diffH = Math.floor((Date.now() - d) / 3600000)
  if (diffH < 1) return 'now'
  if (diffH < 24) return `${diffH}h`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const openChat = (id) => router.push(`/chats/${id}`)

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
  if (i !== -1) {
    const chat = chats.value[i]
    chat.lastMessage = message.content
    chat.lastMessageTime = new Date().toISOString()
    if (!isActiveChat(chat.id)) {
      chat.unread = true
      chat.yourTurn = true
    }
    chats.value.splice(i, 1)
    chats.value.unshift(chat)
    setCached('kondani_desktop_chats', chats.value)
    setCached('kondani_chats', chats.value)
  }
}

const handleUserStatus = ({ userId, isOnline }) => {
  const m = newMatches.value.find(match => String(match.id) === String(userId))
  if (m) m.online = isOnline
  const c = chats.value.find(chat => String(chat.userId) === String(userId))
  if (c) c.online = isOnline
}

onMounted(async () => {
  socketService.connect()
  socketService.on('new_message', handleNewMessage)
  socketService.on('user_status', handleUserStatus)

  try {
    const c = await intentService.getChats()
    if (c?.chats) {
      chats.value = c.chats
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
  } catch (e) {
    // Keep cached state if API fails
  }
})

onUnmounted(() => {
  socketService.off('new_message', handleNewMessage)
  socketService.off('user_status', handleUserStatus)
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
