<template>
  <div
    :style="{
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      width: '100%',
      height: '100%',
      userSelect: 'none',
      touchAction: 'none',
      pointerEvents: index === 0 ? 'auto' : 'none',
      zIndex: cardStyle.zIndex,
      transform: cardStyle.transform,
      transition: cardStyle.transition
    }"
    @mousedown="startDrag"
    @touchstart.passive="startDrag"
    @mousemove="onDrag"
    @touchmove.passive="onDrag"
    @mouseup="endDrag"
    @touchend="endDrag"
    @mouseleave="endDrag"
  >
    <div style="position: relative; width: 100%; height: 100%; border-radius: 16px; overflow: hidden; background: #0c1b26;">
      <!-- Photo Layer: position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; -->
      <img
        v-if="profile.photos && profile.photos.length"
        :src="mediaUrl(profile.photos[currentPhotoIndex])"
        class="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        draggable="false"
        alt="Profile photo"
      />
      <div
        v-else
        class="absolute inset-0 w-full h-full flex items-center justify-center select-none overflow-hidden"
        style="background: radial-gradient(circle at 50% 40%, rgba(244, 183, 64, 0.22), transparent 60%), radial-gradient(circle at 85% 85%, rgba(45, 212, 191, 0.15), transparent 55%), linear-gradient(160deg, #102432 0%, #08121a 55%, #050b10 100%);"
      >
        <!-- Subtle decorative backdrop aura rings -->
        <div class="absolute w-[300px] h-[300px] rounded-full border border-gold-400/10 pointer-events-none"></div>
        <div class="absolute w-[440px] h-[440px] rounded-full border border-white/5 pointer-events-none"></div>

        <!-- Hero Initials filling the photo space boldly like a picture (guaranteed zero overflow) -->
        <div class="relative flex items-center justify-center pb-20 sm:pb-24 pointer-events-none w-full px-6">
          <span
            class="font-display font-black leading-none select-none drop-shadow-[0_16px_40px_rgba(0,0,0,0.85)] truncate text-center max-w-full"
            style="font-size: clamp(76px, 22vw, 128px); background: linear-gradient(135deg, #fef3c7 0%, #f4b740 45%, #b45309 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"
          >
            {{ userInitials }}
          </span>
        </div>
      </div>

      <!-- Gradient layer: position: absolute; inset: 0; linear-gradient to top -->
      <div class="absolute inset-0 pointer-events-none z-10" style="background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 28%, rgba(0,0,0,0) 52%);"></div>

      <!-- Segmented Photo progress bars at top of photo -->
      <div v-if="profile.photos && profile.photos.length > 1" class="absolute top-2.5 inset-x-2.5 flex gap-1.5 z-30 pointer-events-none">
        <div
          v-for="(photo, index) in profile.photos"
          :key="index"
          class="flex-1 h-1 rounded-full transition-all duration-200"
          :class="index === currentPhotoIndex ? 'bg-white shadow-sm' : 'bg-white/35'"
        />
      </div>

      <!-- Options -->
      <button
        @click.stop="showOptions = true"
        class="absolute top-4 right-4 z-40 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all pointer-events-auto cursor-pointer"
      >
        <MoreVerticalIcon size="18" />
      </button>

      <!-- Tap zones: 50% left (previous) / 50% right (next) -->
      <div v-if="profile.photos && profile.photos.length > 1" class="absolute inset-0 flex z-20 pointer-events-none">
        <div class="w-1/2 h-[75%] pointer-events-auto cursor-pointer" @click.stop="previousPhoto" />
        <div class="w-1/2 h-[75%] pointer-events-auto cursor-pointer" @click.stop="nextPhoto" />
      </div>

      <!-- Swipe indicators -->
      <div class="absolute top-12 left-8 -rotate-[12deg] z-30 pointer-events-none" :style="{ opacity: likeOpacity }">
        <div class="px-4 py-2 border-[3px] border-gold-400 rounded-xl bg-gold-400/10">
          <p class="text-gold-300 font-display font-extrabold text-xl uppercase tracking-wide">Like</p>
        </div>
      </div>
      <div class="absolute top-12 right-8 rotate-[12deg] z-30 pointer-events-none" :style="{ opacity: nopeOpacity }">
        <div class="px-4 py-2 border-[3px] border-[#ff7a6b] rounded-xl bg-[#ff7a6b]/10">
          <p class="text-[#ff7a6b] font-display font-extrabold text-xl uppercase tracking-wide">Nope</p>
        </div>
      </div>
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none" :style="{ opacity: superOpacity }">
        <div class="px-4 py-2 border-[3px] border-lagoon-400 rounded-xl bg-lagoon-400/10">
          <p class="text-lagoon-300 font-display font-extrabold text-xl uppercase tracking-wide">Super</p>
        </div>
      </div>

      <!-- Info text container: positioned at bottom of the card, above the bottom border -->
      <div v-if="index === 0" class="absolute left-4 right-4 bottom-4 sm:bottom-5 z-20 pointer-events-none text-white">
        <!-- 1. Small pill for "Nearby" or distance -->
        <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white/95 mb-1.5 shadow-sm">
          <span>Nearby</span>
        </div>

        <!-- 2. Name & Age (28-32px) + Verified tick + Details up-arrow button -->
        <div class="flex items-center justify-between gap-2 mb-1">
          <div class="flex items-baseline gap-2 min-w-0">
            <h2 class="text-[28px] sm:text-[32px] font-bold font-display tracking-tight text-white drop-shadow-md truncate leading-tight">
              {{ profile.name }}
            </h2>
            <span v-if="profile.age" class="text-2xl font-bold text-white/90 drop-shadow-md leading-tight">
              {{ profile.age }}
            </span>
            <span v-if="profile.gender" class="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 border border-white/20 capitalize self-center">
              {{ profile.gender }}
            </span>
            <span v-if="profile.isVerified" class="inline-flex items-center text-amber-400 drop-shadow-md" title="Verified Member">
              <BadgeCheck :size="22" class="fill-amber-400 text-night-950" />
            </span>
          </div>

          <!-- Details button: circular up-arrow on the right of the name row -->
          <button
            @click.stop="$emit('openProfile', profile)"
            class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-md border border-white/25 text-white flex items-center justify-center pointer-events-auto transition-transform cursor-pointer shrink-0 shadow-lg"
            title="View full profile"
          >
            <ArrowUp :size="18" stroke-width="2.5" />
          </button>
        </div>

        <!-- 3. Line with pin icon and "X km away" -->
        <div v-if="profile.district || profile.distance" class="flex items-center gap-1.5 text-xs sm:text-sm text-white/85 font-medium drop-shadow mb-0.5">
          <MapPinIcon :size="13" class="text-lagoon-400 shrink-0" />
          <span>{{ profile.district && profile.distance ? `${profile.district} · ${profile.distance}` : (profile.district || profile.distance) }}</span>
        </div>

        <!-- 4. Bio snippet (matches status quo in Image 3) -->
        <p v-if="profile.bio" class="text-xs sm:text-sm text-white/80 drop-shadow truncate mt-0.5">
          {{ profile.bio }}
        </p>
      </div>
    </div>

    <!-- Teleport modal directly to body to maintain single root node -->
    <Teleport to="body">
      <ReportModal
        :show="showOptions"
        :user-id="profile.id || profile._id"
        :user-name="profile.name"
        @close="showOptions = false"
        @report-submitted="handleReportOrBlock"
        @user-blocked="handleReportOrBlock"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowUp, BadgeCheck, MapPin as MapPinIcon, MoreVertical as MoreVerticalIcon, Image as ImageIcon } from 'lucide-vue-next'
import ReportModal from '@/components/feature/modal/ReportModal.vue'
import { mediaUrl } from '@/utils/media'

const props = defineProps({
  profile: { type: Object, required: true },
  index: { type: Number, default: 0 },
  total: { type: Number, default: 1 }
})
const emit = defineEmits(['swipe', 'openProfile'])

const currentPhotoIndex = ref(0)
const showOptions = ref(false)

const userInitials = computed(() => {
  const name = props.profile?.name || 'Kondani'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
})

const handleReportOrBlock = () => emit('swipe', 'left')

const lookingForEmojiMap = {
  'Long-term relationship': '💍',
  'Short-term relationship': '🌹',
  'Casual dating': '🥂',
  'New friends': '👋',
  'Marriage': '💒',
  'Still figuring it out': '🤷'
}
const lookingForEmoji = (val) => lookingForEmojiMap[val] || '💍'

const nextPhoto = () => {
  if (props.profile.photos && currentPhotoIndex.value < props.profile.photos.length - 1) currentPhotoIndex.value++
}
const previousPhoto = () => {
  if (currentPhotoIndex.value > 0) currentPhotoIndex.value--
}

// Drag state
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragX = ref(0)
const dragY = ref(0)

const cardStyle = computed(() => {
  const z = (props.total - props.index) + 10
  const scale = props.index < 3 ? 1 - props.index * 0.02 : 1
  const translateY = props.index < 3 ? props.index * 10 : 0

  if (isDragging.value || dragX.value !== 0 || dragY.value !== 0) {
    const rotation = dragX.value / 20
    return {
      zIndex: 200 + z,
      transform: `translate(${dragX.value}px, ${dragY.value}px) rotate(${rotation}deg) scale(${scale})`,
      transition: isDragging.value ? 'none' : 'transform 0.3s ease-out'
    }
  }

  return {
    zIndex: z,
    transform: `scale(${scale}) translateY(${translateY}px)`,
    transition: 'transform 0.3s ease-out'
  }
})

const likeOpacity = computed(() => Math.min(Math.max(dragX.value / 100, 0), 1))
const nopeOpacity = computed(() => Math.min(Math.max(-dragX.value / 100, 0), 1))
const superOpacity = computed(() => Math.min(Math.max(-dragY.value / 100, 0), 1))

const startDrag = (e) => {
  if (props.index !== 0 || showOptions.value) return
  isDragging.value = true
  const touch = e.touches ? e.touches[0] : e
  dragStartX.value = touch.clientX - dragX.value
  dragStartY.value = touch.clientY - dragY.value
}
const onDrag = (e) => {
  if (!isDragging.value || props.index !== 0) return
  const touch = e.touches ? e.touches[0] : e
  dragX.value = touch.clientX - dragStartX.value
  dragY.value = touch.clientY - dragStartY.value
}
const endDrag = () => {
  if (!isDragging.value || props.index !== 0) return
  isDragging.value = false
  const threshold = 100
  const upThreshold = 150
  if (dragX.value > threshold) {
    dragX.value = 600
    setTimeout(() => { emit('swipe', 'right'); resetCard() }, 220)
  } else if (dragX.value < -threshold) {
    dragX.value = -600
    setTimeout(() => { emit('swipe', 'left'); resetCard() }, 220)
  } else if (dragY.value < -upThreshold) {
    dragY.value = -600
    setTimeout(() => { emit('swipe', 'up'); resetCard() }, 220)
  } else {
    dragX.value = 0
    dragY.value = 0
  }
}
const resetCard = () => {
  setTimeout(() => { dragX.value = 0; dragY.value = 0; currentPhotoIndex.value = 0 }, 250)
}

defineExpose({
  triggerSwipe: (direction) => {
    if (direction === 'right') dragX.value = 600
    else if (direction === 'left') dragX.value = -600
    else if (direction === 'up') dragY.value = -600
    setTimeout(() => { emit('swipe', direction); resetCard() }, 250)
  }
})
</script>
