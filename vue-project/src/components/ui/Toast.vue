<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast pointer-events-auto"
          :class="toastClass(toast.type)"
          @click="removeToast(toast.id)"
        >
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div class="flex-shrink-0 mt-0.5">
              <CheckCircle v-if="toast.type === 'success'" :size="20" />
              <XCircle v-else-if="toast.type === 'error'" :size="20" />
              <AlertTriangle v-else-if="toast.type === 'warning'" :size="20" />
              <Info v-else :size="20" />
            </div>
            
            <!-- Message -->
            <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
            
            <!-- Close -->
            <button
              @click.stop="removeToast(toast.id)"
              class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X :size="16" />
            </button>
          </div>
          
          <!-- Progress Bar -->
          <div
            v-if="toast.duration > 0"
            class="absolute bottom-0 left-0 h-1 bg-current opacity-30 transition-all duration-75 ease-linear"
            :style="{ width: `${toast.progress}%` }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const toastClass = (type) => {
  const baseClasses = 'relative min-w-[320px] max-w-md p-4 rounded-xl backdrop-blur-xl border shadow-lg cursor-pointer overflow-hidden'
  
  switch (type) {
    case 'success':
      return `${baseClasses} bg-emerald-500/10 border-emerald-500/30 text-emerald-400`
    case 'error':
      return `${baseClasses} bg-red-500/10 border-red-500/30 text-red-400`
    case 'warning':
      return `${baseClasses} bg-yellow-500/10 border-yellow-500/30 text-yellow-400`
    default:
      return `${baseClasses} bg-blue-500/10 border-blue-500/30 text-blue-400`
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
