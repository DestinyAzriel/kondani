<template>
  <div class="empty-state" :class="`empty-state-${type}`">
    <div class="empty-state-content">
      <!-- Icon/Illustration -->
      <div class="empty-state-icon" v-html="iconSvg"></div>
      
      <!-- Title -->
      <h3 class="empty-state-title">{{ title }}</h3>
      
      <!-- Description -->
      <p class="empty-state-description">{{ description }}</p>
      
      <!-- Action Button -->
      <button 
        v-if="actionText"
        @click="$emit('action')"
        class="empty-state-action"
      >
        {{ actionText }}
        <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>

      <!-- Secondary Action -->
      <button 
        v-if="secondaryText"
        @click="$emit('secondary-action')"
        class="empty-state-secondary"
      >
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
      'no-matches',
      'no-likes',
      'no-chats',
      'no-photos',
      'no-cards',
      'no-picks',
      'no-results'
    ].includes(value)
  },
  title: String,
  description: String,
  actionText: String,
  secondaryText: String
})

defineEmits(['action', 'secondary-action'])

const emptyStates = {
  'no-matches': {
    title: 'No Matches Yet',
    description: 'Start swiping to find your perfect match. The more you swipe, the better our algorithm gets!',
    icon: `<svg class="w-24 h-24 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>`,
    actionText: 'Start Swiping'
  },
  'no-likes': {
    title: 'No Likes Yet',
    description: 'People who like you will appear here. Complete your profile to get more likes!',
    icon: `<svg class="w-24 h-24 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>`,
    actionText: 'Complete Profile'
  },
  'no-chats': {
    title: 'No Conversations Yet',
    description: 'When you match with someone, you can start chatting here. Go find your match!',
    icon: `<svg class="w-24 h-24 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>`,
    actionText: 'Find Matches'
  },
  'no-photos': {
    title: 'Add Your Photos',
    description: 'Profiles with photos get 10x more matches. Add at least 2 photos to get started!',
    icon: `<svg class="w-24 h-24 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>`,
    actionText: 'Upload Photos'
  },
  'no-cards': {
    title: "You're All Caught Up!",
    description: 'Check back later for more profiles, or try adjusting your preferences to see more people.',
    icon: `<svg class="w-24 h-24 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>`,
    actionText: 'Adjust Preferences'
  },
  'no-picks': {
    title: 'Daily Picks Coming Soon',
    description: 'Your personalized picks refresh at 6 PM every day. Check back then!',
    icon: `<svg class="w-24 h-24 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>`,
    actionText: 'Explore Encounters'
  },
  'no-results': {
    title: 'No Results Found',
    description: "We couldn't find what you're looking for. Try adjusting your search or filters.",
    icon: `<svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>`,
    actionText: 'Clear Filters'
  }
}

const currentState = computed(() => emptyStates[props.type] || emptyStates['no-results'])

const iconSvg = computed(() => currentState.value.icon)
const title = computed(() => props.title || currentState.value.title)
const description = computed(() => props.description || currentState.value.description)
const actionText = computed(() => props.actionText || currentState.value.actionText)
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 24px;
}

.empty-state-content {
  text-align: center;
  max-width: 400px;
  animation: fadeInUp 0.6s ease-out;
}

.empty-state-icon {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

.empty-state-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 12px;
  font-family: var(--font-display);
}

.empty-state-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin-bottom: 32px;
}

.empty-state-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  margin-bottom: 12px;
}

.empty-state-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.empty-state-action:active {
  transform: translateY(0);
}

.empty-state-secondary {
  display: block;
  width: 100%;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.empty-state-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
