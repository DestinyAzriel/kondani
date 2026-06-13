// Caching service for performance optimization
// Implements LocalStorage caching with TTL

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

class CacheService {
    /**
     * Set a cache item with TTL
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, data, ttl = DEFAULT_TTL) {
        try {
            const item = {
                data,
                timestamp: Date.now(),
                ttl
            }
            localStorage.setItem(`cache_${key}`, JSON.stringify(item))
        } catch (err) {
            console.error('Cache set error:', err)
            // If localStorage is full, clear old items
            this.clearExpired()
        }
    }

    /**
     * Get a cache item if not expired
     * @param {string} key - Cache key
     * @returns {any} Cached data or null if expired/not found
     */
    get(key) {
        try {
            const item = JSON.parse(localStorage.getItem(`cache_${key}`))
            if (!item) return null

            const age = Date.now() - item.timestamp
            if (age > item.ttl) {
                this.remove(key)
                return null
            }

            return item.data
        } catch (err) {
            console.error('Cache get error:', err)
            return null
        }
    }

    /**
     * Remove a cache item
     * @param {string} key - Cache key
     */
    remove(key) {
        localStorage.removeItem(`cache_${key}`)
    }

    /**
     * Clear all expired cache items
     */
    clearExpired() {
        const keys = Object.keys(localStorage)
        const cacheKeys = keys.filter(k => k.startsWith('cache_'))

        cacheKeys.forEach(key => {
            try {
                const item = JSON.parse(localStorage.getItem(key))
                const age = Date.now() - item.timestamp
                if (age > item.ttl) {
                    localStorage.removeItem(key)
                }
            } catch {
                // Invalid cache item, remove it
                localStorage.removeItem(key)
            }
        })
    }

    /**
     * Clear all cache items
     */
    clearAll() {
        const keys = Object.keys(localStorage)
        const cacheKeys = keys.filter(k => k.startsWith('cache_'))
        cacheKeys.forEach(key => localStorage.removeItem(key))
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const keys = Object.keys(localStorage)
        const cacheKeys = keys.filter(k => k.startsWith('cache_'))

        let totalSize = 0
        let expiredCount = 0

        cacheKeys.forEach(key => {
            const value = localStorage.getItem(key)
            totalSize += value.length

            try {
                const item = JSON.parse(value)
                const age = Date.now() - item.timestamp
                if (age > item.ttl) expiredCount++
            } catch { }
        })

        return {
            itemCount: cacheKeys.length,
            expiredCount,
            totalSizeKB: (totalSize / 1024).toFixed(2)
        }
    }
}

export const cacheService = new CacheService()

// Clear expired items on load
cacheService.clearExpired()

// Clear expired items every 5 minutes
setInterval(() => {
    cacheService.clearExpired()
}, 5 * 60 * 1000)
