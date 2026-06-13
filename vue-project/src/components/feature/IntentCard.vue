<template>
  <div class="intent-card glass-card overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:scale-[1.02] cursor-pointer" @click="$emit('click', intent)">
    <!-- Image -->
    <div class="relative w-full h-60 bg-night-900 overflow-hidden">
      <img
        v-if="!imageError && photo"
        :src="photo"
        :alt="intent.name"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="imageError = true"
      />
      <div v-else class="absolute inset-0 flex items-center justify-center text-white/30 text-5xl">✦</div>
      <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night-950 via-night-950/60 to-transparent pointer-events-none"></div>

      <div class="absolute inset-x-0 top-0 flex justify-between items-start p-3">
        <span v-if="intent.isVerified" class="inline-flex items-center gap-1 bg-gradient-to-r from-gold-300 to-gold-500 text-night-950 text-xs font-bold px-2.5 py-1 rounded-full">
          <CheckIcon size="12" class="stroke-[4]" /> Verified
        </span>
        <span v-if="intent.matchScore && intent.matchScore > 70" class="bg-night-950/60 backdrop-blur text-gold-300 text-xs font-bold px-2.5 py-1 rounded-full border border-gold-400/30">
          ✦ {{ intent.matchScore }}%
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 relative -mt-10 z-20">
      <h3 class="font-bold text-white text-lg leading-tight">
        {{ intent.name }} <span class="text-base font-normal text-white/50">{{ intent.age }}</span>
      </h3>
      <div v-if="intent.distance" class="flex items-center gap-1.5 text-lagoon-300 text-xs mt-1">
        <MapPinIcon size="14" /><span class="font-medium">{{ intent.distance }}</span>
      </div>

      <p v-if="intent.bio" class="text-white/70 text-sm leading-relaxed my-3 line-clamp-2">{{ intent.bio }}</p>

      <div v-if="intent.interests && intent.interests.length" class="flex flex-wrap gap-1.5 mb-3">
        <span v-for="(interest, i) in intent.interests.slice(0, 3)" :key="i" class="px-2.5 py-1 bg-white/8 text-white/80 text-xs rounded-full border border-white/10 font-medium">{{ interest }}</span>
      </div>

      <div class="flex gap-2 pt-1">
        <button @click.stop="$emit('pass')" class="flex-1 py-2.5 border border-white/10 text-white/70 rounded-xl font-semibold text-xs hover:bg-white/5 transition-all">Pass</button>
        <button @click.stop="$emit('join')" class="flex-1 py-2.5 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 rounded-xl font-bold text-xs hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5">
          Join ✦
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Check as CheckIcon, MapPin as MapPinIcon } from 'lucide-vue-next'

const props = defineProps({ intent: { type: Object, required: true } })
defineEmits(['click', 'pass', 'join'])

const imageError = ref(false)
const API_ORIGIN = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
const photo = computed(() => {
  const p = props.intent.photos?.[0]
  if (!p) return ''
  return p.startsWith('http') ? p : API_ORIGIN + p
})
</script>

<style scoped>
.intent-card { cursor: pointer; }
</style>
