/* eslint-disable no-console */

import { phoneNumberClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { useAuthStore } from "@/stores/authStore"
import { adminClient } from "better-auth/client/plugins"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { toast } from "@/hooks/use-toast"

// Get the appropriate API URL based on environment
const apiUrl = import.meta.env.DEV 
  ? "http://localhost:3000" 
  : "https://courier-server-q8dx.onrender.com"

if (!apiUrl) {
  throw new Error('API URL not configured. Please check your environment variables.')
}

// Log which API URL is being used in development
if (import.meta.env.DEV) {
  console.log(`🔐 Auth client using API URL: ${apiUrl}`)
}

export const authClient = createAuthClient({
    baseURL: apiUrl,
    plugins: [
        phoneNumberClient(), 
        adminClient(),
        inferAdditionalFields({
            user: {
              vehicles: {
                type: "string[]"
              },
              deliveries: {
                type: "string[]"
              }
            }
        })
    ],
    fetchOptions: {
        credentials: 'include', // Enable sending cookies
        onSuccess: (ctx) => {
            if (import.meta.env.DEV) {
                console.log("Auth success:", ctx)
            }
        },
        onError: (ctx) => {
            // Handle authentication errors
            if (ctx.error.status === 401) {
                toast({
                    variant: 'destructive',
                    title: 'Session expired',
                    description: 'Please log in again'
                })
                useAuthStore.getState().auth.reset()
            }
        },
        onResponse(context) {
            if (import.meta.env.DEV) {
                console.log("Auth response headers:", context.response.headers)
                console.log("Current auth token:", useAuthStore.getState().auth.accessToken)
            }
        },
    },
    auth: {
        type: "Bearer",
        token: () => {
            const token = useAuthStore.getState().auth.accessToken
            if (!token) {
                return ""
            }
            // Return the raw token - Bearer prefix will be added by the client
            return token
        },
    }
})