// src/services/adminService.js
import api from '@/services/api'

export const adminService = {
  // Get dashboard metrics
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/stats')
    return response.data
  },

  // Get revenue metrics
  async getRevenueAnalytics(period = '30d') {
    const response = await api.get('/admin/dashboard/revenue', { params: { period } })
    return response.data
  },

  // Get paginated users
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params })
    return response.data
  },

  // Update user (tier, ban, role)
  async updateUser(userId, data) {
    const response = await api.put(`/admin/users/${userId}`, data)
    return response.data
  },

  // Delete user
  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`)
    return response.data
  },

  // Get photo / ID verifications
  async getVerifications(status = 'all') {
    const response = await api.get('/admin/verifications', { params: { status } })
    return response.data
  },

  // Review verification (approve/reject)
  async reviewVerification(verificationId, data) {
    const response = await api.post(`/admin/verifications/${verificationId}/review`, data)
    return response.data
  },

  // Get user reports
  async getReports(status = 'all') {
    const response = await api.get('/admin/reports', { params: { status } })
    return response.data
  },

  // Review report
  async reviewReport(reportId, data) {
    const response = await api.post(`/admin/reports/${reportId}/review`, data)
    return response.data
  }
}
