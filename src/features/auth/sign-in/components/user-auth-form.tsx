/* eslint-disable no-console */
import { HTMLAttributes } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { parsePhoneNumber } from 'libphonenumber-js'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PhoneInput } from '@/components/phone-input'
import { PasswordInput } from '@/components/password-input'
import { authClient } from '@/lib/auth-client'
import { toast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { Loader2 } from 'lucide-react'

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      console.log('Raw form data:', data)
      const phoneNumber = parsePhoneNumber(data.phoneNumber, 'ET') // Ethiopia country code
      if (!phoneNumber?.isValid()) {
        toast({
          variant: 'destructive',
          title: 'Invalid phone number',
          description: 'Please enter a valid Ethiopian phone number',
        })
        return
      }

      const e164PhoneNumber = phoneNumber.format('E.164') // Ensure E.164 format
      console.log('Submission payload:', {
        phoneNumber: e164PhoneNumber,
        password: data.password,
        rememberMe: true
      })
      
      await authClient.signIn.phoneNumber(
        {
          phoneNumber: e164PhoneNumber,
          password: data.password,
          rememberMe: true
        },
        {
          onRequest: () => {
            // Loading state is handled by the form's isSubmitting state
          },
          onSuccess: (ctx) => {
            try {
              const authStore = useAuthStore.getState().auth
              const sessionToken = ctx.data.token
              const user = ctx.data.user
              if (sessionToken) {
                // Store the raw token without Bearer prefix
                const rawToken = sessionToken.startsWith('Bearer ') ? sessionToken.substring(7) : sessionToken
                authStore.setAccessToken(rawToken)
              }
              if (user) {
                authStore.setUser(user)
              }
              toast({
                title: 'Welcome back!',
                description: 'You have successfully logged in.',
              })
              navigate({ to: '/' })
            } catch (err) {
              console.error('Login error:', err)
              toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: 'Could not complete login. Please try again.',
              })
            }
          },
          onError: (ctx) => {
            toast({
              variant: 'destructive',
              title: 'Login failed',
              description: ctx.error.message || 'Please check your credentials and try again.',
            })
          },
          retry: {
            type: 'linear',
            delay: 1000,
            attempts: 3
          }
        }
      )
    } catch (err) {
      console.error('Phone number parsing error:', err)
      toast({
        variant: 'destructive',
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number',
      })
    }
  }

  const isLoading = form.formState.isSubmitting

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name='phoneNumber'
            render={({ field: { onChange, ...field } }) => (
              <FormItem className='space-y-1'>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <PhoneInput 
                    {...field}
                    defaultCountry="ET"
                    placeholder="+251 9X XXX XXXX"
                    onChange={(value: string, isValid: boolean) => {
                      onChange(value)
                      if (!isValid) {
                        form.setError('phoneNumber', {
                          type: 'manual',
                          message: 'Please enter a valid Ethiopian phone number'
                        })
                      } else {
                        form.clearErrors('phoneNumber')
                      }
                    }}
                  />
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
          <Button className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
