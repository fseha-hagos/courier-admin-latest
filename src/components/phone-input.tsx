import { forwardRef, useState } from 'react'
import { Input } from './ui/input'
import { AsYouType, parsePhoneNumber, CountryCode } from 'libphonenumber-js'
import { ComponentPropsWithoutRef } from 'react'

interface PhoneInputProps extends Omit<ComponentPropsWithoutRef<typeof Input>, 'onChange'> {
  onChange?: (value: string, isValid: boolean) => void
  defaultCountry?: CountryCode
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, defaultCountry = 'ET' as CountryCode, ...props }, ref) => {
    const [formattedValue, setFormattedValue] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Remove any non-digit characters except + and spaces
      const rawValue = e.target.value.replace(/[^\d\s+]/g, '')
      
      // Format the phone number as the user types
      const formatter = new AsYouType(defaultCountry)
      const formatted = formatter.input(rawValue)
      setFormattedValue(formatted)

      try {
        // Try to parse the phone number to check validity
        const phoneNumber = parsePhoneNumber(rawValue, defaultCountry)
        const isValid = phoneNumber?.isValid() || false
        
        // Pass both the raw value and validity state to parent
        onChange?.(rawValue, isValid)
      } catch {
        // If parsing fails, consider it invalid
        onChange?.(rawValue, false)
      }
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="tel"
        value={formattedValue}
        onChange={handleChange}
        placeholder={props.placeholder || '+251 9X XXX XXXX'}
      />
    )
  }
) 