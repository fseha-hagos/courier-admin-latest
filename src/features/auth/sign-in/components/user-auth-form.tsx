/* eslint-disable no-console */
import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { authClient } from '@/lib/auth-client'
import { toast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, { message: 'Please enter your phone number' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(6, {
      message: 'Password must be at least 6 characters long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    console.log(data)

    await authClient.signIn.phoneNumber({
      phoneNumber: data.phoneNumber,
      password: data.password,
      rememberMe: true //optional defaults to true
    },
      {
        onRequest: () => {
          //show loading
          setIsLoading(true)
        },
        onSuccess: (ctx) => {
          try {
            const authStore = useAuthStore.getState().auth;
            const sessionToken = ctx.data.token;
            const user = ctx.data.user;
            if (sessionToken) {
              authStore.setAccessToken(sessionToken);
            }
            if (user) {
              authStore.setUser(user);
            }
          } catch (error) {
            alert(JSON.stringify(error));
          }
          setIsLoading(false)
          navigate({ to: '/' })
        },
        onError: (ctx) => {
          setIsLoading(false)
          toast({
            variant: 'destructive',
            title: 'Something went wrong!',
            description: (
              <span>
                {ctx.error.message}
              </span>
            ),
          })
        },
      })
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='phoneNumber'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder='911121314' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Password</FormLabel>
                    <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-muted-foreground hover:opacity-75'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={isLoading}>
              Login
            </Button>


          </div>
        </form>
      </Form>
    </div>
  )
}
