/* eslint-disable no-console */
import { create } from 'zustand'
import { User } from './schema'
import axios from 'axios';  // Import Axios


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
      set({ loading: true });

      // Make an API call using Axios
      const { data } = await axios.get('/api/users');
      console.log("USERSSSSS: ", data.users)
      set({ users: data.users, loading: false });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ users: [], loading: false }); // Default to an empty array on error
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
