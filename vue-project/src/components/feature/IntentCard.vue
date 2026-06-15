<template>
  <div class="intent-card k-card overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer" @click="$emit('click', intent)">
    <!-- Image -->
    <div class="relative w-full h-60 overflow-hidden" style="background:linear-gradient(160deg,#0e1f29,#081016)">
      <img
        v-if="!imageError && photo"
        :src="photo"
        :alt="intent.name"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="imageError = true"
      />
      <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/25">
        <ImageIcon :size="42" :stroke-width="1.5" /><span class="text-xs">No photo yet</span>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
           style="background:linear-gradient(to top,var(--k-night),rgba(5,13,18,.55),transparent)"></div>

      <div class="absolute inset-x-0 top-0 flex justify-between items-start p-3">
        <span v-if="intent.isVerified" class="k-ver"><BadgeCheck :size="13" /> Verified</span>
        <span v-if="intent.matchScore && intent.matchScore > 70"
              class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border"
              style="background:rgba(5,13,18,.6);color:var(--k-gold-l);border-color:rgba(244,183,64,.3)">
          <Sparkles :size="12" /> {{ intent.matchScore }}%
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 relative -mt-10 z-20">
      <h3 class="k-serif text-xl leading-tight">
        {{ intent.name }} <span class="text-base font-normal text-white/50">{{ intent.age }}</span>
      </h3>
      <div v-if="intent.distance" class="flex items-center gap-1.5 text-xs mt-1.5" style="color:var(--k-lagoon)">
        <MapPinIcon :size="14" /><span class="font-medium">{{ intent.distance }}</span>
      </div>

      <p v-if="intent.bio" class="text-white/70 text-sm leading-relaxed my-3 line-clamp-2">{{ intent.bio }}</p>

      <div v-if="intent.interests && intent.interests.length" class="flex flex-wrap gap-1.5 mb-3">
        <span v-for="(interest, i) in intent.interests.slice(0, 3)" :key="i" class="k-chip" style="font-size:11px;padding:5px 10px">{{ interest }}</span>
      </div>

      <div class="flex gap-2.5 pt-1">
        <button @click.stop="$emit('pass')" class="k-btn k-btn-ghost flex-1" style="padding:11px;font-size:13px">Pass</button>
        <button @click.stop="$emit('join')" class="k-btn k-btn-gold flex-1" style="padding:11px;font-size:13px">
          <Heart :size="15" class="fill-current" /> Join
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { BadgeCheck, MapPin as MapPinIcon, Image as ImageIcon, Sparkles, Heart } from 'lucide-vue-next'

const props = defineProps({ intent: { type: Object, required: true } })
defineEmits(['click', 'pass', 'join'])

const imageError = ref(false)
import { mediaUrl } from '@/utils/media'
const photo = computed(() => mediaUrl(props.intent.photos?.[0]))
</script>

<style scoped>
.intent-card { cursor: pointer; }
</style>
