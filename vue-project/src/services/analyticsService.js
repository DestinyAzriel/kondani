// Analytics service for tracking user engagement and events
// Tracks key metrics: swipes, matches, messages, filter usage, etc.

import api from './api'

class AnalyticsService {
    constructor() {
        this.sessionId = this.generateSessionId()
        this.eventQueue = []
        this.isOnline = navigator.onLine

        // Listen for online/offline events
        window.addEventListener('online', () => this.flushQueue())
        window.addEventListener('offline', () => this.isOnline = false)
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    getUserId() {
        // Get from localStorage or auth store
        return localStorage.getItem('kondani_user_id') || 'anonymous'
    }

    /**
     * Track a generic event
     * @param {string} eventName - Name of the event
     * @param {object} properties - Additional event properties
     */
    track(eventName, properties = {}) {
        const event = {
            name: eventName,
            timestamp: new Date().toISOString(),
            userId: this.getUserId(),
            sessionId: this.sessionId,
            ...properties
        }

        // Store locally first
        this.storeEventLocally(event)

        // Try to send to backend
        if (this.isOnline) {
            this.sendEvent(event)
        } else {
            this.eventQueue.push(event)
        }
    }

    async sendEvent(event) {
        try {
            await api.post('/analytics/events', event)
        } catch (err) {
            console.error('Failed to send analytics event:', err)
            // Queue for retry
            this.eventQueue.push(event)
        }
    }

    async flushQueue() {
        if (this.eventQueue.length === 0) return

        const events = [...this.eventQueue]
        this.eventQueue = []

        try {
            await api.post('/analytics/events/batch', { events })
        } catch (err) {
            console.error('Failed to flush analytics queue:', err)
            // Re-queue failed events
            this.eventQueue.push(...events)
        }
    }

    storeEventLocally(event) {
        try {
            const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
            events.push(event)

            // Keep only last 100 events
            if (events.length > 100) {
                events.shift()
            }

            localStorage.setItem('analytics_events', JSON.stringify(events))
        } catch (err) {
            console.error('Failed to store event locally:', err)
        }
    }

    // Swipe Events
    trackSwipe(direction, profileId, profileName) {
        this.track(`swipe_${direction}`, {
            profileId,
            profileName,
            direction
        })
    }

    trackSwipeLeft(profileId, profileName) {
        this.trackSwipe('left', profileId, profileName)
    }

    trackSwipeRight(profileId, profileName) {
        this.trackSwipe('right', profileId, profileName)
    }

    trackSwipeUp(profileId, profileName) {
        this.trackSwipe('up', profileId, profileName)
    }

    // Match Events
    trackMatch(matchId, matchedUserId, matchedUserName) {
        this.track('match_created', {
            matchId,
            matchedUserId,
            matchedUserName
        })
    }

    trackMatchDismissed(matchId) {
        this.track('match_dismissed', { matchId })
    }

    trackMatchOpened(matchId) {
        this.track('match_opened', { matchId })
    }

    // Message Events
    trackMessageSent(chatId, recipientId) {
        this.track('message_sent', {
            chatId,
            recipientId
        })
    }

    trackMessageReceived(chatId, senderId) {
        this.track('message_received', {
            chatId,
            senderId
        })
    }

    // Profile Events
    trackProfileViewed(profileId, source = 'encounters') {
        this.track('profile_viewed', {
            profileId,
            source // encounters, daily_picks, likes, etc.
        })
    }

    trackProfileEdited(changes) {
        this.track('profile_edited', { changes })
    }

    // Filter Events
    trackFilterApplied(filters) {
        this.track('filter_applied', {
            ageMin: filters.ageMin,
            ageMax: filters.ageMax,
            distance: filters.distance,
            region: filters.region,
            gender: filters.gender,
            interestCount: filters.interests?.length || 0,
            verifiedOnly: filters.verifiedOnly
        })
    }

    trackFilterReset() {
        this.track('filter_reset')
    }

    // Verification Events
    trackVerificationStarted() {
        this.track('verification_started')
    }

    trackVerificationCompleted(success) {
        this.track('verification_completed', { success })
    }

    trackVerificationSkipped() {
        this.track('verification_skipped')
    }

    // Video Call Events
    trackVideoCallStarted(recipientId) {
        this.track('video_call_started', { recipientId })
    }

    trackVideoCallEnded(recipientId, duration) {
        this.track('video_call_ended', {
            recipientId,
            duration
        })
    }

    // Session Events
    trackSessionStart() {
        this.track('session_start')
    }

    trackSessionEnd(duration) {
        this.track('session_end', { duration })
    }

    // Daily Picks Events
    trackDailyPicksViewed() {
        this.track('daily_picks_viewed')
    }

    trackDailyPickInteraction(pickId, action) {
        this.track('daily_pick_interaction', {
            pickId,
            action // like, pass, message
        })
    }

    // Engagement Metrics
    trackTimeSpent(screen, duration) {
        this.track('time_spent', {
            screen,
            duration
        })
    }

    // Get local analytics data (for debugging)
    getLocalEvents() {
        try {
            return JSON.parse(localStorage.getItem('analytics_events') || '[]')
        } catch {
            return []
        }
    }

    clearLocalEvents() {
        localStorage.removeItem('analytics_events')
    }
}

export const analyticsService = new AnalyticsService()

// Track session start on load
analyticsService.trackSessionStart()

// Track session end on unload
let sessionStartTime = Date.now()
window.addEventListener('beforeunload', () => {
    const duration = Date.now() - sessionStartTime
    analyticsService.trackSessionEnd(duration)
    analyticsService.flushQueue()
})
