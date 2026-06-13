import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
    const addToast = (message, type = 'info', duration = 3000) => {
        const id = toastId++
        const toast = {
            id,
            message,
            type, // 'success', 'error', 'warning', 'info'
            duration,
            progress: 100
        }

        toasts.value.push(toast)

        // Auto-dismiss
        if (duration > 0) {
            const startTime = Date.now()
            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime
                toast.progress = Math.max(0, 100 - (elapsed / duration) * 100)

                if (elapsed >= duration) {
                    clearInterval(interval)
                    removeToast(id)
                }
            }, 16) // ~60fps
        }

        return id
    }

    const removeToast = (id) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    const success = (message, duration) => addToast(message, 'success', duration)
    const error = (message, duration) => addToast(message, 'error', duration)
    const warning = (message, duration) => addToast(message, 'warning', duration)
    const info = (message, duration) => addToast(message, 'info', duration)

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info
    }
}
