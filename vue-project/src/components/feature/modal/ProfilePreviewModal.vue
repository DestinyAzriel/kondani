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
            <DialogPanel class="w-full max-w-md h-screen sm:h-auto sm:max-h-[90vh] sm:rounded-3xl bg-night-950 border border-white/10 overflow-hidden flex flex-col text-left shadow-2xl relative select-none">
              
              <!-- Top Photo Carousel (Tinder-style) -->
              <div class="relative w-full h-[58vh] sm:h-[420px] bg-night-900 shrink-0 overflow-hidden">
                <img
                  :src="currentPhoto"
                  :alt="user.name"
                  class="w-full h-full object-cover transition-all duration-300"
                />

                <!-- Vignette Gradients -->
                <div class="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-black/60 pointer-events-none"></div>

                <!-- Story Indicator Bars at Top -->
                <div v-if="allPhotos.length > 1" class="absolute top-3 inset-x-3 z-30 flex gap-1.5">
                  <div
                    v-for="(photo, idx) in allPhotos"
                    :key="idx"
                    class="h-1 flex-1 rounded-full transition-all duration-200"
                    :class="activePhotoIndex === idx ? 'bg-white' : 'bg-white/30'"
                  ></div>
                </div>

                <!-- Tap Zones for Left/Right photo navigation -->
                <div @click="prevPhoto" class="absolute left-0 inset-y-0 w-1/3 z-20 cursor-pointer"></div>
                <div @click="nextPhoto" class="absolute right-0 inset-y-0 w-1/3 z-20 cursor-pointer"></div>

                <!-- Top Close Button -->
                <button
                  @click="close"
                  class="absolute top-6 right-4 z-30 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-colors"
                  title="Close"
                >
                  <X :size="20" />
                </button>

                <!-- Floating Online Badge -->
                <div v-if="user.online" class="absolute top-6 left-4 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-lagoon-400/30 text-lagoon-300 text-xs font-semibold">
                  <span class="w-2 h-2 rounded-full bg-lagoon-400 animate-pulse"></span>
                  <span>Online now</span>
                </div>

                <!-- Bottom Photo Overlay: Name, Age, Verified -->
                <div class="absolute bottom-4 inset-x-5 z-20">
                  <div class="flex items-center gap-2">
                    <h2 class="text-2xl sm:text-3xl font-bold font-display text-white drop-shadow-md">
                      {{ user.name }}<span v-if="userAge">, {{ userAge }}</span>
                    </h2>
                    <BadgeCheck v-if="user.isVerified" :size="24" class="text-gold-400 drop-shadow" />
                  </div>

                  <p v-if="userLocation" class="flex items-center gap-1.5 text-white/80 text-sm mt-1">
                    <MapPin :size="15" class="text-lagoon-400 shrink-0" />
                    <span>{{ userLocation }}</span>
                  </p>
                </div>
              </div>

              <!-- Scrollable Profile Details Body -->
              <div class="flex-1 overflow-y-auto px-5 py-5 space-y-6 text-white/90">

                <!-- Relationship Intent Pill -->
                <div v-if="user.relationshipIntent || user.intent" class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div class="p-2.5 rounded-xl bg-gold-400/10 text-gold-400 border border-gold-400/20">
                    <Sparkles :size="20" />
                  </div>
                  <div>
                    <span class="text-[11px] font-semibold tracking-wider text-white/40 uppercase">Looking for</span>
                    <p class="text-sm font-bold text-white">{{ user.relationshipIntent || user.intent }}</p>
                  </div>
                </div>

                <!-- Bio Section -->
                <div v-if="user.bio">
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">About Me</h3>
                  <p class="text-sm sm:text-base leading-relaxed text-white/80 whitespace-pre-line bg-white/5 p-4 rounded-2xl border border-white/5">
                    {{ user.bio }}
                  </p>
                </div>

                <!-- Passions / Interests -->
                <div v-if="userInterests.length > 0">
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2.5">Passions & Interests</h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(interest, i) in userInterests"
                      :key="i"
                      class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white/80"
                    >
                      {{ interest }}
                    </span>
                  </div>
                </div>

                <!-- Lifestyle & Details -->
                <div v-if="hasLifestyleDetails" class="space-y-3">
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">Details</h3>
                  <div class="grid grid-cols-2 gap-2.5">
                    <div v-if="user.occupation || user.job" class="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                      <Briefcase :size="16" class="text-lagoon-400 shrink-0" />
                      <span class="text-xs truncate">{{ user.occupation || user.job }}</span>
                    </div>
                    <div v-if="user.education" class="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                      <GraduationCap :size="16" class="text-gold-400 shrink-0" />
                      <span class="text-xs truncate">{{ user.education }}</span>
                    </div>
                    <div v-if="user.height" class="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                      <Ruler :size="16" class="text-white/60 shrink-0" />
                      <span class="text-xs">{{ user.height }} cm</span>
                    </div>
                    <div v-if="user.gender" class="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5 capitalize">
                      <UserIcon :size="16" class="text-white/60 shrink-0" />
                      <span class="text-xs">{{ user.gender }}</span>
                    </div>
                  </div>
                </div>

                <!-- Photo Grid if multiple photos -->
                <div v-if="allPhotos.length > 1" class="space-y-2.5">
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-white/40">All Photos ({{ allPhotos.length }})</h3>
                  <div class="grid grid-cols-3 gap-2">
                    <div
                      v-for="(photo, i) in allPhotos"
                      :key="i"
                      @click="activePhotoIndex = i"
                      class="aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all"
                      :class="activePhotoIndex === i ? 'border-gold-400 shadow-lg scale-[1.02]' : 'border-transparent opacity-75 hover:opacity-100'"
                    >
                      <img :src="mediaSrc(photo)" class="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bottom Bar Actions -->
              <div class="p-4 bg-night-900/90 border-t border-white/5 flex items-center justify-between gap-3 shrink-0">
                <button
                  @click="close"
                  class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-night-950 font-bold text-sm shadow-lg hover:brightness-105 active:scale-95 transition-all text-center"
                >
                  Continue Chatting
                </button>
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
  User as UserIcon
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
    return props.user.photos.filter(Boolean)
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

const userAge = computed(() => {
  if (props.user.age) return props.user.age
  if (props.user.birthdate) {
    const ageDiff = Date.now() - new Date(props.user.birthdate).getTime()
    const ageDate = new Date(ageDiff)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
  }
  return null
})

const userLocation = computed(() => {
  return props.user.location || props.user.city || ''
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
