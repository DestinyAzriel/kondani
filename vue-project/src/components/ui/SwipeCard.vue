<template>
  <div
    class="absolute inset-0 w-full h-full flex items-center justify-center transition-transform duration-300 ease-out select-none touch-none"
    :style="cardStyle"
    @mousedown="startDrag"
    @touchstart="startDrag"
    @mousemove="onDrag"
    @touchmove="onDrag"
    @mouseup="endDrag"
    @touchend="endDrag"
    @mouseleave="endDrag"
  >
    <div class="relative w-full h-full rounded-[22px] overflow-hidden shadow-2xl bg-night-900 border border-white/5">
      <div class="relative w-full h-full bg-night-800">
        <img
          v-if="profile.photos && profile.photos.length"
          :src="mediaUrl(profile.photos[currentPhotoIndex])"
          class="w-full h-full object-cover pointer-events-none select-none"
          draggable="false"
          alt="Profile photo"
        />
        <div v-else class="w-full h-full flex flex-col items-center justify-center gap-3 text-white/25" style="background:linear-gradient(160deg,#0e1f29,#081016)">
          <ImageIcon :size="48" :stroke-width="1.5" />
          <span class="text-sm">No photo yet</span>
        </div>

        <!-- Gradient overlay: progressive cinematic scrim (dark only at bottom 55%) -->
        <div class="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10"></div>

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
          class="absolute top-4 right-4 z-40 p-2 bg-black/35 hover:bg-black/55 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all pointer-events-auto cursor-pointer"
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

        <!-- Info Overlay (rendered on active top card above action buttons) -->
        <div v-if="index === 0" class="absolute bottom-20 sm:bottom-22 inset-x-0 px-4 text-white z-20 pointer-events-none">
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
          <div v-if="profile.district || profile.distance" class="flex items-center gap-1.5 text-xs sm:text-sm text-white/85 font-medium drop-shadow mb-1">
            <MapPinIcon :size="13" class="text-lagoon-400 shrink-0" />
            <span>{{ profile.district && profile.distance ? `${profile.district} · ${profile.distance}` : (profile.district || profile.distance) }}</span>
          </div>

          <!-- 4. Bio: at most 1 single line -->
          <p v-if="profile.bio" class="text-xs sm:text-sm text-white/80 drop-shadow truncate leading-relaxed">
            {{ profile.bio }}
          </p>
        </div>
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
  if (showOptions.value) return
  isDragging.value = true
  const touch = e.touches ? e.touches[0] : e
  dragStartX.value = touch.clientX - dragX.value
  dragStartY.value = touch.clientY - dragY.value
}
const onDrag = (e) => {
  if (!isDragging.value) return
  const touch = e.touches ? e.touches[0] : e
  dragX.value = touch.clientX - dragStartX.value
  dragY.value = touch.clientY - dragStartY.value
}
const endDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  const threshold = 100
  const upThreshold = 150
  if (dragX.value > threshold) { emit('swipe', 'right'); resetCard() }
  else if (dragX.value < -threshold) { emit('swipe', 'left'); resetCard() }
  else if (dragY.value < -upThreshold) { emit('swipe', 'up'); resetCard() }
  else { dragX.value = 0; dragY.value = 0 }
}
const resetCard = () => {
  setTimeout(() => { dragX.value = 0; dragY.value = 0; currentPhotoIndex.value = 0 }, 300)
}

defineExpose({
  triggerSwipe: (direction) => {
    if (direction === 'right') dragX.value = 300
    else if (direction === 'left') dragX.value = -300
    else if (direction === 'up') dragY.value = -300
    setTimeout(() => { emit('swipe', direction); resetCard() }, 300)
  }
})
</script>
