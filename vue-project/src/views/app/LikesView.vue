<template>
  <div class="likes-view k-page p-4 relative overflow-hidden pb-28">
    <div class="k-stars"></div>
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[45%] rounded-full blur-[100px]" style="background: radial-gradient(circle, rgba(244,183,64,.12), transparent 70%)"></div>
    </div>

    <div class="max-w-[1040px] mx-auto relative z-10">
      <div class="mb-6">
        <h1 class="k-title" style="font-size:2rem">Who likes you</h1>
        <p class="text-white/55 mt-1">People who've shown interest in you</p>
      </div>

      <!-- Premium upsell -->
      <div v-if="!isPremium" class="k-card p-4 mb-6" style="border-color:rgba(244,183,64,.3);background:linear-gradient(120deg,rgba(244,183,64,.1),var(--k-card))">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(244,183,64,.14);color:var(--k-gold)"><Crown :size="18" /></div>
            <div>
              <h3 class="font-semibold" style="color:var(--k-gold-l)">Kondani Gold</h3>
              <p class="text-white/60 text-sm">{{ likesCount > 0 ? `${likesCount} ${likesCount === 1 ? 'person likes' : 'people like'} you — see who instantly` : 'See everyone who likes you instantly' }}</p>
            </div>
          </div>
          <button @click="router.push('/premium')" class="k-btn k-btn-gold whitespace-nowrap" style="padding:9px 18px;font-size:13px">Upgrade</button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="relative mb-6">
        <div class="flex bg-white/5 rounded-2xl p-1 border border-white/10 relative">
          <div class="absolute top-1 bottom-1 rounded-xl transition-all duration-300"
               style="background:linear-gradient(90deg,var(--k-gold),var(--k-gold-l))"
               :style="{ left: activeTab === 'new' ? '4px' : '50%', width: 'calc(50% - 4px)' }"></div>
          <button class="flex-1 py-2 rounded-xl text-sm font-semibold relative z-10 transition-all"
                  :class="activeTab === 'new' ? '' : 'text-white/60'" :style="activeTab === 'new' ? 'color:var(--k-night)' : ''" @click="setActiveTab('new')">
            New <span v-if="unreadCount > 0" class="ml-1 text-[10px] font-bold">({{ unreadCount }})</span>
          </button>
          <button class="flex-1 py-2 rounded-xl text-sm font-semibold relative z-10 transition-all"
                  :class="activeTab === 'mutual' ? '' : 'text-white/60'" :style="activeTab === 'mutual' ? 'color:var(--k-night)' : ''" @click="setActiveTab('mutual')">
            Matches
          </button>
        </div>
      </div>

      <Transition name="fade" mode="out-in">
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonLoader v-for="i in 4" :key="i" type="profile" />
        </div>

        <!-- Free members: blurred locked tiles showing how many like them -->
        <div v-else-if="activeTab === 'new' && !isPremium && likesCount > 0" key="locked" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <button v-for="n in Math.min(likesCount, 9)" :key="n" class="locked-like" @click="router.push('/premium')">
            <Lock :size="22" />
            <span>Likes you</span>
          </button>
        </div>

        <div v-else-if="likes.length > 0" :key="activeTab" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LikeCard v-for="like in likes" :key="like.id" :like="like" :isPremium="isPremium"
                    @sayHi="handleSayHi" @upgrade="router.push('/premium')" />
        </div>

        <EmptyState v-else :key="`empty-${activeTab}`" type="no-likes"
          :title="activeTab === 'mutual' ? 'No matches yet' : 'No likes yet'"
          :message="activeTab === 'mutual' ? 'When you like each other, they appear here.' : 'People who like you will show up here. Keep swiping!'"
          action-text="Start discovering" @action="router.push('/encounters')" />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLikes } from '@/composables/useLikes'
import { useAuthStore } from '@/stores/auth'
import LikeCard from '@/components/feature/LikeCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { Crown, Lock } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const { likes, activeTab, unreadCount, isLoading, setActiveTab, likesCount } = useLikes()

const isPremium = computed(() => !!authStore.user?.isPremium)

const handleSayHi = (like) => {
  const myId = String(authStore.user?._id || authStore.user?.id || '')
  const chatId = [myId, String(like.id)].sort().join('_')
  router.push(`/chats/${chatId}`)
}
</script>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .2s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
.locked-like{aspect-ratio:1;border-radius:16px;border:1px solid rgba(244,183,64,.25);cursor:pointer;
  background:linear-gradient(135deg,rgba(244,183,64,.22),rgba(14,31,41,.65));
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;
  color:var(--k-gold-l);font-size:11px;font-weight:600;transition:transform .15s;}
.locked-like:hover{transform:translateY(-2px);}
</style>
