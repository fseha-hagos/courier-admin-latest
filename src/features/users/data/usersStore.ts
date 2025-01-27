/* eslint-disable no-console */
import { create } from 'zustand'
import { User } from './schema'
import { authClient } from '@/lib/auth-client'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface UsersState {
  users: User[] | null
  loading: boolean
  fetchUsers: () => Promise<void>; // Fetch method
  setUsers: (users: User[] | null) => void
  reset: () => void
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: (currentRow: User | null) => void
}

export const useUsersStore = create<UsersState>((set) => ({
  users: null,
  loading: false,
  fetchUsers: async () => {
    try {
      set({ loading: true })
      await authClient.admin.listUsers({
        query: {
          limit: 10,
        },
        fetchOptions: {
          onSuccess: (data) => {
            console.log('data', data.data.users)
            const users: User[] = data.data.users
            if (data.data && data.data.users) {
              set({ users })
            }
          },
          onError: (error) => {
            console.log('error', error)
          }
        }
      });
      set({ loading: false })
    } catch (error) {
      console.error('Error fetching users:', error);
      set({ users: [] }); // Default to empty array on error
    }
  },
  setUsers: (users: User[] | null) => {
    set({ users });
  },
  reset: () => set({ users: null }),
  open: null,
  setOpen: (open: UsersDialogType | null) => {
    set((state) => {
      // Toggle between dialog states
      const newState = state.open === open ? null : open;
      return { open: newState };
    });
  },
  currentRow: null,
  setCurrentRow: (currentRow: User | null) => {
    console.log("Setting currentRow:", currentRow);
    set({ currentRow })
  },

}))

// export const useUsers = () => useUsersStore();
