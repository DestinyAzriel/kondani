<template>
  <div class="like-card glass-card overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10 cursor-pointer" @click="$emit('click', like)">
    <div class="flex p-4 items-center gap-4">
      <!-- Avatar -->
      <div class="relative flex-shrink-0">
        <img :src="photo" :alt="like.name"
             :class="['w-16 h-16 rounded-full object-cover border-2 border-white/10', !isPremium && !like.isMutual ? 'blur-xl' : '']" />
        <div v-if="!isPremium && !like.isMutual" class="absolute inset-0 flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center shadow-lg">
            <LockIcon size="14" class="text-night-950" />
          </div>
        </div>
        <span v-if="like.isVerified && (isPremium || like.isMutual)"
              class="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-gold-300 to-gold-500 rounded-full flex items-center justify-center border-2 border-night-950">
          <CheckIcon size="10" class="text-night-950 stroke-[4]" />
        </span>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-white text-lg truncate">
          {{ (isPremium || like.isMutual) ? like.name : 'Someone likes you' }}
        </h3>
        <p v-if="like.isMutual" class="text-lagoon-300 text-sm font-medium mt-0.5">✦ It's a match!</p>
        <p v-else-if="!isPremium" class="text-white/50 text-sm mt-0.5">Upgrade to see who</p>
        <p v-else class="text-white/50 text-sm mt-0.5">Liked your profile</p>

        <div class="mt-2">
          <button v-if="like.isMutual" @click.stop="$emit('sayHi', like)"
                  class="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 text-sm rounded-full font-bold hover:scale-105 transition-transform">
            Say hi ✦
          </button>
          <button v-else-if="!isPremium" @click.stop="$emit('upgrade')"
                  class="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 text-sm rounded-full font-bold hover:scale-105 transition-transform">
            Unlock 👑
          </button>
          <button v-else @click.stop="$emit('sayHi', like)"
                  class="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-300 text-night-950 text-sm rounded-full font-bold hover:scale-105 transition-transform">
            Like back ♥
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check as CheckIcon, Lock as LockIcon } from 'lucide-vue-next'

const props = defineProps({
  like: { type: Object, required: true },
  isPremium: { type: Boolean, default: false }
})
defineEmits(['click', 'sayHi', 'upgrade'])

const API_ORIGIN = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
const photo = computed(() => {
  const p = props.like.photo || props.like.avatar
  if (!p) return 'https://via.placeholder.com/150'
  return p.startsWith('http') ? p : API_ORIGIN + p
})
</script>
