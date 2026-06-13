<template>
  <div 
    class="chat-item glass-card overflow-hidden transition-all duration-300 hover:bg-white/10 cursor-pointer"
    @click="$emit('click', chat)"
  >
    <div class="flex p-4 items-center">
      <!-- Avatar -->
      <div class="relative mr-4 flex-shrink-0">
        <img 
          :src="chat.avatar" 
          :alt="chat.name"
          class="w-14 h-14 rounded-full object-cover border-2 border-white/10"
        />
        <!-- Online indicator -->
        <div 
          v-if="chat.isOnline"
          class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-deep-950 shadow-sm animate-pulse"
        ></div>
        <!-- Verified badge -->
        <div 
          v-if="chat.isVerified"
          class="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-deep-950"
        >
          <span class="text-white text-[10px] font-bold">✓</span>
        </div>
      </div>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-baseline mb-1">
          <h3 class="font-bold text-white text-lg">
            {{ chat.name }}
          </h3>
          <span class="text-xs text-white/40 whitespace-nowrap">
            {{ formatTime(chat.timeSent) }}
          </span>
        </div>
        
        <!-- Intent context -->
        <p v-if="chat.intentContext" class="text-emerald-400 text-xs font-medium mb-1 truncate">
          Replying to: {{ chat.intentContext }}
        </p>
        
        <!-- Last message -->
        <div class="flex justify-between items-center">
          <p class="text-white/60 text-sm truncate pr-2" :class="{ 'font-semibold text-white': chat.unreadCount > 0 }">
            {{ chat.lastMessage }}
          </p>
          <span 
            v-if="chat.unreadCount > 0"
            class="bg-emerald-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20"
          >
            {{ chat.unreadCount > 9 ? '9+' : chat.unreadCount }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  chat: { type: Object, required: true }
})

const emit = defineEmits(['click'])

const formatTime = (date) => {
  if (!date) return ''
  // Handle both Date object and timestamp/string
  const d = new Date(date)
  const now = new Date()
  const seconds = Math.floor((now - d) / 1000)
  
  if (seconds < 60) return 'Now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}
</script>