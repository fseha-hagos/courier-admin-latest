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