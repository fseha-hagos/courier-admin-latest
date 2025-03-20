/* eslint-disable no-console */
import { create } from 'zustand'
import type { Package } from '../types'
import packagesApi from './packagesApi'

export type PackagesDialogType = 'create' | 'update' | 'delete' | 'import'

export interface Label {
    value: string;
    label: string;
}

interface PackagesState {
    packages: Package[] | null
    loading: boolean
    fetchPackages: () => Promise<void>
    setPackages: (packages: Package[] | null) => void
    reset: () => void
    open: PackagesDialogType | null
    setOpen: (open: PackagesDialogType | null) => void
    currentRow: Package | null
    setCurrentRow: (currentRow: Package | null) => void
}

export const usePackagesStore = create<PackagesState>((set) => ({
    packages: null,
    loading: false,
    fetchPackages: async () => {
        try {
            set({ loading: true })

            const response = await packagesApi.getAll()
            console.log("PACKAGESSSSS: ", response.packages)
            
            // Transform the response if needed (e.g., ensure dates are properly parsed)
            const packages = response.packages.map(pkg => ({
                ...pkg,
                createdAt: new Date(pkg.createdAt),
                updatedAt: new Date(pkg.updatedAt),
                deletedAt: pkg.deletedAt ? new Date(pkg.deletedAt) : null,
                delivery: pkg.delivery ? {
                    ...pkg.delivery,
                    pickupTime: pkg.delivery.pickupTime ? new Date(pkg.delivery.pickupTime) : undefined,
                    deliveryTime: pkg.delivery.deliveryTime ? new Date(pkg.delivery.deliveryTime) : undefined,
                } : undefined,
                locationHistory: pkg.locationHistory.map(history => ({
                    ...history,
                    timestamp: new Date(history.timestamp)
                }))
            }))

            set({ packages, loading: false })
        } catch (error) {
            console.error("Error fetching packages:", error)
            set({ packages: [], loading: false }) // Default to an empty array on error
        }
    },
    setPackages: (packages: Package[] | null) => {
        set({ packages })
    },
    reset: () => set({ packages: null }),
    open: null,
    setOpen: (open: PackagesDialogType | null) => {
        set((state) => {
            // Toggle between dialog states
            const newState = state.open === open ? null : open
            return { open: newState }
        })
    },
    currentRow: null,
    setCurrentRow: (currentRow: Package | null) => {
        console.log("Setting currentRow:", currentRow)
        set({ currentRow })
    },
}))

// export const usePackages = () => usePackagesStore();
