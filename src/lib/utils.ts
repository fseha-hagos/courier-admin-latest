import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { authClient } from './auth-client'
import { useAuthStore } from '@/stores/authStore'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function logout(router: any) {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        useAuthStore.getState().auth.reset()
        const redirect = `${window.location.href}` // Get current URL for redirection
        router.navigate(`/sign-in?redirect=${encodeURIComponent(redirect)}`)
      },
    },
  })
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}