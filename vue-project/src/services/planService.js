// src/services/planService.js
import api from '@/services/api'

export const planService = {
  // Fetch active plans (optional category filter)
  async getPlans(category = 'all') {
    const params = {}
    if (category && category !== 'all') {
      params.category = category
    }
    const response = await api.get('/plans', { params })
    return response.data // { success, plans, count }
  },

  // Create a new date/activity plan
  async createPlan(planData) {
    const response = await api.post('/plans', planData)
    return response.data // { success, plan }
  },

  // Join someone's plan -> creates match and icebreaker in chat
  async joinPlan(planId, note = '') {
    const response = await api.post(`/plans/${planId}/join`, { note })
    return response.data // { success, chatId, hostName, message }
  },

  // Delete own plan
  async deletePlan(planId) {
    const response = await api.delete(`/plans/${planId}`)
    return response.data
  }
}
