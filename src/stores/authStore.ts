/* eslint-disable no-console */
import Cookies from 'js-cookie'
import { create } from 'zustand'
import { websocketService } from '@/lib/websocket'

// Cookie names for storing auth state
const ACCESS_TOKEN = 'auth_token'
const USER_COOKIE = 'user_data'

export interface AuthUser {
  accountNo?: string
  name: string
  phoneNumber: string
  image?: string
  role?: string
  exp?: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

// Helper function to clean token
function cleanToken(token: string): string {
  try {
    // If token is stored as JSON string, parse it
    if (token.startsWith('"') || token.startsWith('{')) {
      token = JSON.parse(token)
    }
    // Remove Bearer prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.substring(7)
    }
    return token
  } catch (e) {
    console.error('Error cleaning token:', e)
    return token
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  // Initialize state from cookies
  const cookieState = Cookies.get(ACCESS_TOKEN)
  const userCookieState = Cookies.get(USER_COOKIE)
  const initToken = cookieState ? cleanToken(cookieState) : ''
  const initUser = userCookieState ? JSON.parse(userCookieState) : null

  // Set initial token in WebSocket service
  websocketService.setAuthToken(initToken || null)

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (user) {
            Cookies.set(USER_COOKIE, JSON.stringify(user))
          } else {
            Cookies.remove(USER_COOKIE)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          const cleanedToken = cleanToken(accessToken)
          if (cleanedToken) {
            Cookies.set(ACCESS_TOKEN, cleanedToken)
            websocketService.setAuthToken(cleanedToken)
          } else {
            Cookies.remove(ACCESS_TOKEN)
            websocketService.setAuthToken(null)
          }
          return { ...state, auth: { ...state.auth, accessToken: cleanedToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          websocketService.setAuthToken(null)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          Cookies.remove(USER_COOKIE)
          websocketService.setAuthToken(null)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})

export const useAuth = () => useAuthStore((state) => state.auth)
