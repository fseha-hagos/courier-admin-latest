import axios from 'axios'
import { router } from '@/main'
import { useAuthStore } from '@/stores/authStore'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
})

// Add request interceptor for authentication
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Check for token in response headers
    const token = response.headers.authorization
    if (token) {
      const rawToken = token.startsWith('Bearer ') ? token.substring(7) : token
      useAuthStore.getState().auth.setAccessToken(rawToken)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      useAuthStore.getState().auth.reset()
      router.navigate({ to: '/sign-in' })
    }
    return Promise.reject(error)
  }
) 