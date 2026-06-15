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
            class="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            :class="{ 'text-gold-400 bg-gold-500/10': isActive(item.route) }" :title="item.label">
            <component :is="item.icon" :size="18" />
          </button>
        </div>
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
          <div v-if="newMatches.length" class="grid grid-cols-3 gap-4 py-4">
            <div v-for="m in newMatches" :key="m.id" class="flex flex-col items-center gap-2 cursor-pointer group" @click="openChatWith(m.id)">
              <div class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-gold-400 transition-all">
                <img :src="src(m.photo)" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <span class="absolute bottom-1 left-2 text-[11px] font-bold truncate w-[80%]">{{ m.name }}</span>
              </div>
            </div>
          </div>
          <div v-else class="py-20 text-center flex flex-col items-center gap-3"><Heart :size="28" :stroke-width="1.5" class="text-white/25" /><p class="text-white/40 text-sm">Keep swiping to find matches.</p></div>
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
        <p class="text-xs text-white/60 mb-3">See who likes you and match faster.</p>
        <button @click="router.push('/premium')" class="w-full py-2 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5">Upgrade</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Flame, Sparkles, Star, User as UserIcon, Heart, MessageCircle } from 'lucide-vue-next'
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

const API_ORIGIN = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
const src = (u) => (!u ? 'https://via.placeholder.com/150' : (u.startsWith('http') ? u : API_ORIGIN + u))

const topNavItems = [
  { name: 'discover', route: '/encounters', label: 'Discover', icon: Flame },
  { name: 'plans', route: '/feed', label: 'Plans', icon: Sparkles },
  { name: 'picks', route: '/daily-picks', label: 'Picks', icon: Star }
]
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
  } catch (e) {
    chats.value = []; newMatches.value = []
  }
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
