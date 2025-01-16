import { Link, useLocation } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { OtpForm } from './components/otp-form'

export default function Otp() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const phoneNumber = queryParams.get('phone') || "";

  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-md font-semibold tracking-tight'>
            Verify your phone number
          </h1>
          <p className='text-sm text-muted-foreground'>
            Please enter the verification code. <br /> We have sent the
            code via sms.
          </p>
        </div>
        <OtpForm phonenumber={phoneNumber} />
        <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
          Haven't received it?{' '}
          <Link
            to='/sign-in'
            className='underline underline-offset-4 hover:text-primary'
          >
            Resend a new code.
          </Link>
          .
        </p>
      </Card>
    </AuthLayout>
  )
}
