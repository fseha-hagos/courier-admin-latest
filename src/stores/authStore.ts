import Cookies from 'js-cookie'
import { create } from 'zustand'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const USER_COOKIE = 'thisisjustarandomstring2'

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
  const cookieState = Cookies.get(ACCESS_TOKEN)
  const userCookieState = Cookies.get(USER_COOKIE)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  const initUser = userCookieState ? JSON.parse(userCookieState) : null
  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          Cookies.set(USER_COOKIE, JSON.stringify(user))
          return { ...state, auth: { ...state.auth, user } }
        }),
      // set((state) => {
      //   Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken))
      //   return { ...state, auth: { ...state.auth, accessToken } }
      // }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken))
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
