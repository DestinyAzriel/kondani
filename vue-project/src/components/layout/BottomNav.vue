<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-night-950/85 backdrop-blur-xl border-t border-white/10 pb-safe md:hidden z-50"
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

        <span
          v-if="item.badge && item.badge > 0"
          class="absolute top-1 right-3 bg-lagoon-400 text-night-950 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-night-950"
        >
          {{ item.badge > 9 ? '9+' : item.badge }}
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { Flame, Sparkles, Star, MessageCircle, User } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

// Swipe-first: Discover (swipe) is home. Plans = intents feed. Picks = daily picks.
const navItems = [
  { name: 'discover', route: '/encounters', label: 'Discover', icon: Flame },
  { name: 'plans', route: '/feed', label: 'Plans', icon: Sparkles },
  { name: 'picks', route: '/daily-picks', label: 'Picks', icon: Star },
  { name: 'chats', route: '/chats', label: 'Chats', icon: MessageCircle },
  { name: 'you', route: '/profile', label: 'You', icon: User }
]

const isActive = (routePath) => route.path === routePath || route.path.startsWith(routePath + '/')
const navigate = (routePath) => router.push(routePath)
</script>

<style scoped>
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
</style>
