// Geolocation service for Kondani
// Uses Haversine formula for accurate distance calculation in Malawi

/**
 * Calculate distance between two coordinates using Haversine formula
 * Accuracy: ~0.5% error margin (5m per 1km)
 * Perfect for dating app distance calculations
 */

const EARTH_RADIUS_KM = 6371

// Malawi major cities coordinates (for reference/testing)
export const MALAWI_CITIES = {
    lilongwe: { lat: -13.9833, lon: 33.7833, name: 'Lilongwe' },
    blantyre: { lat: -15.7861, lon: 35.0058, name: 'Blantyre' },
    mzuzu: { lat: -11.4581, lon: 34.0151, name: 'Mzuzu' },
    zomba: { lat: -15.3869, lon: 35.3192, name: 'Zomba' },
    karonga: { lat: -9.9333, lon: 33.9333, name: 'Karonga' },
    kasungu: { lat: -13.0333, lon: 33.4833, name: 'Kasungu' },
    mangochi: { lat: -14.4667, lon: 35.2667, name: 'Mangochi' }
}

// Malawi region boundaries (approximate)
const REGION_BOUNDARIES = {
    northern: { maxLat: -11.5 },
    central: { minLat: -14.5, maxLat: -11.5 },
    southern: { minLat: -14.5 }
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180)
}

/**
 * Calculate great-circle distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1 in degrees
 * @param {number} lon1 - Longitude of point 1 in degrees
 * @param {number} lat2 - Latitude of point 2 in degrees
 * @param {number} lon2 - Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return EARTH_RADIUS_KM * c
}

/**
 * Determine which region of Malawi a coordinate is in
 * @param {number} lat - Latitude
 * @returns {string} 'Northern', 'Central', or 'Southern'
 */
export function getRegion(lat) {
    if (lat > REGION_BOUNDARIES.northern.maxLat) {
        return 'Northern'
    } else if (lat > REGION_BOUNDARIES.central.minLat) {
        return 'Central'
    } else {
        return 'Southern'
    }
}

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance(distanceKm) {
    if (distanceKm < 1) {
        return 'Less than 1 km away'
    } else if (distanceKm < 10) {
        return `${Math.round(distanceKm)} km away`
    } else {
        return `${Math.round(distanceKm)} km away`
    }
}

/**
 * Check if a user is within a specified radius
 * @param {object} userLocation - { lat, lon }
 * @param {object} targetLocation - { lat, lon }
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean} True if within radius
 */
export function isWithinRadius(userLocation, targetLocation, radiusKm) {
    const distance = calculateDistance(
        userLocation.lat,
        userLocation.lon,
        targetLocation.lat,
        targetLocation.lon
    )
    return distance <= radiusKm
}

/**
 * Get recommended default radius based on region
 * Urban areas: 50km, Rural areas: 100km
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {number} Recommended radius in km
 */
export function getRecommendedRadius(lat, lon) {
    // Check if near major cities (within 20km)
    for (const city of Object.values(MALAWI_CITIES)) {
        const distance = calculateDistance(lat, lon, city.lat, city.lon)
        if (distance < 20) {
            return 50 // Urban area - smaller radius
        }
    }
    return 100 // Rural area - larger radius
}

/**
 * Find nearest city to a coordinate
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {object} { name, distance }
 */
export function getNearestCity(lat, lon) {
    let nearest = null
    let minDistance = Infinity

    for (const city of Object.values(MALAWI_CITIES)) {
        const distance = calculateDistance(lat, lon, city.lat, city.lon)
        if (distance < minDistance) {
            minDistance = distance
            nearest = city
        }
    }

    return {
        name: nearest?.name || 'Unknown',
        distance: Math.round(minDistance)
    }
}

export const geoService = {
    calculateDistance,
    getRegion,
    formatDistance,
    isWithinRadius,
    getRecommendedRadius,
    getNearestCity,
    MALAWI_CITIES
}
