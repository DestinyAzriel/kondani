// Central media-URL resolver.
// Photos/voice notes are stored as relative paths like "/uploads/abc.jpg".
// We prefix them with the backend origin. We derive that origin from the SAME
// backend the API uses (VITE_API_BASE_URL, minus the trailing /api) so photos
// work as long as the API works — no separate VITE_SOCKET_URL needed.
// VITE_SOCKET_URL still wins if explicitly set (used by the socket too).

const ORIGIN =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '')

export const MEDIA_ORIGIN = ORIGIN

// Clean dark-theme silhouette avatar fallback
export const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%230b1720'/%3E%3Ccircle cx='50' cy='38' r='20' fill='%23243b53'/%3E%3Cpath d='M20 85 C20 62, 35 58, 50 58 C65 58, 80 62, 80 85 Z' fill='%23243b53'/%3E%3C/svg%3E"

export function mediaUrl(path, fallback = DEFAULT_AVATAR) {
  if (!path) return fallback
  if (/^(https?:|blob:|data:)/i.test(path)) return path
  return ORIGIN + (path.startsWith('/') ? path : '/' + path)
}

export default mediaUrl
