// src/services/auth.js
import api from './api'

export const authService = {
  // Send OTP to phone
  async sendOTP(phone) {
    // More flexible validation
    if (!phone) {
      throw new Error('Phone number is required')
    }
    
    // If phone doesn't start with +, assume it's a Malawian number
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      if (phone.startsWith('265')) {
        formattedPhone = '+' + phone;
      } else if (phone.startsWith('9') || phone.startsWith('8')) {
        // More flexible approach - accept any number starting with 9 or 8
        formattedPhone = '+265' + phone;
      } else {
        throw new Error('Please enter a valid Malawian phone number')
      }
    }
    
    const response = await api.post('/auth/send-otp', { phoneNumber: formattedPhone })
    return response.data
  },

  // Verify OTP
  async verifyOTP(phone, otp) {
    // Apply same formatting logic for consistency
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      if (phone.startsWith('265')) {
        formattedPhone = '+' + phone;
      } else if (phone.startsWith('9') || phone.startsWith('8')) {
        // More flexible approach - accept any number starting with 9 or 8
        formattedPhone = '+265' + phone;
      }
    }
    
    const response = await api.post('/auth/verify-otp', { phoneNumber: formattedPhone, otp })
    return response.data // { token, user }
  },

  // Submit a selfie for verification (Tinder-style face match).
  // The face-match score is computed in the browser with face-api.js and sent here.
  async submitSelfie(selfieFile, { faceMatchScore = 0, poseChallenge = '', livenessPassed = false } = {}) {
    const formData = new FormData()
    formData.append('selfie', selfieFile)
    formData.append('faceMatchScore', faceMatchScore)
    formData.append('poseChallenge', poseChallenge)
    formData.append('livenessPassed', livenessPassed)

    const response = await api.post('/verification/selfie', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data // { status, verified, faceMatchScore, message }
  },

  // Backward-compat alias (old callers pass just a file). Prefer submitSelfie.
  async uploadID(selfieFile) {
    return this.submitSelfie(selfieFile)
  },

  // Get current verification status
  async getVerificationStatus() {
    const response = await api.get('/verification/status')
    return response.data
  },

  // Get current user profile
  async getProfile() {
    const response = await api.get('/auth/profile')
    return response.data
  },

  // Permanently delete the current account
  async deleteAccount() {
    const response = await api.delete('/auth/profile')
    return response.data
  },

  // Update user profile with support for file uploads
  async updateProfile(profileData) {
    // Check if we have file data that needs special handling
    const hasFiles = profileData.photos && profileData.photos.some(photo => photo instanceof File || photo instanceof Blob);
    
    if (hasFiles) {
      // Handle file uploads with FormData
      const formData = new FormData();
      
      // Append all profile data as JSON
      const { photos, ...otherData } = profileData;
      formData.append('profileData', JSON.stringify(otherData));
      
      // Append photos separately
      if (photos) {
        photos.forEach((photo, index) => {
          if (photo instanceof File || photo instanceof Blob) {
            formData.append(`photos`, photo);
          } else {
            // For existing photo URLs, we just send the URL
            formData.append(`photoUrls[${index}]`, photo);
          }
        });
      }
      
      const response = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } else {
      // Regular update without file uploads
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    }
  }
}