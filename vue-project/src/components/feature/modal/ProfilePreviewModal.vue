<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="close" class="relative z-[120]">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/85 backdrop-blur-md" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-0 sm:p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95 translate-y-4"
            enter-to="opacity-100 scale-100 translate-y-0"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100 translate-y-0"
            leave-to="opacity-0 scale-95 translate-y-4"
          >
            <DialogPanel class="w-full h-[100dvh] sm:h-[640px] sm:max-h-[88vh] sm:max-w-4xl sm:rounded-3xl bg-[#0a151d] border border-white/10 overflow-hidden flex flex-col sm:flex-row text-left shadow-2xl relative select-none">
              
              <!-- LEFT COLUMN: Photo Carousel -->
              <div class="relative w-full sm:w-[46%] h-[50vh] sm:h-full bg-night-900 shrink-0 overflow-hidden group">
                <img
                  :src="currentPhoto"
                  :alt="user.name"
                  class="w-full h-full object-cover transition-all duration-300"
                />

                <!-- Vignette Gradients -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none"></div>

                <!-- Story Indicator Bars at Top -->
                <div v-if="allPhotos.length > 1" class="absolute top-3 inset-x-3 z-30 flex gap-1.5">
                  <div
                    v-for="(photo, idx) in allPhotos"
                    :key="idx"
                    class="h-1 flex-1 rounded-full transition-all duration-200 cursor-pointer"
                    :class="activePhotoIndex === idx ? 'bg-white shadow-sm' : 'bg-white/30'"
                    @click.stop="activePhotoIndex = idx"
                  ></div>
                </div>

                <!-- Floating Online Badge -->
                <div v-if="user.online" class="absolute top-7 left-4 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-lagoon-400/40 text-lagoon-300 text-xs font-semibold">
                  <span class="w-2 h-2 rounded-full bg-lagoon-400 animate-pulse"></span>
                  <span>Online now</span>
                </div>

                <!-- Mobile Close Button (Top right over photo) -->
                <button
                  @click="close"
                  class="sm:hidden absolute top-6 right-4 z-30 p-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 active:scale-95 transition-all"
                  title="Close"
                >
                  <X :size="18" />
                </button>

                <!-- Navigation Arrows on Desktop & Tap zones on Mobile -->
                <button
                  v-if="allPhotos.length > 1"
                  @click.stop="prevPhoto"
                  class="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/15 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                  title="Previous photo"
                >
                  <ChevronLeft :size="20" />
                </button>
                <button
                  v-if="allPhotos.length > 1"
                  @click.stop="nextPhoto"
                  class="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/15 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                  title="Next photo"
                >
                  <ChevronRight :size="20" />
                </button>

                <!-- Mobile Invisible Tap Zones -->
                <div @click="prevPhoto" class="sm:hidden absolute left-0 inset-y-0 w-1/3 z-20 cursor-pointer"></div>
                <div @click="nextPhoto" class="sm:hidden absolute right-0 inset-y-0 w-1/3 z-20 cursor-pointer"></div>

                <!-- Photo counter pill -->
                <div v-if="allPhotos.length > 1" class="absolute bottom-4 right-4 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white/80">
                  {{ activePhotoIndex + 1 }} / {{ allPhotos.length }}
                </div>

                <!-- Bottom Photo Overlay on Mobile only -->
                <div class="sm:hidden absolute bottom-3 inset-x-4 z-20">
                  <div class="flex items-center gap-2">
                    <h2 class="text-2xl font-bold font-display text-white drop-shadow-md">
                      {{ user.name || 'Member' }}<span v-if="userAge">, {{ userAge }}</span>
                    </h2>
                    <BadgeCheck v-if="user.isVerified" :size="22" class="text-gold-400 drop-shadow" />
                  </div>

                  <p v-if="userLocation" class="flex items-center gap-1.5 text-white/85 text-xs mt-1">
                    <MapPin :size="14" class="text-lagoon-400 shrink-0" />
                    <span>{{ userLocation }}</span>
                  </p>
                </div>
              </div>

              <!-- RIGHT COLUMN: Profile Info & Scrollable Details -->
              <div class="flex-1 flex flex-col h-[50vh] sm:h-full min-w-0 bg-[#0c1822]">
                
                <!-- Desktop Header with Name, Age, and Close button -->
                <div class="hidden sm:flex items-center justify-between px-7 py-5 border-b border-white/8 shrink-0 bg-[#0c1822]/80 backdrop-blur-md">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <h2 class="text-2xl font-bold font-display text-white truncate">
                        {{ user.name || 'Member' }}<span v-if="userAge">, {{ userAge }}</span>
                      </h2>
                      <BadgeCheck v-if="user.isVerified" :size="22" class="text-gold-400 shrink-0" />
                    </div>
                    <p v-if="userLocation" class="flex items-center gap-1.5 text-white/60 text-xs mt-0.5">
                      <MapPin :size="13" class="text-lagoon-400 shrink-0" />
                      <span>{{ userLocation }}</span>
                    </p>
                  </div>

                  <button
                    @click="close"
                    class="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
                    title="Close"
                  >
                    <X :size="20" />
                  </button>
                </div>

                <!-- Scrollable Body Content -->
                <div class="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5 text-white/90">

                  <!-- Relationship Intent Card -->
                  <div v-if="user.relationshipIntent || user.intent" class="p-4 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center gap-3.5">
                    <div class="p-2.5 rounded-xl bg-gold-400/10 text-gold-400 border border-gold-400/20 shrink-0">
                      <Sparkles :size="20" />
                    </div>
                    <div>
                      <span class="text-[10px] font-semibold tracking-wider text-white/40 uppercase block">Looking for</span>
                      <p class="text-sm font-bold text-white">{{ user.relationshipIntent || user.intent }}</p>
                    </div>
                  </div>

                  <!-- About Me / Bio -->
                  <div v-if="user.bio">
                    <h3 class="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">About Me</h3>
                    <p class="text-sm leading-relaxed text-white/80 whitespace-pre-line bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                      {{ user.bio }}
                    </p>
                  </div>

                  <!-- Passions / Interests -->
                  <div v-if="userInterests.length > 0">
                    <h3 class="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2.5">Passions & Interests</h3>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="(interest, i) in userInterests"
                        :key="i"
                        class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/10 text-white/85"
                      >
                        {{ interest }}
                      </span>
                    </div>
                  </div>

                  <!-- Details Grid -->
                  <div v-if="hasLifestyleDetails" class="space-y-2.5">
                    <h3 class="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">Details</h3>
                    <div class="grid grid-cols-2 gap-2.5">
                      <div v-if="user.occupation || user.job" class="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-2.5">
                        <Briefcase :size="15" class="text-lagoon-400 shrink-0" />
                        <span class="text-xs text-white/80 truncate">{{ user.occupation || user.job }}</span>
                      </div>
                      <div v-if="user.education" class="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-2.5">
                        <GraduationCap :size="15" class="text-gold-400 shrink-0" />
                        <span class="text-xs text-white/80 truncate">{{ user.education }}</span>
                      </div>
                      <div v-if="user.height" class="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-2.5">
                        <Ruler :size="15" class="text-white/50 shrink-0" />
                        <span class="text-xs text-white/80">{{ user.height }} cm</span>
                      </div>
                      <div v-if="user.gender" class="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-2.5 capitalize">
                        <UserIcon :size="15" class="text-white/50 shrink-0" />
                        <span class="text-xs text-white/80">{{ user.gender }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Photo Thumbnails Gallery -->
                  <div v-if="allPhotos.length > 1" class="space-y-2.5 pt-1">
                    <h3 class="text-[11px] font-semibold uppercase tracking-wider text-white/40">Photos ({{ allPhotos.length }})</h3>
                    <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      <div
                        v-for="(photo, i) in allPhotos"
                        :key="i"
                        @click="activePhotoIndex = i"
                        class="aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all"
                        :class="activePhotoIndex === i ? 'border-gold-400 shadow-md scale-[1.02]' : 'border-transparent opacity-60 hover:opacity-100'"
                      >
                        <img :src="mediaSrc(photo)" class="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Bottom Action Bar (Fixed, never cut off) -->
                <div class="p-4 sm:px-7 sm:py-4 bg-[#0a151d] border-t border-white/8 shrink-0 flex items-center gap-3">
                  <button
                    @click="close"
                    class="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 text-night-950 font-bold text-sm shadow-lg shadow-gold-500/20 hover:brightness-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <MessageCircle :size="18" />
                    <span>Continue Chatting</span>
                  </button>
                </div>

              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'
import {
  X,
  MapPin,
  BadgeCheck,
  Sparkles,
  Briefcase,
  GraduationCap,
  Ruler,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from 'lucide-vue-next'
import { mediaUrl } from '@/utils/media'

const props = defineProps({
  show: { type: Boolean, default: false },
  user: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])

const activePhotoIndex = ref(0)
const mediaSrc = (u) => mediaUrl(u)

watch(() => props.show, (val) => {
  if (val) activePhotoIndex.value = 0
})

const allPhotos = computed(() => {
  if (props.user.photos && Array.isArray(props.user.photos) && props.user.photos.length > 0) {
    const list = props.user.photos.filter(Boolean)
    if (list.length > 0) return list
  }
  if (props.user.photo) return [props.user.photo]
  return ['https://via.placeholder.com/400x500']
})

const currentPhoto = computed(() => {
  const list = allPhotos.value
  const photo = list[activePhotoIndex.value] || list[0]
  return mediaSrc(photo)
})

const prevPhoto = () => {
  if (activePhotoIndex.value > 0) {
    activePhotoIndex.value--
  } else {
    activePhotoIndex.value = allPhotos.value.length - 1
  }
}

const nextPhoto = () => {
  if (activePhotoIndex.value < allPhotos.value.length - 1) {
    activePhotoIndex.value++
  } else {
    activePhotoIndex.value = 0
  }
}

// Safely compute age: must be a realistic positive number between 18 and 100
const userAge = computed(() => {
  let a = props.user.age
  if ((a === undefined || a === null || a <= 0) && props.user.birthdate) {
    const b = new Date(props.user.birthdate).getTime()
    if (!isNaN(b) && b > 0) {
      const ageDiff = Date.now() - b
      const ageDate = new Date(ageDiff)
      a = Math.abs(ageDate.getUTCFullYear() - 1970)
    }
  }
  const num = parseInt(a, 10)
  return (num >= 18 && num <= 100) ? num : null
})

// Safely compute location: avoid raw GeoJSON objects like { "type": "Point", ... }
const userLocation = computed(() => {
  const u = props.user
  if (typeof u.city === 'string' && u.city.trim()) return u.city.trim()
  if (typeof u.location === 'string' && u.location.trim()) {
    const trimmed = u.location.trim()
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return trimmed
    }
  }
  if (u.location && typeof u.location === 'object') {
    if (typeof u.location.city === 'string' && u.location.city.trim()) return u.location.city.trim()
    if (typeof u.location.address === 'string' && u.location.address.trim()) return u.location.address.trim()
  }
  return ''
})

const userInterests = computed(() => {
  if (Array.isArray(props.user.interests)) return props.user.interests
  if (typeof props.user.interests === 'string') {
    return props.user.interests.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
})

const hasLifestyleDetails = computed(() => {
  const u = props.user
  return !!(u.occupation || u.job || u.education || u.height || u.gender)
})

const close = () => {
  emit('close')
}
</script>
