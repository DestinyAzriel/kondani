// src/stores/auth.js
import { defineStore } from 'pinia'
import { authService } from '@/services/auth'

let initialUser = null
try {
  const cached = localStorage.getItem('kondani_user')
  if (cached) initialUser = JSON.parse(cached)
} catch (e) {
  initialUser = null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: initialUser,
    token: localStorage.getItem('kondani_token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isVerified: (state) => state.user?.idVerified || false
  },

  actions: {
    // Set session directly (e.g. from WhatsApp 1-tap verification)
    async setSession({ token, user }) {
      this.token = token
      localStorage.setItem('kondani_token', token)
      if (user) {
        this.user = user
        try { localStorage.setItem('kondani_user', JSON.stringify(user)) } catch (e) {}
      }
      await this.fetchUser()
    },

    // Login / Register with Google
    async googleLogin(credential) {
      this.loading = true
      this.error = null
      try {
        const data = await authService.googleLogin(credential)
        this.token = data.token
        localStorage.setItem('kondani_token', data.token)
        if (data.user) {
          this.user = data.user
          try { localStorage.setItem('kondani_user', JSON.stringify(data.user)) } catch (e) {}
        }
        await this.fetchUser()
        return data
      } catch (err) {
        this.error = err.response?.data?.error || err.response?.data?.message || err.message || 'Google sign-in failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    // Login with OTP
    async login(phone, otp) {
      this.loading = true
      this.error = null
      try {
        const { token, user } = await authService.verifyOTP(phone, otp)
        this.token = token
        localStorage.setItem('kondani_token', token)
        if (user) {
          this.user = user
          try { localStorage.setItem('kondani_user', JSON.stringify(user)) } catch (e) {}
        }
        await this.fetchUser()
      } catch (err) {
        this.error = err.response?.data?.error || err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // Register & send OTP
    async register(phone) {
      this.loading = true
      this.error = null
      try {
        await authService.sendOTP(phone)
      } catch (err) {
        this.error = err.response?.data?.error || err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // Fetch user profile
    async fetchUser() {
      if (!this.token) return
      try {
        const profile = await authService.getProfile()
        this.user = profile
        try { localStorage.setItem('kondani_user', JSON.stringify(profile)) } catch (e) {}
        return profile
      } catch (err) {
        console.error('Failed to fetch user:', err)
        // If token is invalid, logout
        if (err.response?.status === 401) {
          this.logout()
        }
        throw err
      }
    },

    // Update user profile with partial updates
    async updateUserProfile(profileData) {
      if (!this.token) return
      try {
        // Merge the new data with existing user data
        const updatedUser = await authService.updateProfile(profileData)
        // Update the user in the store
        this.user = { ...this.user, ...updatedUser }
        try { localStorage.setItem('kondani_user', JSON.stringify(this.user)) } catch (e) {}
        return this.user
      } catch (err) {
        console.error('Failed to update profile:', err)
        throw err
      }
    },

    // Verify ID
    async verifyID(idFile, documentType = 'national_id') {
      if (!this.user) return
      try {
        console.log('Submitting ID for verification:', { idFile, documentType })
        const result = await authService.uploadID(idFile, documentType)
        console.log('ID verification result:', result)
        this.user = { ...this.user, idVerified: result.idVerified }
        try { localStorage.setItem('kondani_user', JSON.stringify(this.user)) } catch (e) {}
        return result
      } catch (err) {
        console.error('ID verification error:', err)
        // Extract meaningful error message
        let errorMessage = 'ID verification failed. Please try again.'
        if (err.response && err.response.data) {
          if (err.response.data.message) {
            errorMessage = err.response.data.message
          } else if (err.response.data.error) {
            errorMessage = err.response.data.error
          }
        }
        this.error = errorMessage
        throw new Error(errorMessage)
      }
    },

    // Permanently delete the account, then clear local session
    async deleteAccount() {
      await authService.deleteAccount()
      await this.logout()
    },

    // Enhanced Logout with best practices
    async logout() {
      try {
        // Clear user data
        this.user = null
        this.token = null
        
        // Remove token and user from localStorage
        localStorage.removeItem('kondani_token')
        localStorage.removeItem('kondani_user')
        
        // Clear all auth-related data from sessionStorage
        sessionStorage.clear()
        
        // Clear any cookies if they exist (optional)
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
        
      } catch (error) {
        console.error('Logout error:', error)
        this.user = null
        this.token = null
        localStorage.removeItem('kondani_token')
        localStorage.removeItem('kondani_user')
      }
    }
  }
})