// src/services/api.js
import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  // The backend sleeps on Render's free tier and can take ~30s to wake on the
  // first request. Allow enough time so the first login doesn't time out.
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor: add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kondani_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem('kondani_token')
      const currentPath = window.location.pathname
      // NEVER reload or redirect if the user is already on the login or register page
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login'
      }
    }
    // Friendlier message for cold-start timeouts / network drops
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
      error.message = 'The server is taking longer than expected — please wait a moment.'
    } else if (!error.response) {
      error.message = 'Network error — check your connection and try again.'
    }
    return Promise.reject(error)
  }
)

export default api