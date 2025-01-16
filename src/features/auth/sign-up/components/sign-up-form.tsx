/* eslint-disable no-console */
import { HTMLAttributes, useState } from 'react'
import { IconChevronRight } from '@tabler/icons-react'
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
// import { PasswordInput } from '@/components/password-input'
import { authClient } from "@/lib/auth-client"; //import the auth client

type SignUpFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z
  .object({
    phoneNumber: z
      .string()
      .min(1, { message: 'Please enter your phone number' }),
  })

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '',
    },
  })

  async function onSubmit(formData: z.infer<typeof formSchema>) {
    setIsLoading(true)
    // console.log(formData)

    await authClient.phoneNumber.sendOtp({
      phoneNumber: formData.phoneNumber
    },
      {
        onRequest: () => {
          //show loading
          setIsLoading(true)
        },
        onSuccess: (ctx) => {
          //redirect to the dashboard
          setIsLoading(false)

          navigate({ to: `/otp?phone=${formData.phoneNumber}` })
          console.log("SIGNUP: ctx-data", ctx.data)
        },
        onError: (ctx) => {
          setIsLoading(false)
          alert(ctx.error.message);
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
                  <FormLabel> Phone number </FormLabel>
                  <FormControl>
                    <Input placeholder='911121314' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2 ' disabled={isLoading} type='submit'>
              Create Account 
              <IconChevronRight />
              
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
