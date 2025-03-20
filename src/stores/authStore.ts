import Cookies from 'js-cookie'
import { create } from 'zustand'

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

export const useAuthStore = create<AuthState>()((set) => {
  // Initialize state from cookies
  const cookieState = Cookies.get(ACCESS_TOKEN)
  const userCookieState = Cookies.get(USER_COOKIE)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  const initUser = userCookieState ? JSON.parse(userCookieState) : null

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
          if (accessToken) {
            Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken))
          } else {
            Cookies.remove(ACCESS_TOKEN)
          }
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          Cookies.remove(USER_COOKIE)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})

export const useAuth = () => useAuthStore((state) => state.auth)
