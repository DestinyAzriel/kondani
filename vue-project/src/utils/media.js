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

export function mediaUrl(path, fallback = '') {
  if (!path) return fallback
  if (/^(https?:|blob:|data:)/i.test(path)) return path
  return ORIGIN + (path.startsWith('/') ? path : '/' + path)
}

export default mediaUrl
