<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" @click.self="$emit('close')">
    <div class="bg-deep-900 w-full md:max-w-lg md:rounded-2xl rounded-t-3xl border-t md:border border-white/10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-white/10">
        <h2 class="text-xl font-bold text-white font-display">Filters</h2>
        <button @click="$emit('close')" class="p-2 text-white/60 hover:text-white transition-colors">
          <XIcon size="24" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        
        <!-- Age Range -->
        <div>
          <label class="text-sm font-bold text-white/80 mb-3 block">Age Range</label>
          <div class="flex items-center gap-4">
            <span class="text-white font-medium">{{ filters.ageMin }}</span>
            <input 
              v-model.number="filters.ageMin"
              type="range" 
              min="18" 
              max="60" 
              class="flex-1 accent-emerald-500"
            />
            <span class="text-white font-medium">{{ filters.ageMax }}</span>
            <input 
              v-model.number="filters.ageMax"
              type="range" 
              min="18" 
              max="60" 
              class="flex-1 accent-emerald-500"
            />
          </div>
          <p class="text-xs text-white/40 mt-2">{{ filters.ageMin }} - {{ filters.ageMax }} years old</p>
        </div>

        <!-- Distance -->
        <div>
          <label class="text-sm font-bold text-white/80 mb-3 block">Maximum Distance</label>
          <input 
            v-model.number="filters.distance"
            type="range" 
            min="1" 
            max="500" 
            step="5"
            class="w-full accent-emerald-500"
          />
          <p class="text-xs text-white/40 mt-2">Up to {{ filters.distance }} km away</p>
        </div>

        <!-- Region Filter -->
        <div>
          <label class="text-sm font-bold text-white/80 mb-3 block">Region</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="region in ['All', 'Northern', 'Central', 'Southern']"
              :key="region"
              @click="filters.region = region"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                filters.region === region
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              ]"
            >
              {{ region }}
            </button>
          </div>
        </div>

        <!-- Gender -->
        <div>
          <label class="text-sm font-bold text-white/80 mb-3 block">Show Me</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="gender in ['Women', 'Men', 'Everyone']"
              :key="gender"
              @click="filters.gender = gender"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                filters.gender === gender
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              ]"
            >
              {{ gender }}
            </button>
          </div>
        </div>

        <!-- Interests -->
        <div>
          <label class="text-sm font-bold text-white/80 mb-3 block">Shared Interests</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="interest in availableInterests"
              :key="interest"
              @click="toggleInterest(interest)"
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                filters.interests.includes(interest)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              ]"
            >
              {{ interest }}
            </button>
          </div>
        </div>

        <!-- Verified Only -->
        <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div>
            <p class="text-white font-medium">Verified Profiles Only</p>
            <p class="text-xs text-white/40 mt-1">Show only users with verified photos</p>
          </div>
          <button
            @click="filters.verifiedOnly = !filters.verifiedOnly"
            :class="[
              'relative w-12 h-6 rounded-full transition-colors',
              filters.verifiedOnly ? 'bg-emerald-500' : 'bg-white/20'
            ]"
          >
            <span
              :class="[
                'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                filters.verifiedOnly ? 'translate-x-6' : 'translate-x-0'
              ]"
            ></span>
          </button>
        </div>

      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-white/10 flex gap-3">
        <button
          @click="resetFilters"
          class="flex-1 px-6 py-3 bg-white/5 text-white rounded-full font-bold hover:bg-white/10 transition-colors"
        >
          Reset
        </button>
        <button
          @click="applyFilters"
          class="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-full font-bold shadow-lg shadow-emerald-600/20 hover:scale-105 transition-transform active:scale-95"
        >
          Apply Filters
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X as XIcon } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  initialFilters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'apply'])

const availableInterests = [
  'Music', 'Travel', 'Cooking', 'Art', 'Sports', 'Reading',
  'Movies', 'Dancing', 'Photography', 'Fitness', 'Gaming', 'Fashion'
]

const filters = ref({
  ageMin: 21,
  ageMax: 35,
  distance: 50,
  region: 'All',
  gender: 'Everyone',
  interests: [],
  verifiedOnly: false
})

// Initialize with passed filters
watch(() => props.initialFilters, (newFilters) => {
  if (newFilters && Object.keys(newFilters).length > 0) {
    filters.value = { ...filters.value, ...newFilters }
  }
}, { immediate: true })

const toggleInterest = (interest) => {
  const index = filters.value.interests.indexOf(interest)
  if (index > -1) {
    filters.value.interests.splice(index, 1)
  } else {
    filters.value.interests.push(interest)
  }
}

const resetFilters = () => {
  filters.value = {
    ageMin: 18,
    ageMax: 60,
    distance: 100,
    region: 'All',
    gender: 'Everyone',
    interests: [],
    verifiedOnly: false
  }
}

const applyFilters = () => {
  emit('apply', { ...filters.value })
  emit('close')
}
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

/* Custom range slider styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}
</style>
