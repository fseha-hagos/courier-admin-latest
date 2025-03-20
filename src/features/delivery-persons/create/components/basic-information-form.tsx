import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CreateDeliveryPersonForm } from '../../types/create-form'
import { Button } from '@/components/ui/button'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { PhoneInput } from '@/components/phone-input'

interface BasicInformationFormProps {
  form: UseFormReturn<CreateDeliveryPersonForm>
  className?: string
}

export function BasicInformationForm({ form, className }: BasicInformationFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Update form value
      form.setValue('basicInformation.photo', file)

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemovePhoto = () => {
    form.setValue('basicInformation.photo', null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="basicInformation.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="basicInformation.phoneNumber"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <PhoneInput 
                  {...field}
                  defaultCountry="ET"
                  placeholder="+251 9X XXX XXXX"
                  onChange={(value: string, isValid: boolean) => {
                    onChange(value)
                    if (!isValid) {
                      form.setError('basicInformation.phoneNumber', {
                        type: 'manual',
                        message: 'Please enter a valid Ethiopian phone number'
                      })
                    } else {
                      form.clearErrors('basicInformation.phoneNumber')
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
          name="basicInformation.photo"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Profile Photo</FormLabel>
              <FormControl>
                <div className="flex items-start space-x-4">
                  <div className={cn(
                    "flex items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed",
                    "transition-colors duration-200",
                    previewUrl ? "border-muted" : "border-muted-foreground/25"
                  )}>
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewUrl}
                          alt="Profile preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={handleRemovePhoto}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-full w-full flex flex-col items-center justify-center gap-2"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = handlePhotoChange as any
                          input.click()
                        }}
                      >
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Upload photo</span>
                      </Button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Upload a profile photo. This will be visible to customers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
} 