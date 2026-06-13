// Activity Status Tracking Service
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from './api'

class ActivityService {
    constructor() {
        this.lastActivityTime = ref(Date.now())
        this.isActive = ref(true)
        this.activityInterval = null
        this.heartbeatInterval = null
    }

    /**
     * Initialize activity tracking
     */
    init() {
        this.setupActivityListeners()
        this.startHeartbeat()
    }

    /**
     * Setup event listeners for user activity
     */
    setupActivityListeners() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

        events.forEach(event => {
            document.addEventListener(event, () => this.updateActivity(), { passive: true })
        })

        // Check for inactivity every 30 seconds
        this.activityInterval = setInterval(() => {
            this.checkInactivity()
        }, 30000)
    }

    /**
     * Update last activity time
     */
    updateActivity() {
        this.lastActivityTime.value = Date.now()
        if (!this.isActive.value) {
            this.isActive.value = true
            this.sendActivityStatus('active')
        }
    }

    /**
     * Check if user is inactive
     */
    checkInactivity() {
        const now = Date.now()
        const timeSinceActivity = now - this.lastActivityTime.value

        // 5 minutes of inactivity = inactive
        if (timeSinceActivity > 5 * 60 * 1000 && this.isActive.value) {
            this.isActive.value = false
            this.sendActivityStatus('inactive')
        }
    }

    /**
     * Send heartbeat to server every 60 seconds
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(async () => {
            if (this.isActive.value) {
                await this.sendHeartbeat()
            }
        }, 60000) // Every minute
    }

    /**
     * Send heartbeat to update last seen
     */
    async sendHeartbeat() {
        try {
            await api.post('/activity/heartbeat', {
                timestamp: Date.now(),
                isActive: this.isActive.value
            })
        } catch (err) {
            console.error('Heartbeat failed:', err)
        }
    }

    /**
     * Send activity status change to server
     */
    async sendActivityStatus(status) {
        try {
            await api.post('/activity/status', {
                status,
                timestamp: Date.now()
            })
        } catch (err) {
            console.error('Activity status update failed:', err)
        }
    }

    /**
     * Get user's activity status
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Activity status
     */
    async getUserActivity(userId) {
        try {
            const response = await api.get(`/activity/${userId}`)
            return response.data
        } catch (err) {
            console.error('Failed to get user activity:', err)
            return null
        }
    }

    /**
     * Calculate activity status from last seen
     * @param {number} lastSeen - Timestamp of last activity
     * @returns {Object} - Status object
     */
    calculateStatus(lastSeen) {
        if (!lastSeen) {
            return {
                status: 'offline',
                label: 'Offline',
                color: 'gray',
                dot: false
            }
        }

        const now = Date.now()
        const diff = now - lastSeen

        // Active now (within 5 minutes)
        if (diff < 5 * 60 * 1000) {
            return {
                status: 'active',
                label: 'Active now',
                color: 'emerald',
                dot: true,
                animate: true
            }
        }

        // Active today (within 24 hours)
        if (diff < 24 * 60 * 60 * 1000) {
            return {
                status: 'today',
                label: 'Active today',
                color: 'yellow',
                dot: false
            }
        }

        // Active this week (within 7 days)
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            return {
                status: 'week',
                label: 'Active this week',
                color: 'gray',
                dot: false
            }
        }

        // Inactive
        return {
            status: 'offline',
            label: 'Offline',
            color: 'gray',
            dot: false
        }
    }

    /**
     * Format last seen time
     * @param {number} lastSeen - Timestamp
     * @returns {string} - Formatted time
     */
    formatLastSeen(lastSeen) {
        if (!lastSeen) return 'Never'

        const now = Date.now()
        const diff = now - lastSeen

        const minutes = Math.floor(diff / (60 * 1000))
        const hours = Math.floor(diff / (60 * 60 * 1000))
        const days = Math.floor(diff / (24 * 60 * 60 * 1000))

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return 'Over a week ago'
    }

    /**
     * Cleanup intervals
     */
    cleanup() {
        if (this.activityInterval) {
            clearInterval(this.activityInterval)
        }
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
        }
    }
}

export const activityService = new ActivityService()

// Vue composable for activity status
export const useActivityStatus = () => {
    const authStore = useAuthStore()

    const myStatus = computed(() => {
        return activityService.calculateStatus(Date.now())
    })

    const getUserStatus = (lastSeen) => {
        return activityService.calculateStatus(lastSeen)
    }

    const formatLastSeen = (lastSeen) => {
        return activityService.formatLastSeen(lastSeen)
    }

    return {
        myStatus,
        getUserStatus,
        formatLastSeen,
        isActive: activityService.isActive
    }
}
