// Haversine distance — free, no external API. Mirrors frontend geoService.js.
const EARTH_RADIUS_KM = 6371
const toRad = (d) => (d * Math.PI) / 180

export function calculateDistance(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some((v) => v == null)) return null
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

export function formatDistance(km) {
  if (km == null) return null
  if (km < 1) return 'Less than 1 km away'
  return `${Math.round(km)} km away`
}
