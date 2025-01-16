/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { cn } from "@/lib/utils"
import { IconCircleCheck, IconCircleDashed, IconCircleDashedCheck } from "@tabler/icons-react"
import { useLocation } from "@tanstack/react-router"
import { useMemo, useState } from "react"

interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  const [step, setStep] = useState<{ stepTitle: string, stepProgress: number }>({ stepTitle: "Create account", stepProgress: 1 / 3 })
  const location = useLocation()



  useMemo((() => {
    if (location.pathname.includes("sign-up")) {
      setStep({ stepTitle: "Create account", stepProgress: 1 / 3 })
    }
    if (location.pathname.includes("otp")) {
      setStep({ stepTitle: "Verify your phone number", stepProgress: 2 / 3 })
    }
    if (location.pathname.includes("complete-profile")) {
      setStep({ stepTitle: "Complete profile", stepProgress: 3 / 3 })
    }
    console.log("location: ", location.pathname)
  }), [location])

  return (
    <div className='container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8'>

        <div className="mb-4 flex flex-row justify-center items-center">
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          <h1 className='text-xl font-medium'>{step.stepTitle}</h1>
        </div>



        <div className="px-4 grid grid-cols-2 gap-1 justify-start items-center">

          <div className="flex flex-row items-center w-full">
            {/* <span>
              {step.stepProgress > 1 / 3 ? <IconCircleDashedCheck />
                :
                <IconCircleDashed className={cn(step.stepProgress == 1 / 3 && 'text-green-500')} />}
            </span> */}
            <span className={cn(step.stepProgress > 1 / 3 ? 'bg-green-500 ' : 'bg-green-900', 'h-1 w-full rounded')}></span>
            {/* <span>
              {step.stepProgress > 2 / 3 ? <IconCircleDashedCheck />
                :
                <IconCircleDashed className={cn(step.stepProgress == 2 / 3 && 'text-green-500')} />}
            </span> */}

          </div>

          <div className="flex flex-row items-center w-full">
            <span className={cn(step.stepProgress > 2 / 3 ? 'bg-green-500 ' : 'bg-green-900', 'h-1 w-full rounded')}></span>
            {/* <span>
              {step.stepProgress > 3 / 3 ? <IconCircleCheck />
                :
                <IconCircleDashed className={cn(step.stepProgress == 3 / 3 && 'text-green-700')} />}
            </span> */}

          </div>



        </div>
        {children}
      </div>
    </div>
  )
}
