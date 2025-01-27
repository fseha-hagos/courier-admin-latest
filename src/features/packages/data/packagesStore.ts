/* eslint-disable no-console */
import { create } from 'zustand'
import { Package } from './schema'
import axios from 'axios';  // Import Axios

export type PackagesDialogType = 'create' | 'update' | 'delete' | 'import'

export interface Label {
    value: string;
    label: string;
}

interface PackagesState {
    packages: Package[] | null
    loading: boolean
    fetchPackages: () => Promise<void> // Fetch method
    setPackages: (packages: Package[] | null) => void
    reset: () => void
    open: PackagesDialogType | null
    setOpen: (str: PackagesDialogType | null) => void
    currentRow: Package | null
    setCurrentRow: (currentRow: Package | null) => void
}

export const usePackagesStore = create<PackagesState>((set) => ({
    packages: null,
    loading: false,
    fetchPackages: async () => {
        try {
            set({ loading: true });

            // Make an API call using Axios
            const { data } = await axios.get('/api/packages');
            console.log("PACKAGESSSSS: ", data.packages)
            set({ packages: data.packages, loading: false });
        } catch (error) {
            console.error("Error fetching packages:", error);
            set({ packages: [], loading: false }); // Default to an empty array on error
        }
    },
    setPackages: (packages: Package[] | null) => {
        set({ packages });
    },
    reset: () => set({ packages: null }),
    open: null,
    setOpen: (open: PackagesDialogType | null) => {
        set((state) => {
            // Toggle between dialog states
            const newState = state.open === open ? null : open;
            return { open: newState };
        });
    },
    currentRow: null,
    setCurrentRow: (currentRow: Package | null) => {
        console.log("Setting currentRow:", currentRow);
        set({ currentRow })
    },

}))

// export const usePackages = () => usePackagesStore();
