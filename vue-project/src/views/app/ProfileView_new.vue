<template>
  <div class="profile-view min-h-screen bg-deep-950 pb-24 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[100px]"></div>
    </div>

    <!-- Header with Actions -->
    <div class="sticky top-0 z-40 bg-deep-900/80 backdrop-blur-md border-b border-white/10 p-4">
      <div class="flex items-center justify-between max-w-full mx-auto">
        <h1 class="text-xl font-bold text-white">Profile</h1>
        <button
          v-if="!isEditing"
          @click="setIsEditing(true)"
          class="px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-bold hover:bg-emerald-500 transition-colors"
        >
          Edit
        </button>
        <button
          v-else
          @click="saveProfile"
          class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-500 transition-colors"
        >
          Save
        </button>
      </div>
    </div>

    <!-- Main Content Scroll -->
    <div class="relative z-10">
      <!-- Photo Gallery - Full Width Carousel (Tinder-style) -->
      <div class="relative w-full h-96 bg-gradient-to-b from-emerald-900/20 to-transparent overflow-hidden">
        <!-- Main Photo Display -->
        <div class="relative w-full h-full">
          <img
            v-if="profile.photos && profile.photos[currentPhotoIndex]"
            :src="profile.photos[currentPhotoIndex]"
            :alt="`Photo ${currentPhotoIndex + 1}`"
            class="w-full h-full object-contain"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center">
            <div class="text-center">
              <p class="text-white/80 font-semibold mb-3">No photos yet</p>
              <button
                @click="editPhotos = true"
                class="px-6 py-2 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-500 transition-colors"
              >
                Add Photos
              </button>
            </div>
          </div>

          <!-- Photo Navigation Overlay -->
          <div v-if="profile.photos && profile.photos.length > 1" class="absolute inset-0 flex z-20 pointer-events-none">
            <button
              @click="previousPhoto"
              class="flex-1 pointer-events-auto hover:bg-black/10 transition-colors"
            />
            <button
              @click="nextPhoto"
              class="flex-1 pointer-events-auto hover:bg-black/10 transition-colors"
            />
          </div>

          <!-- Photo Counter & Indicators -->
          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-20">
            <div v-if="profile.photos && profile.photos.length > 1" class="flex gap-1 mb-3">
              <div
                v-for="(photo, idx) in profile.photos"
                :key="idx"
                class="flex-1 h-1 rounded-full transition-all duration-300"
                :class="idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'"
              />
            </div>
            <div class="flex items-center justify-between">
              <span v-if="profile.photos && profile.photos.length > 1" class="text-white text-sm font-semibold">
                {{ currentPhotoIndex + 1 }} / {{ profile.photos.length }}
              </span>
              <button
                @click="editPhotos = true"
                class="ml-auto px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-full text-sm font-bold transition-colors backdrop-blur-sm"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Hero Card -->
      <div class="px-4 py-6 bg-gradient-to-b from-deep-900/50 to-transparent">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-4xl font-bold text-white font-display">
              {{ profile.name }}<span class="text-2xl text-white/60">, {{ profile.age }}</span>
            </h2>
            <p class="text-emerald-400 font-semibold mt-2 flex items-center gap-1">
              📍 {{ profile.location }}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <!-- Verification Badge -->
            <div
              v-if="profile.isVerified"
              class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50"
            >
              <span class="text-blue-400 text-lg">✓</span>
            </div>
            <!-- Online Indicator -->
            <div
              v-if="profile.isOnline"
              class="w-4 h-4 rounded-full bg-green-500 animate-pulse"
              title="Online now"
            />
          </div>
        </div>

        <!-- Visibility Toggle -->
        <div class="flex items-center gap-3 mb-4">
          <label class="flex items-center cursor-pointer">
            <div class="relative">
              <input
                type="checkbox"
                class="sr-only"
                :checked="profile.isVisible"
                @change="toggleVisibility"
              />
              <div class="block w-12 h-6 rounded-full transition-colors" :class="profile.isVisible ? 'bg-emerald-600' : 'bg-white/20'"></div>
              <div
                class="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform shadow-sm"
                :class="{ 'transform translate-x-6': profile.isVisible }"
              ></div>
            </div>
            <div class="ml-3 text-sm font-medium" :class="profile.isVisible ? 'text-emerald-400' : 'text-white/60'">
              {{ profile.isVisible ? 'Visible' : 'Hidden' }}
            </div>
          </label>
        </div>
      </div>

      <!-- Stats Row (Tinder-style) -->
      <div class="px-4 mb-6">
        <div class="grid grid-cols-3 gap-3">
          <div class="glass-card p-4 text-center rounded-xl">
            <p class="text-3xl font-bold text-emerald-400">{{ profile.stats?.likesReceived || 0 }}</p>
            <p class="text-xs text-white/60 mt-2 font-medium">Likes</p>
          </div>
          <div class="glass-card p-4 text-center rounded-xl">
            <p class="text-3xl font-bold text-blue-400">{{ profile.stats?.matches || 0 }}</p>
            <p class="text-xs text-white/60 mt-2 font-medium">Matches</p>
          </div>
          <div class="glass-card p-4 text-center rounded-xl">
            <p class="text-3xl font-bold text-purple-400">{{ profile.stats?.visitors || 0 }}</p>
            <p class="text-xs text-white/60 mt-2 font-medium">Visitors</p>
          </div>
        </div>
      </div>

      <!-- Bio Section -->
      <div class="px-4 mb-4">
        <div class="glass-card p-5 rounded-xl">
          <h3 class="text-sm font-bold text-white/80 uppercase tracking-wide mb-3">About</h3>
          <div v-if="isEditing">
            <textarea
              v-model="profile.bio"
              class="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors backdrop-blur-sm resize-none"
              rows="3"
              placeholder="Tell people what you're passionate about..."
            ></textarea>
          </div>
          <p v-else class="text-white/80 leading-relaxed text-sm">
            {{ profile.bio || "Add a bio to tell people about yourself…" }}
          </p>
        </div>
      </div>

      <!-- Interests Section -->
      <div class="px-4 mb-4">
        <h3 class="text-sm font-bold text-white/80 uppercase tracking-wide mb-3 px-2">Interests</h3>
        <div v-if="isEditing" class="glass-card p-5 rounded-xl">
          <div class="flex gap-2 mb-4">
            <input
              v-model="newInterest"
              @keyup.enter="addInterest"
              class="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors backdrop-blur-sm text-sm"
              placeholder="Add interest..."
            />
            <button
              @click="addInterest"
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 transition-colors text-sm"
            >
              Add
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(interest, index) in profile.interests"
              :key="index"
              class="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium flex items-center border border-emerald-500/30 group hover:bg-emerald-500/30 transition-colors"
            >
              {{ interest }}
              <button @click="removeInterest(index)" class="ml-2 text-emerald-300 hover:text-white transition-colors">×</button>
            </span>
          </div>
        </div>
        <div v-else class="flex flex-wrap gap-2 px-2">
          <span
            v-for="(interest, index) in profile.interests"
            :key="index"
            class="px-3 py-1.5 bg-emerald-500/15 text-emerald-300 rounded-full text-xs font-medium border border-emerald-500/30"
          >
            {{ interest }}
          </span>
          <span v-if="profile.interests.length === 0" class="text-white/40 text-sm">
            Add interests to help others find you
          </span>
        </div>
      </div>

      <!-- Activity Section -->
      <div class="px-4 mb-4">
        <div class="flex items-center justify-between mb-3 px-2">
          <h3 class="text-sm font-bold text-white/80 uppercase tracking-wide">Activity</h3>
          <button
            @click="postIntent"
            class="text-emerald-400 text-sm font-bold hover:text-emerald-300 transition-colors"
          >
            + Post
          </button>
        </div>
        <div v-if="profile.activity.length > 0" class="space-y-2">
          <div
            v-for="(item, index) in profile.activity"
            :key="index"
            class="glass-card p-4 rounded-xl"
          >
            <p class="text-white/90 text-sm leading-relaxed">"{{ item }}"</p>
            <p class="text-white/40 text-xs mt-2">2 hours ago</p>
          </div>
        </div>
        <div v-else class="glass-card p-6 rounded-xl text-center">
          <p class="text-white/60 text-sm mb-3">Share what you're up to</p>
          <button
            @click="postIntent"
            class="px-6 py-2 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-500 transition-colors text-sm"
          >
            Post Now
          </button>
        </div>
      </div>

      <!-- Verification Section -->
      <div class="px-4 mb-4">
        <div class="glass-card p-5 rounded-xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                :class="profile.isVerified ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/40'"
              >
                {{ profile.isVerified ? '✓' : '!' }}
              </div>
              <div>
                <h4 class="font-bold text-white text-sm">
                  {{ profile.isVerified ? 'Verified' : 'Get Verified' }}
                </h4>
                <p class="text-white/60 text-xs">
                  {{ profile.isVerified ? 'Identity confirmed' : 'Build trust & appear in more feeds' }}
                </p>
              </div>
            </div>
            <button
              @click="getVerified"
              :class="[
                'px-4 py-2 rounded-full text-sm font-bold transition-all',
                profile.isVerified
                  ? 'bg-blue-500/20 text-blue-400 cursor-default border border-blue-500/30'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              ]"
            >
              {{ profile.isVerified ? 'Verified' : 'Verify' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Logout -->
      <div class="px-4 mb-6">
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600/20 text-red-400 rounded-xl font-bold hover:bg-red-600/30 transition-colors border border-red-600/30 text-sm"
        >
          <LogOut class="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useProfile } from '@/composables/useProfile'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { LogOut } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { success } = useToast()

// Photo gallery navigation
const currentPhotoIndex = ref(0)
const editPhotos = ref(false)

const {
  profile,
  isEditing,
  newInterest,
  setIsEditing,
  saveProfile: originalSaveProfile,
  addInterest: originalAddInterest,
  removeInterest: originalRemoveInterest,
  toggleVisibility,
  postIntent,
  getVerified
} = useProfile()

// Photo navigation methods
const nextPhoto = () => {
  if (profile.value.photos && currentPhotoIndex.value < profile.value.photos.length - 1) {
    currentPhotoIndex.value++
  }
}

const previousPhoto = () => {
  if (currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--
  }
}

// Wrap saveProfile with toast notification
const saveProfile = async () => {
  try {
    await originalSaveProfile()
    success('Profile updated successfully!')
    setIsEditing(false)
  } catch {
    success('Failed to save profile. Please try again.')
  }
}

// Wrap addInterest with toast notification
const addInterest = () => {
  const interestToAdd = newInterest.value?.trim()
  if (interestToAdd) {
    originalAddInterest()
    success(`Added "${interestToAdd}" to interests`)
  }
}

// Wrap removeInterest with toast notification
const removeInterest = (index) => {
  const interest = profile.value.interests[index]
  originalRemoveInterest(index)
  success(`Removed "${interest}" from interests`)
}

const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>
