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
    <div class="px-4 py-3.5 border-b border-white/5 bg-white/[0.02]">
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

    <!-- Tabs: MATCHES | MESSAGES -->
    <div class="flex flex-col flex-1 min-h-0">
      <div class="flex px-4 pt-3 gap-6 border-b border-white/5 shrink-0">
        <button @click="sidebarTab = 'matches'" class="text-xs font-bold uppercase tracking-wider relative pb-3 transition-colors"
          :class="sidebarTab === 'matches' ? 'text-white' : 'text-white/40 hover:text-white/70'">
          Matches
          <span v-if="newMatches.length" class="ml-1.5 text-[10px] bg-gold-400 text-night-950 font-bold px-1.5 py-0.5 rounded-full shadow-sm">{{ newMatches.length }}</span>
          <div v-if="sidebarTab === 'matches'" class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 via-gold-400 to-gold-300 rounded-full"></div>
        </button>
        <button @click="sidebarTab = 'messages'" class="text-xs font-bold uppercase tracking-wider relative pb-3 transition-colors"
          :class="sidebarTab === 'messages' ? 'text-white' : 'text-white/40 hover:text-white/70'">
          Messages
          <span v-if="totalUnreadCount > 0" class="ml-1.5 text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full shadow-sm">{{ totalUnreadCount }}</span>
          <div v-if="sidebarTab === 'messages'" class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 via-gold-400 to-gold-300 rounded-full"></div>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto scrollbar-hide">
        <!-- MATCHES TAB (Tinder-grade 2-column portrait grid) -->
        <div v-if="sidebarTab === 'matches'" class="p-3.5 space-y-3.5">
          <!-- Prominent Who Likes You Card -->
          <div v-if="likesCount > 0" @click="router.push('/likes')"
               class="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-gold-500/20 via-gold-400/10 to-night-900 border border-gold-400/35 cursor-pointer hover:border-gold-400 hover:scale-[1.01] transition-all shadow-lg">
            <div class="relative w-11 h-11 rounded-full bg-gold-400/25 border-2 border-gold-400 flex items-center justify-center text-gold-400 shrink-0">
              <Heart :size="20" class="fill-current animate-pulse" />
              <span class="absolute -top-1 -right-1 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 text-[10px] font-extrabold rounded-full h-4.5 w-4.5 flex items-center justify-center border-2 border-night-950">
                {{ likesCount }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm text-gold-300 flex items-center gap-1.5 leading-tight">
                {{ likesCount }} {{ likesCount === 1 ? 'Person Likes You' : 'People Like You' }}
              </p>
              <p class="text-[11px] text-white/60 truncate mt-0.5">Click to view who's interested</p>
            </div>
          </div>

          <!-- 2-Column Matches Grid -->
          <div v-if="newMatches.length" class="grid grid-cols-2 gap-3">
            <div v-for="m in newMatches" :key="m.id"
                 class="flex flex-col cursor-pointer group"
                 @click="openChatWith(m.id)">
              <div class="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 group-hover:border-gold-400/80 group-hover:shadow-lg group-hover:shadow-gold-500/10 transition-all duration-300 bg-night-900">
                <img :src="src(m.photo)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"></div>

                <!-- Online indicator dot -->
                <div v-if="m.online" class="absolute top-2 right-2 w-2.5 h-2.5 bg-lagoon-400 rounded-full border border-night-950 shadow"></div>

                <!-- Sleek Name and Badge (fits completely without cutting off) -->
                <div class="absolute bottom-2.5 left-2.5 right-2.5 min-w-0">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="k-serif text-[15px] font-semibold text-white tracking-normal leading-tight truncate drop-shadow">
                      {{ m.name }}
                    </span>
                    <BadgeCheck v-if="m.isVerified" :size="14" class="text-gold-400 shrink-0 drop-shadow" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="likesCount === 0" class="py-16 text-center flex flex-col items-center gap-3">
            <div class="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Heart :size="24" :stroke-width="1.5" class="text-white/30" />
            </div>
            <p class="text-white/60 text-sm font-medium">No matches yet</p>
            <p class="text-white/35 text-xs max-w-[200px]">Keep swiping on Discover to find people you connect with.</p>
          </div>
        </div>

        <!-- MESSAGES TAB -->
        <div v-if="sidebarTab === 'messages'">
          <!-- New Matches Shelf (Tinder-style mini-carousel inside messages) -->
          <div v-if="newMatches.length" class="p-3.5 border-b border-white/5 bg-white/[0.015]">
            <div class="flex items-center justify-between mb-2 px-0.5">
              <span class="text-[11px] font-bold text-white/50 uppercase tracking-wider">New Matches</span>
              <button @click="sidebarTab = 'matches'" class="text-[11px] font-semibold text-gold-400 hover:text-gold-300 transition-colors">See all ({{ newMatches.length }})</button>
            </div>
            <div class="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
              <div v-for="m in newMatches" :key="m.id"
                   class="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                   @click="openChatWith(m.id)">
                <div class="relative w-13 h-13 rounded-full p-0.5 border-2 border-gold-400 group-hover:scale-105 transition-transform bg-night-900">
                  <img :src="src(m.photo)" class="w-12 h-12 rounded-full object-cover" />
                  <div v-if="m.online" class="absolute bottom-0 right-0 w-3 h-3 bg-lagoon-400 rounded-full border-2 border-night-950"></div>
                </div>
                <span class="text-[11px] font-medium text-white/80 max-w-[62px] truncate text-center">{{ m.name }}</span>
              </div>
            </div>
          </div>

          <!-- Conversations list -->
          <div v-if="chats.length" class="divide-y divide-white/[0.04]">
            <div v-for="chat in chats" :key="chat.id"
                 class="flex items-center gap-3.5 px-4 py-3.5 hover:bg-white/5 cursor-pointer transition-colors"
                 :class="{ 'bg-white/[0.05]': isActiveChat(chat.id) }"
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

          <div v-else class="py-16 text-center flex flex-col items-center gap-3">
            <div class="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <MessageCircle :size="24" :stroke-width="1.5" class="text-white/30" />
            </div>
            <p class="text-white/60 text-sm font-medium">No messages yet</p>
            <p class="text-white/35 text-xs max-w-[200px]">Send a hello to one of your matches to get things rolling.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Gold upsell -->
    <div class="p-4 border-t border-white/5 bg-night-950">
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
import { Flame, Sparkles, Star, User as UserIcon, Heart, MessageCircle, Shield, BadgeCheck } from 'lucide-vue-next'
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

const sidebarTab = ref('matches')

/* Cache helpers to avoid 1-second disappearing/flickering on page reload */
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

const src = (u) => mediaUrl(u)

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
const openChatWith = (userId) => {
  const myId = String(authStore.user?._id || authStore.user?.id || '')
  router.push(`/chats/${[myId, String(userId)].sort().join('_')}`)
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
    }
    const l = await intentService.getLikes()
    if (l) {
      newMatches.value = l?.mutualLikes || []
      likesCount.value = l?.likesCount || 0
      setCached('kondani_desktop_matches', newMatches.value)
      setCached('kondani_desktop_likes_count', likesCount.value)
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
