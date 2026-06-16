<template>
  <div class="empty-state">
    <div class="empty-state-content">
      <div class="empty-state-icon" v-html="iconSvg"></div>

      <h3 class="empty-state-title">{{ title }}</h3>
      <p class="empty-state-description">{{ description }}</p>

      <button v-if="actionText" @click="$emit('action')" class="empty-state-action">
        {{ actionText }}
        <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>

      <button v-if="secondaryText" @click="$emit('secondary-action')" class="empty-state-secondary">
        {{ secondaryText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => [
      'no-matches', 'no-likes', 'no-chats', 'no-photos', 'no-cards', 'no-picks', 'no-results'
    ].includes(value)
  },
  title: String,
  description: String,
  actionText: String,
  secondaryText: String
})

defineEmits(['action', 'secondary-action'])

// All icons inherit currentColor (gold) from the tile — no off-theme colors.
const emptyStates = {
  'no-matches': {
    title: 'No matches yet',
    description: 'Start swiping to find your match. The more you swipe, the better your picks get.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`,
    actionText: 'Start swiping'
  },
  'no-likes': {
    title: 'No likes yet',
    description: 'People who like you will appear here. Complete your profile to get more likes.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`,
    actionText: 'Complete profile'
  },
  'no-chats': {
    title: 'No conversations yet',
    description: 'When you match with someone, you can start chatting here. Go find your match!',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>`,
    actionText: 'Find matches'
  },
  'no-photos': {
    title: 'Add your photos',
    description: 'Profiles with photos get far more matches. Add at least 2 to get started.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
    actionText: 'Upload photos'
  },
  'no-cards': {
    title: "You're all caught up",
    description: 'Check back later for more profiles, or try adjusting your preferences to see more people.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    actionText: 'Adjust preferences'
  },
  'no-picks': {
    title: 'No picks right now',
    description: 'Your personalised picks refresh at 6 PM every day. Check back then!',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>`,
    actionText: 'Explore discover'
  },
  'no-results': {
    title: 'No results found',
    description: "We couldn't find what you're looking for. Try adjusting your search or filters.",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>`,
    actionText: 'Clear filters'
  }
}

const currentState = computed(() => emptyStates[props.type] || emptyStates['no-results'])
const iconSvg = computed(() => currentState.value.icon)
const title = computed(() => props.title || currentState.value.title)
const description = computed(() => props.description || currentState.value.description)
const actionText = computed(() => props.actionText || currentState.value.actionText)
</script>

<style scoped>
.empty-state { display: flex; align-items: center; justify-content: center; min-height: 420px; padding: 40px 24px; }
.empty-state-content { text-align: center; max-width: 380px; animation: fadeInUp 0.5s ease-out; }

.empty-state-icon {
  width: 84px; height: 84px; margin: 0 auto 24px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 24px;
  background: rgba(244, 183, 64, .12);
  border: 1px solid rgba(244, 183, 64, .22);
  color: var(--k-gold);
}
.empty-state-icon :deep(svg) { width: 40px; height: 40px; }

.empty-state-title { font-family: 'Fraunces', serif; font-weight: 600; font-size: 26px; color: #fff; margin-bottom: 10px; letter-spacing: -.01em; }
.empty-state-description { font-size: 15px; color: rgba(255, 255, 255, 0.55); line-height: 1.6; margin-bottom: 28px; }

.empty-state-action {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 30px; border: none; cursor: pointer;
  background: linear-gradient(95deg, var(--k-gold), var(--k-gold-l));
  color: var(--k-night); font-weight: 700; border-radius: 99px;
  box-shadow: 0 10px 26px rgba(244, 183, 64, .35); transition: transform .15s;
  margin-bottom: 12px;
}
.empty-state-action:hover { transform: translateY(-2px); }

.empty-state-secondary {
  display: block; width: 100%; padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05); color: rgba(255, 255, 255, 0.8);
  font-weight: 600; border-radius: 99px; border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background .2s; cursor: pointer;
}
.empty-state-secondary:hover { background: rgba(255, 255, 255, 0.1); }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
