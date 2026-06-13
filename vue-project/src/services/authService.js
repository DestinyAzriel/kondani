// COMPATIBILITY SHIM
// ------------------------------------------------------------------
// This file used to be a second, independent axios instance with its own
// token key ('token') and base URL — which clashed with the canonical
// services/api.js (token key 'kondani_token'). That mismatch broke auth +
// sockets. It now re-exports the single canonical instance so any existing
// imports ({ api }, { authService }, or default) all use the same axios,
// the same base URL (VITE_API_BASE_URL) and the same token ('kondani_token').
//
// Prefer importing from '@/services/api' and '@/services/auth' directly.
import api from './api'
import { authService } from './auth'

export { api, authService }
export default authService
