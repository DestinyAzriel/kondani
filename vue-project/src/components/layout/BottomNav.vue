<template>
  <Teleport to="body">
    <nav
      class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-night-950/85 backdrop-blur-xl border-t border-white/10 pb-safe md:hidden z-50"
      role="navigation"
      aria-label="Main navigation"
    >
    <div class="flex justify-around items-center h-16 px-2">
      <button
        v-for="item in navItems"
        :key="item.name"
        class="flex flex-col items-center justify-center p-2 w-full relative group transition-colors"
        :class="isActive(item.route) ? 'text-gold-400' : 'text-white/40 hover:text-white/65'"
        @click="navigate(item.route)"
        :aria-current="isActive(item.route) ? 'page' : undefined"
        :aria-label="item.label"
      >
        <div
          v-if="isActive(item.route)"
          class="absolute -top-px w-10 h-[2px] rounded-full bg-gradient-to-r from-gold-500 to-gold-300 shadow-[0_0_10px_rgba(244,183,64,0.55)]"
        ></div>

        <component :is="item.icon" :size="23" stroke-width="2" class="transition-transform duration-300 group-active:scale-90" />
        <span class="text-[10px] mt-1 font-medium tracking-wide">{{ item.label }}</span>

        <!-- Kondani theme golden dot for Plans -->
        <span
          v-if="item.name === 'plans' && item.badge > 0"
          class="absolute top-2 right-4 w-2.5 h-2.5 bg-gradient-to-br from-gold-300 via-gold-400 to-amber-500 rounded-full border border-night-950 shadow-sm shadow-gold-400/60 animate-pulse pointer-events-none"
        ></span>

        <!-- Kondani theme gold badge for Likes (1, 2, etc.) -->
        <span
          v-else-if="item.badge && item.badge > 0"
          class="absolute top-1 right-2.5 bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 text-night-950 text-[10px] font-black rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border border-gold-300/40 shadow-sm shadow-gold-400/40 animate-pulse pointer-events-none"
        >
          {{ item.badge > 99 ? '99+' : item.badge }}
        </span>
      </button>
    </div>
    </nav>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Flame, Sparkles, Star, MessageCircle, User, Heart } from 'lucide-vue-next'
import { intentService } from '@/services/intentService'
import { socketService } from '@/services/socketService'

const router = useRouter()
const route = useRoute()
const likesCount = ref(0)
const plansCount = ref(0)

const navItems = computed(() => [
  { name: 'discover', route: '/encounters', label: 'Discover', icon: Flame },
  { name: 'likes', route: '/likes', label: 'Likes', icon: Heart, badge: likesCount.value },
  { name: 'plans', route: '/feed', label: 'Plans', icon: Sparkles, badge: plansCount.value },
  { name: 'chats', route: '/chats', label: 'Chats', icon: MessageCircle },
  { name: 'you', route: '/profile', label: 'You', icon: User }
])

const isActive = (routePath) => route.path === routePath || route.path.startsWith(routePath + '/')
const navigate = (routePath) => router.push(routePath)

const handleNewLike = () => {
  likesCount.value = (Number(likesCount.value) || 0) + 1
}

const handleNewPlan = () => {
  plansCount.value = (Number(plansCount.value) || 0) + 1
}

onMounted(async () => {
  socketService.on('new_like', handleNewLike)
  socketService.on('new_plan', handleNewPlan)

  try {
    const l = await intentService.getLikes()
    likesCount.value = l?.likesCount || (l?.newLikes?.length || 0)
  } catch (e) {
    likesCount.value = 0
  }

  try {
    const p = await intentService.getPlans()
    plansCount.value = p?.count || p?.plans?.length || 0
  } catch (e) {
    plansCount.value = 0
  }
})

onUnmounted(() => {
  socketService.off('new_like', handleNewLike)
  socketService.off('new_plan', handleNewPlan)
})
</script>

<style scoped>
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
</style>
