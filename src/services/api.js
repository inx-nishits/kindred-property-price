import axios from 'axios'

// Create axios instance with default config
// For serverless functions, use relative path in production or local dev server
const getBaseURL = () => {
  // In production, use relative path for serverless functions
  if (import.meta.env.PROD) {
    return '' // Relative path works for Vercel/Netlify
  }
  // In development, use Vite dev server or local serverless function
  // Check if VITE_API_BASE_URL is set, otherwise use default for Netlify dev
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  // Default to empty string for relative paths (works with both Vercel and Netlify)
  return ''
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // Increased timeout for email sending
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token')
      // Optionally redirect to login
    }
    return Promise.reject(error)
  }
)

export default api

