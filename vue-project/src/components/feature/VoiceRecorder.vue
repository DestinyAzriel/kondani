<template>
  <div class="voice-recorder">
    <!-- Recording Interface -->
    <div v-if="!audioUrl" class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <div class="text-center mb-6">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center relative"
             :class="isRecording ? 'bg-red-500/20 animate-pulse' : 'bg-emerald-500/20'">
          <svg class="w-10 h-10" :class="isRecording ? 'text-red-500' : 'text-emerald-500'" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
          </svg>
          
          <!-- Recording Animation -->
          <div v-if="isRecording" class="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"></div>
        </div>
        
        <h3 class="text-white font-bold text-lg mb-2">
          {{ isRecording ? 'Recording...' : 'Voice Intro' }}
        </h3>
        <p class="text-white/60 text-sm">
          {{ isRecording ? `${recordingTime}s / 10s` : 'Say hi in your voice (max 10 seconds)' }}
        </p>
      </div>

      <!-- Waveform Visualization (when recording) -->
      <div v-if="isRecording" class="mb-6">
        <div class="flex items-center justify-center gap-1 h-16">
          <div
            v-for="i in 20"
            :key="i"
            class="w-1 bg-red-500 rounded-full transition-all duration-150"
            :style="{ height: `${waveform[i] || 20}%` }"
          ></div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex gap-3">
        <button
          v-if="!isRecording"
          @click="startRecording"
          :disabled="!canRecord"
          class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
            </svg>
            Start Recording
          </span>
        </button>
        
        <button
          v-else
          @click="stopRecording"
          class="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
            </svg>
            Stop Recording
          </span>
        </button>
      </div>

      <!-- Microphone Permission Error -->
      <div v-if="permissionError" class="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
        <p class="font-bold mb-1">Microphone Access Required</p>
        <p class="text-xs text-red-300">Please allow microphone access in your browser settings.</p>
      </div>
    </div>

    <!-- Playback Interface -->
    <div v-else class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <div class="flex items-center gap-4 mb-4">
        <!-- Play/Pause Button -->
        <button
          @click="togglePlayback"
          class="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <svg v-if="!isPlaying" class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Progress Bar -->
        <div class="flex-1">
          <div class="flex justify-between text-xs text-white/60 mb-2">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden cursor-pointer" @click="seek">
            <div
              class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
              :style="{ width: `${(currentTime / duration) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          @click="deleteRecording"
          class="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium border border-white/10 transition-all"
        >
          Re-record
        </button>
        <button
          @click="saveRecording"
          :disabled="isSaving"
          class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {{ isSaving ? 'Saving...' : 'Save Voice Intro' }}
        </button>
      </div>
    </div>

    <!-- Tips -->
    <div class="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
      <div class="flex gap-3">
        <svg class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div class="text-sm text-white/80">
          <p class="font-bold text-blue-400 mb-1">Voice Intro Tips:</p>
          <ul class="space-y-1 text-xs text-white/60">
            <li>✓ Speak clearly and naturally</li>
            <li>✓ Introduce yourself briefly</li>
            <li>✓ Profiles with voice intros get 3x more matches</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'

const emit = defineEmits(['save'])
const { success, error: toastError } = useToast()

const isRecording = ref(false)
const isPlaying = ref(false)
const isSaving = ref(false)
const canRecord = ref(true)
const permissionError = ref(false)
const recordingTime = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const audioUrl = ref(null)
const waveform = ref(Array(20).fill(20))

let mediaRecorder = null
let audioChunks = []
let recordingInterval = null
let audioElement = null
let waveformInterval = null

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []
    recordingTime.value = 0
    permissionError.value = false

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      audioUrl.value = URL.createObjectURL(audioBlob)
      
      // Create audio element for playback
      audioElement = new Audio(audioUrl.value)
      audioElement.addEventListener('loadedmetadata', () => {
        duration.value = audioElement.duration
      })
      audioElement.addEventListener('timeupdate', () => {
        currentTime.value = audioElement.currentTime
      })
      audioElement.addEventListener('ended', () => {
        isPlaying.value = false
        currentTime.value = 0
      })
      
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.start()
    isRecording.value = true

    // Recording timer (max 10 seconds)
    recordingInterval = setInterval(() => {
      recordingTime.value++
      if (recordingTime.value >= 10) {
        stopRecording()
      }
    }, 1000)

    // Waveform animation
    waveformInterval = setInterval(() => {
      waveform.value = waveform.value.map(() => Math.random() * 80 + 20)
    }, 100)

  } catch (err) {
    console.error('Failed to start recording:', err)
    permissionError.value = true
    toastError('Microphone access denied')
  }
}

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    isRecording.value = false
    clearInterval(recordingInterval)
    clearInterval(waveformInterval)
  }
}

const togglePlayback = () => {
  if (!audioElement) return

  if (isPlaying.value) {
    audioElement.pause()
  } else {
    audioElement.play()
  }
  isPlaying.value = !isPlaying.value
}

const seek = (event) => {
  if (!audioElement) return
  
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const percentage = x / rect.width
  audioElement.currentTime = percentage * duration.value
}

const deleteRecording = () => {
  if (audioElement) {
    audioElement.pause()
    audioElement = null
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  audioUrl.value = null
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
}

const saveRecording = async () => {
  isSaving.value = true
  try {
    // Convert blob URL to actual blob
    const response = await fetch(audioUrl.value)
    const blob = await response.blob()
    
    // Emit save event with blob
    emit('save', blob)
    success('Voice intro saved!')
  } catch (err) {
    console.error('Failed to save recording:', err)
    toastError('Failed to save voice intro')
  } finally {
    isSaving.value = false
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onUnmounted(() => {
  if (audioElement) {
    audioElement.pause()
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  clearInterval(recordingInterval)
  clearInterval(waveformInterval)
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
