<template>
  <div class="likes-view p-4 min-h-screen bg-night-950 text-white relative overflow-hidden pb-28">
    <div class="stars fixed inset-0 pointer-events-none"></div>
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[45%] rounded-full blur-[100px]" style="background: radial-gradient(circle, rgba(244,183,64,.12), transparent 70%)"></div>
    </div>

    <div class="mb-6 relative z-10">
      <h1 class="text-3xl font-bold font-display mb-1">Who likes you</h1>
      <p class="text-white/55">People who've shown interest in you</p>
    </div>

    <!-- Premium upsell -->
    <div v-if="!isPremium" class="glass-card p-4 mb-6 relative z-10 rounded-2xl border border-gold-400/30 bg-gradient-to-r from-gold-500/10 to-lagoon-400/10">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="font-bold flex items-center gap-2"><span class="text-gold-300">👑</span> Kondani Gold</h3>
          <p class="text-white/60 text-sm">See everyone who likes you instantly</p>
        </div>
        <button @click="router.push('/premium')" class="px-5 py-2 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-full font-bold whitespace-nowrap hover:scale-105 transition-transform">Upgrade</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="relative mb-6 z-10">
      <div class="flex bg-white/5 rounded-2xl p-1 border border-white/10 relative">
        <div class="absolute top-1 bottom-1 bg-gradient-to-r from-gold-500 to-gold-300 rounded-xl transition-all duration-300"
             :style="{ left: activeTab === 'new' ? '4px' : '50%', width: 'calc(50% - 4px)' }"></div>
        <button class="flex-1 py-2 rounded-xl text-sm font-semibold relative z-10 transition-all"
                :class="activeTab === 'new' ? 'text-night-950' : 'text-white/60'" @click="setActiveTab('new')">
          New <span v-if="unreadCount > 0" class="ml-1 text-[10px] font-bold">({{ unreadCount }})</span>
        </button>
        <button class="flex-1 py-2 rounded-xl text-sm font-semibold relative z-10 transition-all"
                :class="activeTab === 'mutual' ? 'text-night-950' : 'text-white/60'" @click="setActiveTab('mutual')">
          Matches
        </button>
      </div>
    </div>

    <Transition name="fade" mode="out-in">
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <SkeletonLoader v-for="i in 4" :key="i" type="profile" />
      </div>

      <div v-else-if="likes.length > 0" :key="activeTab" class="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <LikeCard v-for="like in likes" :key="like.id" :like="like" :isPremium="isPremium"
                  @sayHi="handleSayHi" @upgrade="router.push('/premium')" />
      </div>

      <EmptyState v-else :key="`empty-${activeTab}`" type="no-likes"
        :title="activeTab === 'mutual' ? 'No matches yet' : 'No likes yet'"
        :message="activeTab === 'mutual' ? 'When you like each other, they appear here.' : 'People who like you will show up here. Keep swiping!'"
        action-text="Start discovering" @action="router.push('/encounters')" />
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLikes } from '@/composables/useLikes'
import { useAuthStore } from '@/stores/auth'
import LikeCard from '@/components/feature/LikeCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const { likes, activeTab, unreadCount, isLoading, setActiveTab } = useLikes()

const isPremium = computed(() => !!authStore.user?.isPremium)

const handleSayHi = (like) => {
  const myId = String(authStore.user?._id || authStore.user?.id || '')
  const chatId = [myId, String(like.id)].sort().join('_')
  router.push(`/chats/${chatId}`)
}
</script>

<style scoped>
.stars{background:radial-gradient(1.5px 1.5px at 18% 12%,rgba(255,215,130,.7),transparent),radial-gradient(1px 1px at 70% 8%,rgba(255,255,255,.5),transparent),radial-gradient(1px 1px at 88% 20%,rgba(255,215,130,.5),transparent);}
</style>
