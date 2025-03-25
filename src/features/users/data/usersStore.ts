/* eslint-disable no-console */
import { create } from 'zustand'
import { User } from './schema'
import axios from 'axios'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface UsersState {
  users: User[] | null
  loading: boolean
  fetchUsers: () => Promise<void>
  setUsers: (users: User[] | null) => void
  reset: () => void
  open: UsersDialogType | null
  setOpen: (open: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: (currentRow: User | null) => void
}

// Get the appropriate API URL based on environment
const apiUrl = import.meta.env.VITE_API_URL 

if (!apiUrl) {
  throw new Error('API URL not configured. Please check your environment variables.')
}

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
})

export const useUsersStore = create<UsersState>((set) => ({
  users: null,
  loading: false,
  fetchUsers: async () => {
    try {
      set({ loading: true })

      const { data } = await api.get('/users')
      set({ users: data.users, loading: false })
    } catch (error) {
      console.error("Error fetching users:", error)
      set({ users: [], loading: false }) // Default to an empty array on error
    }
  },
  setUsers: (users: User[] | null) => {
    set({ users })
  },
  reset: () => set({ users: null }),
  open: null,
  setOpen: (open: UsersDialogType | null) => {
    set((state) => {
      // Toggle between dialog states
      const newState = state.open === open ? null : open
      return { open: newState }
    })
  },
  currentRow: null,
  setCurrentRow: (currentRow: User | null) => {
    console.log("Setting currentRow:", currentRow)
    set({ currentRow })
  },
}))

// export const useUsers = () => useUsersStore();
