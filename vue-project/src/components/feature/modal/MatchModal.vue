<template>
  <div 
    v-if="show"
    class="match-modal fixed inset-0 bg-deep-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click="dismiss"
  >
    <div 
      class="glass-card w-full max-w-sm p-8 transform transition-transform duration-300 relative overflow-hidden"
      @click.stop
    >
      <!-- Background Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none"></div>

      <!-- Celebration Header -->
      <div class="text-center py-4 relative z-10">
        <div class="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 class="text-3xl font-bold font-display text-white mb-2">It's a Match!</h2>
        <p class="text-white/60">You and {{ match.name }} like each other.</p>
      </div>
      
      <!-- Match Preview -->
      <div class="flex items-center justify-center py-8 relative z-10">
        <div class="relative flex items-center justify-center">
          <!-- Your avatar -->
          <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500 shadow-lg shadow-emerald-500/30 -ml-4 z-10">
            <img 
              :src="currentUser.avatar" 
              :alt="currentUser.name"
              class="w-full h-full object-cover"
            />
          </div>
          <!-- Match avatar -->
          <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500 shadow-lg shadow-emerald-500/30 -ml-8 z-20">
            <img 
              :src="match.avatar" 
              :alt="match.name"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex flex-col gap-3 pt-4 relative z-10">
        <button
          @click="openChat"
          class="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform"
        >
          Send Message
        </button>
        <button
          @click="dismiss"
          class="w-full py-4 border border-white/10 text-white/60 rounded-xl font-medium hover:bg-white/5 transition-colors"
        >
          Keep Swiping
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  match: { type: Object, required: true },
  currentUser: { 
    type: Object, 
    default: () => ({
      name: 'You',
      avatar: 'https://i.pravatar.cc/150?img=1'
    })
  }
})

const emit = defineEmits(['dismiss', 'openChat'])

const dismiss = () => emit('dismiss')
const openChat = () => emit('openChat')
</script>

<style scoped>
.match-modal {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>