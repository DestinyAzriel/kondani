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

        <!-- Gradient overlay -->
        <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent to-night-950/95 pointer-events-none"></div>

        <!-- Photo dots -->
        <div v-if="profile.photos && profile.photos.length > 1" class="absolute top-2 left-0 right-0 flex justify-center gap-1 z-10 px-2 pointer-events-none">
          <div
            v-for="(photo, index) in profile.photos"
            :key="index"
            class="flex-1 h-1 rounded-full transition-all duration-300"
            :class="index === currentPhotoIndex ? 'bg-white' : 'bg-white/40'"
          />
        </div>

        <!-- Options -->
        <button
          @click.stop="showOptions = true"
          class="absolute top-4 right-4 z-40 p-2 bg-black/25 hover:bg-black/45 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all pointer-events-auto"
        >
          <MoreVerticalIcon size="20" />
        </button>

        <!-- Tap zones -->
        <div v-if="profile.photos && profile.photos.length > 1" class="absolute inset-0 flex z-20">
          <div class="w-1/3 h-full cursor-pointer" @click.stop="previousPhoto" />
          <div class="w-2/3 h-full cursor-pointer" @click.stop="nextPhoto" />
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

        <!-- Info -->
        <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white z-20 pointer-events-none">
          <div class="flex items-end gap-2 mb-1.5">
            <h2 class="text-3xl sm:text-4xl font-bold font-display drop-shadow-md tracking-tight leading-none">{{ profile.name }}</h2>
            <span v-if="profile.age" class="text-xl sm:text-2xl font-medium drop-shadow-md opacity-90 leading-none">{{ profile.age }}</span>
            <span v-if="profile.isVerified" class="mb-1 inline-flex items-center gap-1 bg-gradient-to-r from-gold-300 to-gold-500 text-night-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow" title="Verified">
              <CheckIcon size="11" class="stroke-[4]" /> Verified
            </span>
          </div>

          <div v-if="profile.distance" class="flex items-center gap-1.5 text-xs sm:text-sm font-medium drop-shadow-md mb-2 text-white/85">
            <MapPinIcon size="14" class="text-lagoon-400" />
            <span>{{ profile.distance }}</span>
          </div>

          <p v-if="profile.bio" class="text-sm text-white/90 drop-shadow-md line-clamp-2 mb-3 leading-relaxed">{{ profile.bio }}</p>

          <div v-if="profile.interests && profile.interests.length" class="flex flex-wrap gap-2">
            <span
              v-for="(interest, index) in profile.interests.slice(0, 3)"
              :key="index"
              class="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[11px] font-semibold rounded-full border border-white/15"
            >{{ interest }}</span>
            <span v-if="profile.interests.length > 3" class="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[11px] font-semibold rounded-full border border-white/15">
              +{{ profile.interests.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ReportModal
    :show="showOptions"
    :user-id="profile.id || profile._id"
    :user-name="profile.name"
    @close="showOptions = false"
    @report-submitted="handleReportOrBlock"
    @user-blocked="handleReportOrBlock"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { MapPin as MapPinIcon, Check as CheckIcon, MoreVertical as MoreVerticalIcon, Image as ImageIcon } from 'lucide-vue-next'
import ReportModal from '@/components/feature/modal/ReportModal.vue'
import { mediaUrl } from '@/utils/media'

const props = defineProps({
  profile: { type: Object, required: true }
})
const emit = defineEmits(['swipe'])

const currentPhotoIndex = ref(0)
const showOptions = ref(false)

const handleReportOrBlock = () => emit('swipe', 'left')

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
  if (!isDragging.value && dragX.value === 0 && dragY.value === 0) return {}
  const rotation = dragX.value / 20
  return {
    transform: `translate(${dragX.value}px, ${dragY.value}px) rotate(${rotation}deg)`,
    transition: isDragging.value ? 'none' : 'transform 0.3s ease-out'
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
