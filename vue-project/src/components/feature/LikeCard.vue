<template>
  <div class="like-card k-card overflow-hidden transition-all duration-300 hover:-translate-y-0.5 cursor-pointer" @click="$emit('click', like)">
    <div class="flex p-4 items-center gap-4">
      <!-- Avatar -->
      <div class="relative flex-shrink-0">
        <img :src="photo" :alt="like.name"
             :class="['w-16 h-16 rounded-2xl object-cover border border-white/10', !isPremium && !like.isMutual ? 'blur-xl' : '']" />
        <div v-if="!isPremium && !like.isMutual" class="absolute inset-0 flex items-center justify-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style="background:linear-gradient(135deg,var(--k-gold-l),var(--k-gold))">
            <LockIcon :size="14" style="color:var(--k-night)" />
          </div>
        </div>
        <span v-if="like.isVerified && (isPremium || like.isMutual)"
              class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2"
              style="background:linear-gradient(90deg,var(--k-gold-l),var(--k-gold));border-color:var(--k-night)">
          <Check :size="10" style="color:var(--k-night)" class="stroke-[4]" />
        </span>
        <span v-if="like.isSuper" class="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2"
              style="background:var(--k-gold);color:var(--k-night);border-color:var(--k-night)" title="Super Liked you">
          <Star :size="11" class="fill-current" />
        </span>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 class="k-serif text-lg truncate">
          {{ (isPremium || like.isMutual) ? like.name : 'Someone likes you' }}
        </h3>
        <p v-if="like.isMutual" class="text-sm font-medium mt-0.5" style="color:var(--k-lagoon)">It's a match</p>
        <p v-else-if="!isPremium" class="text-white/50 text-sm mt-0.5">Upgrade to see who</p>
        <p v-else class="text-sm mt-0.5" :class="like.isSuper ? '' : 'text-white/50'" :style="like.isSuper ? 'color:var(--k-gold-l)' : ''">{{ like.isSuper ? 'Super Liked you' : 'Liked your profile' }}</p>

        <div class="mt-2.5">
          <button v-if="like.isMutual" @click.stop="$emit('sayHi', like)" class="k-btn k-btn-gold" style="padding:8px 16px;font-size:13px">
            Say hi
          </button>
          <button v-else-if="!isPremium" @click.stop="$emit('upgrade')" class="k-btn k-btn-gold" style="padding:8px 16px;font-size:13px">
            <Crown :size="14" /> Unlock
          </button>
          <button v-else @click.stop="$emit('sayHi', like)" class="k-btn k-btn-gold" style="padding:8px 16px;font-size:13px">
            <Heart :size="14" class="fill-current" /> Like back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check, Lock as LockIcon, Crown, Heart, Star } from 'lucide-vue-next'

const props = defineProps({
  like: { type: Object, required: true },
  isPremium: { type: Boolean, default: false }
})
defineEmits(['click', 'sayHi', 'upgrade'])

import { mediaUrl } from '@/utils/media'
const photo = computed(() => mediaUrl(props.like.photo || props.like.avatar))
</script>
