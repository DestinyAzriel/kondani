<template>
  <div class="photo-upload-container">
    <!-- Photo Grid -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div
        v-for="(photo, index) in photos"
        :key="index"
        class="photo-slot aspect-square rounded-2xl overflow-hidden relative group bg-white/5 border border-white/10"
      >
        <!-- Uploaded Photo -->
        <img
          v-if="photo"
          :src="photo"
          class="w-full h-full object-cover"
          alt="Profile photo"
        />
        
        <!-- Empty Slot -->
        <label
          v-else
          class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
        >
          <input
            type="file"
            accept="image/*"
            @change="(e) => handlePhotoSelect(e, index)"
            class="hidden"
          />
          <div class="text-center">
            <svg class="w-8 h-8 text-white/40 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="text-xs text-white/40">Add Photo</span>
          </div>
        </label>

        <!-- Remove Button -->
        <button
          v-if="photo"
          @click="removePhoto(index)"
          class="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Primary Badge -->
        <div
          v-if="photo && index === 0"
          class="absolute bottom-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full"
        >
          Primary
        </div>
      </div>
    </div>

    <!-- Upload Tips -->
    <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
      <div class="flex gap-3">
        <svg class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div class="text-sm text-white/80">
          <p class="font-bold text-blue-400 mb-1">Photo Tips:</p>
          <ul class="space-y-1 text-xs text-white/60">
            <li>✓ Use clear, recent photos</li>
            <li>✓ Show your face (no sunglasses)</li>
            <li>✓ Add variety (close-up, full body, activity)</li>
            <li>✓ Profiles with 4+ photos get 3x more matches</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="bg-white/5 rounded-xl p-4 border border-white/10">
      <div class="flex items-center gap-3 mb-2">
        <div class="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
        <span class="text-white/80 text-sm font-medium">Uploading {{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
      <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <div class="text-sm text-red-400">
        <p class="font-bold mb-1">Upload Failed</p>
        <p class="text-xs text-red-300">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxPhotos: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['update:modelValue'])
const { success, error: toastError } = useToast()

const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref(null)

// Pad photos array to maxPhotos length
const photos = computed({
  get: () => {
    const current = props.modelValue || []
    return [...current, ...Array(props.maxPhotos - current.length).fill(null)]
  },
  set: (value) => {
    emit('update:modelValue', value.filter(p => p !== null))
  }
})

const handlePhotoSelect = async (event, index) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file
  if (!file.type.startsWith('image/')) {
    toastError('Please select an image file')
    return
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    toastError('Image must be less than 5MB')
    return
  }

  try {
    uploading.value = true
    uploadProgress.value = 0
    error.value = null

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 100)

    // Convert to base64 for preview (in production, upload to S3/Cloudinary)
    const reader = new FileReader()
    reader.onload = (e) => {
      const newPhotos = [...photos.value]
      newPhotos[index] = e.target.result
      photos.value = newPhotos
      
      clearInterval(progressInterval)
      uploadProgress.value = 100
      
      setTimeout(() => {
        uploading.value = false
        uploadProgress.value = 0
        success('Photo uploaded successfully!')
      }, 500)
    }

    reader.onerror = () => {
      clearInterval(progressInterval)
      uploading.value = false
      error.value = 'Failed to read image file'
      toastError('Failed to upload photo')
    }

    reader.readAsDataURL(file)

  } catch (err) {
    uploading.value = false
    error.value = err.message
    toastError('Failed to upload photo')
  }
}

const removePhoto = (index) => {
  const newPhotos = [...photos.value]
  newPhotos.splice(index, 1)
  newPhotos.push(null)
  photos.value = newPhotos
  success('Photo removed')
}
</script>

<style scoped>
.photo-slot {
  min-height: 120px;
}
</style>
