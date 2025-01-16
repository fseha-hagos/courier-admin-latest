/* eslint-disable no-console */

import { phoneNumberClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { useAuthStore } from "@/stores/authStore"; // Import the authStore

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [
        phoneNumberClient()
    ],
    fetchOptions: {
        onSuccess: (ctx) => {
            console.log("onSuccess: ", ctx)
        },
        onResponse(context) {
            console.log("onResponse: ", context.response.headers.entries())
            console.log("authStore token: ", useAuthStore.getState().auth.accessToken) // Get the token from useAuthStore
        },
    },
    auth: {
        type: "Bearer",
        token: () => useAuthStore.getState().auth.accessToken || "", // Get the token from useAuthStore
    }
})