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

    <!-- ====== MOBILE: Standard single-column ====== -->
    <div v-else class="pb-24 relative z-10">
      <div class="sticky top-0 z-20 bg-night-950/85 backdrop-blur-md border-b border-white/5 px-4 py-4">
        <h1 class="k-title">Messages</h1>
      </div>
      <div class="px-4 pt-5 space-y-6">
        <section v-if="newMatches.length > 0">
          <h2 class="k-label mb-3" style="color:var(--k-gold)">New matches</h2>
          <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div v-for="match in newMatches" :key="match.id"
                 class="flex-shrink-0 w-[68px] text-center cursor-pointer group"
                 @click="openChatWithUser(match.id)">
              <div class="relative w-16 h-16 mx-auto mb-1.5" @click.stop="openProfilePreview(match)" title="View profile">
                <img :src="mediaUrl(match.photo)" class="w-full h-full rounded-full object-cover border-2 border-gold-400 p-0.5 group-hover:scale-105 transition-transform" />
                <div v-if="match.isVerified" class="absolute bottom-0 right-0 bg-gradient-to-r from-gold-300 to-gold-500 rounded-full p-1 border-2 border-night-950">
                  <CheckIcon size="9" class="text-night-950 stroke-[4]" />
                </div>
              </div>
              <span class="text-xs font-medium text-white/80 truncate block">{{ match.name }}</span>
            </div>
          </div>
        </section>
        <section>
          <h2 class="k-label mb-3">Conversations</h2>
          <div v-if="isLoading" class="space-y-3">
            <SkeletonLoader v-for="i in 5" :key="i" type="chat" />
          </div>
          <div v-else-if="chats.length > 0" class="space-y-2">
            <div v-for="chat in chats" :key="chat.id"
                 class="flex items-center gap-3.5 p-3 k-card hover:bg-white/[.07] transition-all cursor-pointer active:scale-[0.98]"
                 @click="openChat(chat.id)">
              <div class="relative shrink-0" @click.stop="openProfilePreview(chat)" title="View profile">
                <img :src="mediaUrl(chat.photo)" class="w-14 h-14 rounded-2xl object-cover ring-2 ring-transparent hover:ring-gold-400/50 transition-all" />
                <div v-if="chat.online" class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-night-950" style="background:var(--k-lagoon)"></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                  <h3 class="k-serif text-base truncate flex items-center gap-1.5">
                    {{ chat.name }}
                    <BadgeCheck v-if="chat.isVerified" :size="14" style="color:var(--k-gold)" />
                  </h3>
                  <span class="text-xs text-white/40 whitespace-nowrap ml-2">{{ formatTime(chat.lastMessageTime) }}</span>
                </div>
                <div v-if="chat.typing" class="flex items-center gap-1.5 mt-1">
                  <div class="flex gap-1">
                    <div class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce"></div>
                    <div class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce" style="animation-delay:.2s"></div>
                    <div class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce" style="animation-delay:.4s"></div>
                  </div>
                  <span class="text-xs text-lagoon-300">typing...</span>
                </div>
                <div v-else class="flex items-center gap-2 mt-0.5">
                  <p class="text-sm truncate" :class="chat.unread ? 'text-white font-medium' : 'text-white/55'">{{ chat.lastMessage }}</p>
                  <span v-if="chat.unread" class="ml-auto w-5 h-5 rounded-full bg-lagoon-400 text-night-950 text-[10px] font-bold flex items-center justify-center flex-shrink-0">•</span>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { intentService } from '@/services/intentService'
import { socketService } from '@/services/socketService'
import { Check as CheckIcon, BadgeCheck, MessageCircle as MessageCircleIcon } from 'lucide-vue-next'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ChatPanel from '@/components/feature/ChatPanel.vue'
import ProfilePreviewModal from '@/components/feature/modal/ProfilePreviewModal.vue'
import { mediaUrl } from '@/utils/media'

const router = useRouter()
const chats = ref([])
const newMatches = ref([])
const isLoading = ref(true)
const activeChatId = ref(null)

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

const isDesktop = ref(window.innerWidth >= 768)
const onResize = () => { isDesktop.value = window.innerWidth >= 768 }

const handleNewMessage = (message) => {
  const i = chats.value.findIndex(c => String(c.id) === String(message.chatId))
  if (i !== -1) {
    const chat = chats.value[i]
    chat.lastMessage = message.content
    chat.lastMessageTime = new Date().toISOString()
    if (String(message.chatId) !== activeChatId.value) chat.unread = true
    chats.value.splice(i, 1)
    chats.value.unshift(chat)
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

const selectChat = (id) => {
  activeChatId.value = String(id)
  const chat = chats.value.find(c => String(c.id) === String(id))
  if (chat) chat.unread = false
}

const openChat = (id) => router.push(`/chats/${id}`)
const openChatWithUser = (userId) => router.push(`/chats/${userId}`)

const handleUserStatus = ({ userId, isOnline }) => {
  const chat = chats.value.find(c => String(c.userId) === String(userId))
  if (chat) {
    chat.online = isOnline
  }
}

onMounted(async () => {
  window.addEventListener('resize', onResize)
  socketService.connect()
  socketService.on('new_message', handleNewMessage)
  socketService.on('user_status', handleUserStatus)
  try {
    await intentService.setUserOnline()
    const chatData = await intentService.getChats()
    chats.value = chatData?.chats || []
    const likeData = await intentService.getLikes()
    newMatches.value = likeData?.mutualLikes || []
    // Auto-select first chat on desktop
    if (isDesktop.value && chats.value.length > 0) {
      activeChatId.value = String(chats.value[0].id)
    }
  } catch (e) {
    chats.value = []; newMatches.value = []
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  socketService.off('new_message', handleNewMessage)
  socketService.off('user_status', handleUserStatus)
  intentService.setUserOffline()
})
</script>

<style scoped>
.desktop-layout { overflow: hidden; height: 100vh; height: 100dvh; }

.desktop-two-panel {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.chat-list-panel {
  width: 320px;
  min-width: 260px;
  flex-shrink: 0;
  background: rgba(14, 31, 41, 0.7);
}

.chat-content-panel {
  flex: 1;
  min-width: 0;
  background: var(--k-night);
}

.border-white\/8 { border-color: rgba(255,255,255,.08); }
.divide-white\/5 > * { border-color: rgba(255,255,255,.05); }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
