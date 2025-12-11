import api from './api'

/**
 * Example API service
 * Replace with your actual API endpoints
 */

export const exampleService = {
  // Example: Get data
  async getData(params = {}) {
    try {
      const response = await api.get('/data', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching data:', error)
      throw error
    }
  },

  // Example: Create data
  async createData(data) {
    try {
      const response = await api.post('/data', data)
      return response.data
    } catch (error) {
      console.error('Error creating data:', error)
      throw error
    }
  },

  // Example: Update data
  async updateData(id, data) {
    try {
      const response = await api.put(`/data/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating data:', error)
      throw error
    }
  },

  // Example: Delete data
  async deleteData(id) {
    try {
      const response = await api.delete(`/data/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting data:', error)
      throw error
    }
  },
}

