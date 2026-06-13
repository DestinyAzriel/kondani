<template>
  <nav 
    class="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[375px] bg-deep-950/95 backdrop-blur-2xl border-r border-white/5 z-50 overflow-hidden"
    role="navigation"
  >
    <!-- Top Bar: Logo & Branding -->
    <div class="p-6 flex items-center gap-3 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
      <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <span class="text-xl">❤️</span>
      </div>
      <span class="text-2xl font-bold font-display tracking-tight text-white">Kondani</span>
    </div>

    <!-- User Profile Strip -->
    <div class="px-4 py-4 border-b border-white/5 bg-white/5">
      <div 
        class="flex items-center justify-between cursor-pointer group"
        @click="router.push('/profile')"
      >
        <div class="flex items-center gap-3">
          <div class="relative">
            <img 
              v-if="profile?.photos?.[0]"
              :src="profile.photos[0]" 
              class="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 ring-2 ring-emerald-500/20 group-hover:scale-105 transition-all"
            />
            <div v-else class="w-10 h-10 rounded-full bg-deep-900 flex items-center justify-center border border-white/10">
              <UserIcon size="20" class="text-white/40" />
            </div>
            <div v-if="profile?.isOnline" class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-deep-950"></div>
          </div>
          <span class="font-bold text-white group-hover:text-emerald-400 transition-colors">My Profile</span>
        </div>
        
        <div class="flex items-center gap-1">
          <button 
            v-for="item in topNavItems" 
            :key="item.name"
            @click.stop="navigate(item.name)"
            class="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all relative group"
            :class="{ 'text-emerald-500 bg-emerald-500/10': isActive(item.route) }"
            :title="item.label"
          >
            <component :is="item.icon" :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Sidebar Tabs: Matches vs Messages -->
    <div class="flex flex-col flex-1 min-h-0">
      <div class="flex p-4 gap-6 border-b border-white/5">
        <button 
          @click="sidebarTab = 'matches'"
          class="text-sm font-bold uppercase tracking-wider transition-all relative pb-2"
          :class="sidebarTab === 'matches' ? 'text-white' : 'text-white/40 hover:text-white/60'"
        >
          Matches
          <div v-if="sidebarTab === 'matches'" class="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span v-if="newMatches.length > 0" class="ml-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{{ newMatches.length }}</span>
        </button>
        <button 
          @click="sidebarTab = 'messages'"
          class="text-sm font-bold uppercase tracking-wider transition-all relative pb-2"
          :class="sidebarTab === 'messages' ? 'text-white' : 'text-white/40 hover:text-white/60'"
        >
          Messages
          <div v-if="sidebarTab === 'messages'" class="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="flex-1 overflow-y-auto scrollbar-hide py-2">
        <!-- Matches Tab -->
        <div v-if="sidebarTab === 'matches'" class="px-4 animate-fade-in">
          <div v-if="newMatches.length > 0" class="grid grid-cols-3 gap-4 py-4">
            <div 
              v-for="match in newMatches" 
              :key="match.id"
              class="flex flex-col items-center gap-2 cursor-pointer group"
              @click="openChat(match.id)"
            >
              <div class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-emerald-500 transition-all">
                <img :src="match.photo || match.avatar" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <span class="absolute bottom-1 left-2 text-[11px] font-bold text-white truncate w-[80%]">{{ match.name }}</span>
              </div>
            </div>
          </div>
          <div v-else class="py-20 text-center">
            <div class="text-4xl mb-4 opacity-20">🎯</div>
            <p class="text-white/40 text-sm italic">Keep swiping to find your matches!</p>
          </div>
        </div>

        <!-- Messages Tab -->
        <div v-if="sidebarTab === 'messages'" class="animate-fade-in">
          <div v-if="chats.length > 0" class="divide-y divide-white/5">
            <div 
              v-for="chat in chats" 
              :key="chat.id"
              class="flex items-center gap-4 px-4 py-4 hover:bg-white/5 cursor-pointer transition-all group"
              @click="openChat(chat.id)"
            >
              <div class="relative shrink-0">
                <img :src="chat.photo || chat.avatar" class="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-emerald-500/50 transition-all" />
                <div v-if="chat.online || chat.isOnline" class="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-deep-950"></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-baseline mb-1">
                  <h3 class="font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{{ chat.name }}</h3>
                  <span class="text-[10px] text-white/40 uppercase">{{ chat.lastMessageTime || chat.timeSent }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <p class="text-sm text-white/60 truncate" :class="{ 'text-white font-bold': chat.unread || chat.unreadCount > 0 }">
                    {{ chat.lastMessage }}
                  </p>
                  <div v-if="chat.unread || chat.unreadCount > 0" class="w-2 h-2 bg-emerald-500 rounded-full grow-0 shrink-0"></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="py-20 text-center">
            <div class="text-4xl mb-4 opacity-20">💬</div>
            <p class="text-white/40 text-sm">No messages yet. Start a conversation!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Gold Upsell / Pro Status -->
    <div class="p-4 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-t border-white/5">
      <div class="bg-white/5 rounded-2xl p-4 text-center border border-white/10 backdrop-blur-md">
        <p class="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Kondani Gold</p>
        <p class="text-xs text-white/60 mb-3">See who likes you and get more matches!</p>
        <button 
          @click="router.push('/premium')"
          class="w-full py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          UPGRADE NOW
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Flame, MessageCircle, User as UserIcon, Sparkles, MapPin, CheckCircle2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useProfile } from '@/composables/useProfile'
import { useLikes } from '@/composables/useLikes'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { profile } = useProfile()
const { likes: newMatches } = useLikes() // Reusing the likes composable for matches

const sidebarTab = ref('matches')
const chats = ref([])

// Mock chats for sidebar - in real app, fetch from chatService
const mockChats = [
  { id: 1, name: 'Thoko', photo: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=150', lastMessage: 'That sounds great! 😃', lastMessageTime: '12:45 PM', unread: true, online: true },
  { id: 2, name: 'Yamikani', photo: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=150', lastMessage: 'See you at the terrace then.', lastMessageTime: 'YESTERDAY', unread: false, online: false }
]

const topNavItems = [
  { name: 'encounters', route: '/encounters', label: 'Encounters', icon: Flame },
  { name: 'feed', route: '/feed', label: 'Explorer', icon: MapPin },
  { name: 'daily-picks', route: '/daily-picks', label: 'Top Picks', icon: Sparkles }
]

const isActive = (routePath) => route.path === routePath

const navigate = (name) => {
  const item = topNavItems.find(i => i.name === name)
  if (item) router.push(item.route)
}

const openChat = (id) => {
  router.push(`/chats/${id}`)
}

onMounted(() => {
  // Pull real chats if available or use mock
  chats.value = mockChats
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>