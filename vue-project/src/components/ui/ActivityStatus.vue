<template>
  <div class="activity-status inline-flex items-center gap-1.5" :class="containerClass">
    <!-- Status Dot -->
    <div
      v-if="status.dot"
      class="relative flex-shrink-0"
    >
      <div
        class="w-2 h-2 rounded-full"
        :class="[
          `bg-${status.color}-400`,
          status.animate ? 'animate-pulse' : ''
        ]"
      ></div>
      <!-- Ping Animation for "Active now" -->
      <div
        v-if="status.animate"
        class="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75"
        :class="`bg-${status.color}-400`"
      ></div>
    </div>

    <!-- Status Label -->
    <span
      v-if="showLabel"
      class="text-xs font-medium"
      :class="labelClass || `text-${status.color}-400`"
    >
      {{ status.label }}
    </span>

    <!-- Last Seen (optional) -->
    <span
      v-if="showLastSeen && lastSeen"
      class="text-xs text-white/40"
    >
      • {{ formatLastSeen(lastSeen) }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useActivityStatus } from '@/services/activityService'

const props = defineProps({
  lastSeen: {
    type: Number,
    default: null
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  showLastSeen: {
    type: Boolean,
    default: false
  },
  containerClass: {
    type: String,
    default: ''
  },
  labelClass: {
    type: String,
    default: null
  }
})

const { getUserStatus, formatLastSeen } = useActivityStatus()

const status = computed(() => {
  return getUserStatus(props.lastSeen)
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
