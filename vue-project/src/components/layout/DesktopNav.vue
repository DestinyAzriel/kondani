<template>
  <nav class="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[340px] bg-night-950/95 backdrop-blur-2xl border-r border-white/5 z-50 overflow-hidden text-white" role="navigation">
    <!-- Brand -->
    <div class="p-6 flex items-center gap-3 border-b border-white/5">
      <KondaniMark :size="38" />
      <span class="k-serif text-2xl">Kondani</span>
    </div>

    <!-- Profile strip -->
    <div class="px-4 py-4 border-b border-white/5 bg-white/5">
      <div class="flex items-center justify-between cursor-pointer group" @click="router.push('/profile')">
        <div class="flex items-center gap-3">
          <div class="relative">
            <img v-if="profile?.photos?.[0]" :src="src(profile.photos[0])" class="w-10 h-10 rounded-full object-cover border-2 border-gold-400" />
            <div v-else class="w-10 h-10 rounded-full bg-night-900 flex items-center justify-center border border-white/10"><UserIcon size="20" class="text-white/40" /></div>
          </div>
          <span class="font-bold group-hover:text-gold-300 transition-colors">My Profile</span>
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

      <!-- Admin Portal Shortcut -->
      <div v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'moderator'" class="mt-3 pt-2.5 border-t border-white/10">
        <button
          @click.stop="router.push('/admin')"
          class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-all shadow-sm"
        >
          <Shield :size="14" />
          <span>Admin Portal</span>
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex flex-col flex-1 min-h-0">
      <div class="flex p-4 gap-6 border-b border-white/5">
        <button @click="sidebarTab = 'matches'" class="text-sm font-bold uppercase tracking-wider relative pb-2"
          :class="sidebarTab === 'matches' ? 'text-white' : 'text-white/40'">
          Matches
          <div v-if="sidebarTab === 'matches'" class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 to-gold-300 rounded-full"></div>
          <span v-if="newMatches.length" class="ml-1 text-[10px] bg-lagoon-400 text-night-950 px-1.5 py-0.5 rounded-full">{{ newMatches.length }}</span>
        </button>
        <button @click="sidebarTab = 'messages'" class="text-sm font-bold uppercase tracking-wider relative pb-2"
          :class="sidebarTab === 'messages' ? 'text-white' : 'text-white/40'">
          Messages
          <div v-if="sidebarTab === 'messages'" class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 to-gold-300 rounded-full"></div>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto scrollbar-hide py-2">
        <!-- Matches -->
        <div v-if="sidebarTab === 'matches'" class="px-4">
          <!-- Prominent Who Likes You Card -->
          <div v-if="likesCount > 0" @click="router.push('/likes')"
               class="flex items-center gap-3 p-3.5 mb-4 rounded-2xl bg-gradient-to-r from-gold-500/20 via-gold-400/10 to-night-900 border border-gold-400/35 cursor-pointer hover:border-gold-400 hover:scale-[1.01] transition-all shadow-lg">
            <div class="relative w-12 h-12 rounded-full bg-gold-400/25 border-2 border-gold-400 flex items-center justify-center text-gold-400 shrink-0">
              <Heart :size="22" class="fill-current animate-pulse" />
              <span class="absolute -top-1 -right-1 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 text-[10px] font-extrabold rounded-full h-5 w-5 flex items-center justify-center border-2 border-night-950">
                {{ likesCount }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm text-gold-300 flex items-center gap-1.5">
                {{ likesCount }} {{ likesCount === 1 ? 'Person Likes You' : 'People Like You' }}
              </p>
              <p class="text-xs text-white/60 truncate mt-0.5">Click to view who's interested</p>
            </div>
          </div>

          <div v-if="newMatches.length" class="grid grid-cols-3 gap-4 py-2">
            <div v-for="m in newMatches" :key="m.id" class="flex flex-col items-center gap-2 cursor-pointer group" @click="openChatWith(m.id)">
              <div class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-gold-400 transition-all">
                <img :src="src(m.photo)" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <span class="absolute bottom-1 left-2 text-[11px] font-bold truncate w-[80%]">{{ m.name }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="likesCount === 0" class="py-20 text-center flex flex-col items-center gap-3">
            <Heart :size="28" :stroke-width="1.5" class="text-white/25" />
            <p class="text-white/40 text-sm">Keep swiping to find matches.</p>
          </div>
        </div>

        <!-- Messages -->
        <div v-if="sidebarTab === 'messages'">
          <div v-if="chats.length" class="divide-y divide-white/5">
            <div v-for="chat in chats" :key="chat.id" class="flex items-center gap-4 px-4 py-4 hover:bg-white/5 cursor-pointer group" @click="openChat(chat.id)">
              <div class="relative shrink-0">
                <img :src="src(chat.photo)" class="w-14 h-14 rounded-full object-cover border-2 border-white/10" />
                <div v-if="chat.online" class="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-lagoon-400 rounded-full border-2 border-night-950"></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-baseline mb-1">
                  <h3 class="font-bold truncate group-hover:text-gold-300 transition-colors">{{ chat.name }}</h3>
                  <span class="text-[10px] text-white/40">{{ formatTime(chat.lastMessageTime) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <p class="text-sm text-white/60 truncate" :class="{ 'text-white font-bold': chat.unread }">{{ chat.lastMessage }}</p>
                  <div v-if="chat.unread" class="w-2 h-2 bg-lagoon-400 rounded-full shrink-0"></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="py-20 text-center flex flex-col items-center gap-3"><MessageCircle :size="28" :stroke-width="1.5" class="text-white/25" /><p class="text-white/40 text-sm">No messages yet.</p></div>
        </div>
      </div>
    </div>

    <!-- Gold upsell -->
    <div class="p-4 border-t border-white/5">
      <div class="bg-white/5 rounded-2xl p-4 text-center border border-gold-400/20">
        <p class="text-[11px] font-bold text-gold-300 uppercase tracking-widest mb-1">Kondani Gold</p>
        <p v-if="likesCount > 0" class="text-xs text-gold-300 font-semibold mb-1">{{ likesCount }} {{ likesCount === 1 ? 'person likes you right now!' : 'people like you right now!' }}</p>
        <p class="text-xs text-white/60 mb-3">{{ likesCount > 0 ? 'See who they are and match instantly.' : 'See who likes you and match faster.' }}</p>
        <button @click="router.push(likesCount > 0 ? '/likes' : '/premium')" class="w-full py-2 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5">
          {{ likesCount > 0 ? 'View Likes' : 'Upgrade' }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Flame, Sparkles, Star, User as UserIcon, Heart, MessageCircle, Shield } from 'lucide-vue-next'
import { useProfile } from '@/composables/useProfile'
import { intentService } from '@/services/intentService'
import { useAuthStore } from '@/stores/auth'
import KondaniMark from '@/components/ui/KondaniMark.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { profile } = useProfile()

const sidebarTab = ref('matches')
const chats = ref([])
const newMatches = ref([])
const likesCount = ref(0)

import { mediaUrl } from '@/utils/media'
const src = (u) => mediaUrl(u)

const topNavItems = computed(() => [
  { name: 'discover', route: '/encounters', label: 'Discover', icon: Flame },
  { name: 'likes', route: '/likes', label: 'Likes', icon: Heart, badge: likesCount.value },
  { name: 'plans', route: '/feed', label: 'Plans', icon: Sparkles },
  { name: 'picks', route: '/daily-picks', label: 'Picks', icon: Star }
])
const isActive = (p) => route.path === p

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

onMounted(async () => {
  try {
    const c = await intentService.getChats()
    chats.value = c?.chats || []
    const l = await intentService.getLikes()
    newMatches.value = l?.mutualLikes || []
    likesCount.value = l?.likesCount || 0
  } catch (e) {
    chats.value = []; newMatches.value = []; likesCount.value = 0
  }
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
