import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

export const createActivity = (activity) => api.post('/api/activities', activity)

export const getActivities = (filters = {}) => api.get('/api/activities', { params: filters })

export const getWeeklyActivities = () => api.get('/api/activities/weekly')

export const deleteActivity = (id) => api.delete(`/api/activities/${id}`)

export const getSettings = () => api.get('/api/settings')

export const updateSettings = (weeklyTarget) => api.put('/api/settings', { weeklyTarget })

export const getDashboard = () => api.get('/api/dashboard')

export const getDashboardInsights = () => api.get('/api/dashboard/insights')
