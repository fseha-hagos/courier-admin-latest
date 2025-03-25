/* eslint-disable no-console */
import { HTMLAttributes, useState } from 'react'
import { IconChevronRight } from '@tabler/icons-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
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
import { authClient } from "@/lib/auth-client"
import { toast } from '@/hooks/use-toast'

type SignUpFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z
  .object({
    phoneNumber: z
      .string()
      .min(1, { message: 'Please enter your phone number' })
      .refine((value) => {
        try {
          const phoneNumber = parsePhoneNumber(value, 'ET')
          return phoneNumber?.isValid() || false
        } catch {
          return false
        }
      }, "Please enter a valid Ethiopian phone number"),
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
    try {
      setIsLoading(true)
      const phoneNumber = parsePhoneNumber(formData.phoneNumber, 'ET')
      if (!phoneNumber?.isValid()) {
        toast({
          variant: 'destructive',
          title: 'Invalid phone number',
          description: 'Please enter a valid Ethiopian phone number',
        })
        return
      }

      const e164PhoneNumber = phoneNumber.format('E.164')
      await authClient.phoneNumber.sendOtp({
        phoneNumber: e164PhoneNumber
      },
        {
          onRequest: () => {
            setIsLoading(true)
          },
          onSuccess: () => {
            setIsLoading(false)
            navigate({ to: `/otp?phone=${e164PhoneNumber}` })
          },
          onError: (ctx) => {
            setIsLoading(false)
            toast({
              variant: 'destructive',
              title: 'Error',
              description: ctx.error.message || 'Failed to send OTP. Please try again.',
            })
          },
        })
    } catch {
      setIsLoading(false)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process phone number. Please try again.',
      })
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
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
            <Button className='mt-2' disabled={isLoading} type='submit'>
              Create Account 
              <IconChevronRight />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
