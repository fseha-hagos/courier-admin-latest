/* eslint-disable no-console */
import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
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
// import { useAuthStore } from '@/stores/authStore'
// import { authClient } from '@/lib/auth-client'
import axios from 'axios'
import { useAuth } from '@/stores/authStore'
import { toast } from '@/hooks/use-toast'
import { IconCircleCheck } from '@tabler/icons-react'

type CompleteProfileFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Please enter your name' }),
    password: z
      .string()
      .min(1, {
        message: 'Please enter your password',
      })
      .min(8, {
        message: 'Password must be at least 8 characters long',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function CompleteProfileForm({ className, ...props }: CompleteProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const auth = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
    },
  })

  const setPassword = async (sessionToken: string, newPassword: string, newName: string) => {
    // console.log('sessionToken:', sessionToken);
    console.log('password:', newPassword);
    setIsLoading(true)

    try {
      const { data } = await axios.post(
        'api/set-password',
        { newPassword, newName }, // Request body
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`, // Attach the session token
          },
        },

      );
      if (data.success) {
        toast({
          title: 'Congratulations!',
          description: (
            <span>
              You have successfully completed your profile.
            </span>
          ),
        })
        setIsLoading(false)

        navigate({ to: '/' })
      }

      console.log(data.message); // Password set successfully
    } catch (error) {
      toast({
        title: 'Error!',
        description: (
          <span>
            An error occured and your profile couldn't be saved.
          </span>
        ),
      })
      setIsLoading(false)

      console.error('Error:', error);
    }

  };

  async function onSubmit(formData: z.infer<typeof formSchema>) {
    // console.log(formData)
    const { password, name } = formData
    const token = auth.accessToken
    console.log('password:', password);
    await setPassword(token, password, name)


  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel> Name </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter your name' {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={isLoading} type='submit'>
              Finish
              <IconCircleCheck color={"green"} />
            </Button>
          </div>

        </form>
      </Form>
    </div>
  )
}
