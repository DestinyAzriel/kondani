<template>
  <Teleport to="body">
    <Transition name="celebration">
      <div v-if="show" class="celebration-overlay" @click="close">
        <!-- Confetti Canvas -->
        <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>
        
        <!-- Match Card -->
        <div class="celebration-content" @click.stop>
          <!-- Animated Heart -->
          <div class="celebration-heart">
            <svg class="heart-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>

          <!-- Match Text -->
          <h1 class="celebration-title">It's a Match!</h1>
          <p class="celebration-subtitle">
            You and {{ matchName }} liked each other
          </p>

          <!-- Profile Photos -->
          <div class="match-photos">
            <div class="photo-container photo-left">
              <img :src="userPhoto" alt="You" class="match-photo" />
            </div>
            <div class="photo-container photo-right">
              <img :src="matchPhoto" alt="Match" class="match-photo" />
            </div>
          </div>

          <!-- Actions -->
          <div class="celebration-actions">
            <button @click="sendMessage" class="action-button primary">
              Send Message
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <button @click="keepSwiping" class="action-button secondary">
              Keep Swiping
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  matchName: {
    type: String,
    required: true
  },
  matchPhoto: {
    type: String,
    required: true
  },
  userPhoto: {
    type: String,
    required: true
  },
  matchId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])
const router = useRouter()

const confettiCanvas = ref(null)
let confettiAnimationId = null

const close = () => {
  emit('close')
}

const sendMessage = () => {
  router.push(`/chats/${props.matchId}`)
  close()
}

const keepSwiping = () => {
  close()
}

// Confetti animation
const createConfetti = () => {
  if (!confettiCanvas.value) return

  const canvas = confettiCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const confettiPieces = []
  const confettiCount = 150
  const colors = ['#f4b740', '#ffd98a', '#2dd4bf', '#ff7a6b', '#ffffff']

  class ConfettiPiece {
    constructor() {
      this.x = Math.random() * canvas.width
      this.y = -20
      this.size = Math.random() * 8 + 4
      this.speedY = Math.random() * 3 + 2
      this.speedX = Math.random() * 2 - 1
      this.color = colors[Math.floor(Math.random() * colors.length)]
      this.rotation = Math.random() * 360
      this.rotationSpeed = Math.random() * 10 - 5
    }

    update() {
      this.y += this.speedY
      this.x += this.speedX
      this.rotation += this.rotationSpeed
      
      if (this.y > canvas.height) {
        this.y = -20
        this.x = Math.random() * canvas.width
      }
    }

    draw() {
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate((this.rotation * Math.PI) / 180)
      ctx.fillStyle = this.color
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
      ctx.restore()
    }
  }

  for (let i = 0; i < confettiCount; i++) {
    confettiPieces.push(new ConfettiPiece())
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    confettiPieces.forEach(piece => {
      piece.update()
      piece.draw()
    })
    confettiAnimationId = requestAnimationFrame(animate)
  }

  animate()
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    setTimeout(createConfetti, 100)
  } else {
    if (confettiAnimationId) {
      cancelAnimationFrame(confettiAnimationId)
    }
  }
})

onUnmounted(() => {
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId)
  }
})
</script>

<style scoped>
.celebration-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(10, 14, 26, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.confetti-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.celebration-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 500px;
  width: 100%;
  animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.celebration-heart {
  margin-bottom: 24px;
  animation: heartBeat 1s ease-in-out infinite;
}

.heart-icon {
  width: 80px;
  height: 80px;
  color: #f43f5e;
  filter: drop-shadow(0 0 20px rgba(244, 63, 94, 0.5));
}

.celebration-title {
  font-size: 48px;
  font-weight: bold;
  color: white;
  margin-bottom: 12px;
  font-family: var(--font-display);
  text-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
}

.celebration-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
}

.match-photos {
  display: flex;
  justify-content: center;
  gap: -40px;
  margin-bottom: 40px;
  position: relative;
}

.photo-container {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid #f4b740;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(244, 183, 64, 0.45);
}

.photo-left {
  animation: slideInLeft 0.6s ease-out 0.3s both;
}

.photo-right {
  animation: slideInRight 0.6s ease-out 0.3s both;
  margin-left: -40px;
}

.match-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.celebration-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s;
}

.action-button.primary {
  background: linear-gradient(135deg, #f4b740, #ffd98a);
  color: #050d12;
  box-shadow: 0 4px 12px rgba(244, 183, 64, 0.35);
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-button.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Animations */
.celebration-enter-active,
.celebration-leave-active {
  transition: opacity 0.3s;
}

.celebration-enter-from,
.celebration-leave-to {
  opacity: 0;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes heartBeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.1);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 640px) {
  .celebration-title {
    font-size: 36px;
  }
  
  .photo-container {
    width: 100px;
    height: 100px;
  }
  
  .heart-icon {
    width: 60px;
    height: 60px;
  }
}
</style>
