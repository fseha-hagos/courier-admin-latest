import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { CompleteProfileForm } from './components/complete-profile-form'

export default function CompleteProfile() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-lg font-semibold tracking-tight'>
            Complete your profile
          </h1>
          <p className='text-sm text-muted-foreground'>
            Enter your name and password to complete your profile and create an account. <br />
          </p>
        </div>
        <CompleteProfileForm />
        
      </Card>
    </AuthLayout>
  )
}
