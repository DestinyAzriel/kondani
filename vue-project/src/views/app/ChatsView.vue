<template>
  <div class="chats-view min-h-screen bg-night-950 text-white pb-24 relative overflow-hidden">
    <div class="stars fixed inset-0 pointer-events-none"></div>
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[45%] rounded-full blur-[100px]"
           style="background: radial-gradient(circle, rgba(45,212,191,.14), transparent 70%)"></div>
    </div>

    <!-- Header -->
    <div class="sticky top-0 z-20 bg-night-950/85 backdrop-blur-md border-b border-white/5 px-4 py-4">
      <h1 class="text-2xl font-bold font-display">Messages</h1>
    </div>

    <div class="px-4 pt-5 space-y-6 relative z-10">
      <!-- New matches -->
      <section v-if="newMatches.length > 0">
        <h2 class="text-xs font-bold text-gold-400 uppercase tracking-wider mb-3">New matches</h2>
        <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div
            v-for="match in newMatches"
            :key="match.id"
            class="flex-shrink-0 w-[68px] text-center cursor-pointer group"
            @click="openChatWithUser(match.id)"
          >
            <div class="relative w-16 h-16 mx-auto mb-1.5">
              <img :src="match.photo" class="w-full h-full rounded-full object-cover border-2 border-gold-400 p-0.5 group-hover:scale-105 transition-transform" />
              <div v-if="match.isVerified" class="absolute bottom-0 right-0 bg-gradient-to-r from-gold-300 to-gold-500 rounded-full p-1 border-2 border-night-950">
                <CheckIcon size="9" class="text-night-950 stroke-[4]" />
              </div>
            </div>
            <span class="text-xs font-medium text-white/80 truncate block">{{ match.name }}</span>
          </div>
        </div>
      </section>

      <!-- Conversations -->
      <section>
        <h2 class="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Conversations</h2>

        <div v-if="isLoading" class="space-y-3">
          <SkeletonLoader v-for="i in 5" :key="i" type="chat" />
        </div>

        <div v-else-if="chats.length > 0" class="space-y-2">
          <div
            v-for="chat in chats"
            :key="chat.id"
            class="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer active:scale-[0.98]"
            @click="openChat(chat.id)"
          >
            <div class="relative">
              <img :src="chat.photo" class="w-14 h-14 rounded-full object-cover" />
              <div v-if="chat.online" class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-lagoon-400 rounded-full border-2 border-night-950"></div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <h3 class="font-bold truncate flex items-center gap-1.5">
                  {{ chat.name }}
                  <span v-if="chat.isVerified" class="inline-flex items-center bg-gradient-to-r from-gold-300 to-gold-500 rounded-full p-0.5">
                    <CheckIcon size="9" class="text-night-950 stroke-[4]" />
                  </span>
                </h3>
                <span class="text-xs text-white/40 whitespace-nowrap ml-2">{{ formatTime(chat.lastMessageTime) }}</span>
              </div>

              <div v-if="chat.typing" class="flex items-center gap-1.5 mt-1">
                <div class="flex gap-1">
                  <div class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce"></div>
                  <div class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce" style="animation-delay:.2s"></div>
                  <div class="w-1.5 h-1.5 bg-lagoon-400 rounded-full animate-bounce" style="animation-delay:.4s"></div>
                </div>
                <span class="text-xs text-lagoon-300">typing…</span>
              </div>
              <div v-else class="flex items-center gap-2 mt-0.5">
                <p class="text-sm truncate" :class="chat.unread ? 'text-white font-medium' : 'text-white/55'">{{ chat.lastMessage }}</p>
                <span v-if="chat.unread" class="ml-auto w-5 h-5 rounded-full bg-lagoon-400 text-night-950 text-[10px] font-bold flex items-center justify-center flex-shrink-0">•</span>
              </div>
            </div>
          </div>
        </div>

        <EmptyState
          v-else
          type="no-chats"
          title="No conversations yet"
          message="When you match with someone, your chats appear here. Start swiping to make a connection."
          action-text="Start discovering"
          @action="router.push('/encounters')"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { intentService } from '@/services/intentService'
import { socketService } from '@/services/socketService'
import { Check as CheckIcon } from 'lucide-vue-next'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const router = useRouter()
const chats = ref([])
const newMatches = ref([])
const isLoading = ref(true)

const handleNewMessage = (message) => {
  const i = chats.value.findIndex(c => c.id === message.chatId)
  if (i !== -1) {
    const chat = chats.value[i]
    chat.lastMessage = message.content
    chat.lastMessageTime = new Date().toISOString()
    chat.unread = true
    chats.value.splice(i, 1)
    chats.value.unshift(chat)
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffH = Math.floor((now - date) / 3600000)
  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

onMounted(async () => {
  socketService.connect()
  socketService.on('new_message', handleNewMessage)
  try {
    await intentService.setUserOnline()
    const chatData = await intentService.getChats()
    chats.value = chatData?.chats || []
    const likeData = await intentService.getLikes()
    newMatches.value = likeData?.mutualLikes || []
  } catch (e) {
    console.error('Failed to load chats', e)
    chats.value = []
    newMatches.value = []
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  socketService.off('new_message', handleNewMessage)
  intentService.setUserOffline()
})

const openChat = (id) => router.push(`/chats/${id}`)
// New-match tap: chatId is the sorted pair; we route by their user id and let
// the chat room resolve. For now route to chats and let the list open.
const openChatWithUser = (userId) => router.push(`/chats/${userId}`)
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.stars {
  background:
    radial-gradient(1.5px 1.5px at 15% 12%, rgba(255,215,130,.7), transparent),
    radial-gradient(1px 1px at 70% 8%, rgba(255,255,255,.5), transparent),
    radial-gradient(1px 1px at 88% 18%, rgba(255,215,130,.6), transparent);
}
</style>
