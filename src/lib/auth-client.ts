/* eslint-disable no-console */

import { phoneNumberClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { useAuthStore } from "@/stores/authStore"
import { adminClient } from "better-auth/client/plugins"
import { inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: "https://courier-server-q8dx.onrender.com",
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
        credentials: 'include',
        onSuccess: (ctx) => {
            console.log("onSuccess: ", ctx)
        },
        onResponse(context) {
            const token = context.response.headers.get('authorization')
            if (token) {
                useAuthStore.getState().auth.setAccessToken(token.replace('Bearer ', ''))
            }
        },
    },
    auth: {
        type: "Bearer",
        token: () => useAuthStore.getState().auth.accessToken || "",
    }
})