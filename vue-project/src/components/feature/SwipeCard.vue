<template>
  <div
    class="swipe-card absolute inset-0 bg-white rounded-3xl shadow-xl overflow-hidden"
    :style="cardStyle"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
    @mousemove="handleMouseMove"
    @touchmove="handleTouchMove"
    @mouseup="handleMouseUp"
    @touchend="handleTouchEnd"
  >
    <!-- Image -->
    <div class="h-3/5 relative">
      <img 
        :src="intent.avatar" 
        :alt="`${intent.name}`"
        class="w-full h-full object-cover"
      />
      <!-- Badges -->
      <div class="absolute top-4 left-4 flex gap-2">
        <span 
          v-if="intent.isVerified"
          class="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full"
        >
          ✓ Verified
        </span>
      </div>
      <div 
        v-if="intent.isOnline"
        class="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
      ></div>
    </div>
    
    <!-- Content -->
    <div class="p-5 h-2/5 flex flex-col justify-between">
      <div>
        <div class="flex justify-between items-start mb-2">
          <h2 class="text-xl font-bold text-gray-900">
            {{ intent.name }}, <span class="text-gray-600">{{ intent.age }}</span>
          </h2>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {{ intent.distance }}
          </span>
        </div>
        <p class="text-emerald-600 font-medium">
          {{ intent.intentTitle }}
        </p>
      </div>
      
      <div class="text-xs text-gray-500">
        {{ intent.location }}
      </div>
    </div>
    
    <!-- Overlays -->
    <div 
      v-if="direction === 'right'"
      class="absolute top-1/2 right-8 transform -translate-y-1/2 bg-emerald-600 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center opacity-90"
    >
      ❤️
    </div>
    <div 
      v-if="direction === 'left'"
      class="absolute top-1/2 left-8 transform -translate-y-1/2 bg-red-500 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center opacity-90"
    >
      ✖️
    </div>
  </div>
</template>

<script setup>
defineProps({
  intent: { type: Object, required: true },
  cardStyle: { type: Object, required: true },
  direction: { type: String, default: null }
})

const emit = defineEmits(['start', 'move', 'end'])

const handleMouseDown = (e) => emit('start', e.clientX, e.clientY)
const handleTouchStart = (e) => {
  const touch = e.touches[0]
  emit('start', touch.clientX, touch.clientY)
}

const handleMouseMove = (e) => emit('move', e.clientX, e.clientY)
const handleTouchMove = (e) => {
  const touch = e.touches[0]
  emit('move', touch.clientX, touch.clientY)
  e.preventDefault()
}

const handleMouseUp = () => emit('end')
const handleTouchEnd = () => emit('end')
</script>