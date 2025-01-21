import { create } from 'zustand'

export interface User {
  name: string
  phoneNumber: string
  image?: string
  role?: string
  banned?: boolean
}

interface UsersState {
  users: User[] | null
  setUsers: (users: User[] | null) => void
  refresh: () => void
  reset: () => void
}

export const useUsersStore = create<UsersState>((set) => ({
  users: null,
  setUsers: (users: User[] | null) => set({ users }),
  refresh: () => set((state) => ({ ...state })), // Logic for refresh can be added as needed
  reset: () => set({ users: null }),
}))

export const useUsers = () => useUsersStore();
