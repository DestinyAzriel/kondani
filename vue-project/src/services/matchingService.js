// Matching service for Daily Picks algorithm
// Uses compatibility scoring based on multiple factors

import { geoService } from './geoService'

/**
 * Calculate compatibility score between user and candidate
 * Max score: 100 points
 * @param {object} user - Current user profile
 * @param {object} candidate - Candidate profile
 * @param {object} userLocation - { lat, lon }
 * @returns {number} Compatibility score (0-100)
 */
export function calculateCompatibilityScore(user, candidate, userLocation) {
    let score = 0

    // 1. Mutual interests (30 points max)
    if (user.interests && candidate.interests) {
        const sharedInterests = user.interests.filter(i =>
            candidate.interests.includes(i)
        )
        score += Math.min(sharedInterests.length * 10, 30)
    }

    // 2. Distance proximity (25 points max)
    if (userLocation && candidate.lat && candidate.lon) {
        const distance = geoService.calculateDistance(
            userLocation.lat,
            userLocation.lon,
            candidate.lat,
            candidate.lon
        )
        if (distance < 10) score += 25
        else if (distance < 50) score += 15
        else if (distance < 100) score += 5
    }

    // 3. Age compatibility (20 points max)
    if (user.age && candidate.age) {
        const ageDiff = Math.abs(user.age - candidate.age)
        if (ageDiff < 3) score += 20
        else if (ageDiff < 5) score += 15
        else if (ageDiff < 10) score += 10
    }

    // 4. Profile completeness (15 points max)
    let completenessScore = 0
    if (candidate.bio) completenessScore += 5
    if (candidate.prompts && candidate.prompts.length >= 2) completenessScore += 5
    if (candidate.photos && candidate.photos.length >= 3) completenessScore += 5
    score += completenessScore

    // 5. Activity level (10 points max)
    if (candidate.lastActive === 'today') score += 10
    else if (candidate.lastActive === 'this week') score += 5

    // Bonus: Verified profiles (+5 points)
    if (candidate.isVerified) score += 5

    return Math.min(score, 100)
}

/**
 * Get daily picks for a user
 * @param {object} user - Current user profile
 * @param {array} allCandidates - All available candidates
 * @param {object} userLocation - { lat, lon }
 * @param {number} count - Number of picks to return (default: 10)
 * @returns {array} Sorted array of top picks with scores
 */
export function getDailyPicks(user, allCandidates, userLocation, count = 10) {
    // Score all candidates
    const scored = allCandidates.map(candidate => ({
        ...candidate,
        compatibilityScore: calculateCompatibilityScore(user, candidate, userLocation),
        compatibilityPercentage: Math.round(calculateCompatibilityScore(user, candidate, userLocation))
    }))

    // Sort by score (highest first)
    const sorted = scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

    // Return top N picks
    return sorted.slice(0, count)
}

/**
 * Generate "why we picked them" explanation
 * @param {object} user - Current user profile
 * @param {object} pick - Daily pick profile with score
 * @param {object} userLocation - { lat, lon }
 * @returns {array} Array of reason strings
 */
export function getMatchReasons(user, pick, userLocation) {
    const reasons = []

    // Shared interests
    if (user.interests && pick.interests) {
        const shared = user.interests.filter(i => pick.interests.includes(i))
        if (shared.length > 0) {
            reasons.push(`You both love ${shared.slice(0, 2).join(' and ')}`)
        }
    }

    // Distance
    if (userLocation && pick.lat && pick.lon) {
        const distance = geoService.calculateDistance(
            userLocation.lat,
            userLocation.lon,
            pick.lat,
            pick.lon
        )
        if (distance < 5) {
            reasons.push('Lives very close to you')
        } else if (distance < 20) {
            reasons.push(`Only ${Math.round(distance)}km away`)
        }
    }

    // Age
    if (user.age && pick.age) {
        const ageDiff = Math.abs(user.age - pick.age)
        if (ageDiff < 3) {
            reasons.push('Similar age')
        }
    }

    // Profile quality
    if (pick.prompts && pick.prompts.length >= 2) {
        reasons.push('Detailed profile')
    }

    // Verification
    if (pick.isVerified) {
        reasons.push('Verified profile')
    }

    // Activity
    if (pick.lastActive === 'today') {
        reasons.push('Active today')
    }

    return reasons.slice(0, 3) // Return top 3 reasons
}

export const matchingService = {
    calculateCompatibilityScore,
    getDailyPicks,
    getMatchReasons
}
