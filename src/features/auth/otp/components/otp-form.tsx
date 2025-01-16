/* eslint-disable no-console */
import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { PinInput, PinInputField } from '@/components/pin-input'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/authStore'
import { IconChevronRight } from '@tabler/icons-react'

type OtpFormProps = HTMLAttributes<HTMLDivElement> & {
  phonenumber: string
}

const formSchema = z.object({
  otp: z.string().min(1, { message: 'Please enter your otp code.' }),
})

export function OtpForm({ className, ...props }: OtpFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [disabledBtn, setDisabledBtn] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: '' },
  })


  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    await authClient.phoneNumber.verify({
      phoneNumber: props.phonenumber,
      code: data.otp
    },
      {
        onRequest: () => {
          //show loading
          setIsLoading(true)
          console.log("phone number: ", props.phonenumber)
        },
        onSuccess: (ctx) => {

          console.log("ctx-data", ctx.data)
          try {
            const sessionToken = ctx.data.token;
            // const password = props.password;
            // const userInfo = ctx.response.headers.get("user-info"); // Optionally get user data
            // Store the token securely (e.g., in localStorage)
            if (sessionToken) {
              // Use authStore to manage token and user info
              const authStore = useAuthStore.getState().auth;
              authStore.setAccessToken(sessionToken);
            }
          } catch (error) {
            alert(JSON.stringify(error));
          }

          toast({
            title: 'Your phone number has been verified!',
            description: (
              <span>
                Please, complete your profile before logging into your account.
              </span>
            ),
          })
          navigate({ to: '/complete-profile' })
          setIsLoading(false)
        },
        onError: (ctx) => {
          setIsLoading(false)
          toast({
            title: `${ctx.error.message}`,
            description: (
              <span>
                Your phone number has not been verified!
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
              name='otp'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormControl>
                    <PinInput
                      {...field}
                      className='flex h-10 justify-between'
                      onComplete={() => setDisabledBtn(false)}
                      onIncomplete={() => setDisabledBtn(true)}
                    >
                      {Array.from({ length: 7 }, (_, i) => {
                        if (i === 3)
                          return <Separator key={i} orientation='vertical' />
                        return (
                          <PinInputField
                            key={i}
                            component={Input}
                            className={`${form.getFieldState('otp').invalid ? 'border-red-500' : ''}`}
                          />
                        )
                      })}
                    </PinInput>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={disabledBtn || isLoading}>
              Verify
              <IconChevronRight />

            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
