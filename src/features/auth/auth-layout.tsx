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
    if (location.pathname.includes("sign-in")) {
      setStep({ stepTitle: "", stepProgress: 0 / 3 })
    }
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

          <h1 className='text-xl font-medium'>{step.stepTitle}</h1>
        </div>


        {step.stepProgress != 0 &&
          <div className="px-4 grid grid-cols-2 gap-1 justify-start items-center">

            <div className="flex flex-row items-center w-full">
              <span className={cn(step.stepProgress > 1 / 3 ? 'bg-green-500 ' : 'bg-green-900', 'h-1 w-full rounded')}></span>
            </div>

            <div className="flex flex-row items-center w-full">
              <span className={cn(step.stepProgress > 2 / 3 ? 'bg-green-500 ' : 'bg-green-900', 'h-1 w-full rounded')}></span>
            </div>
          </div>}

        {children}
      </div>
    </div>
  )
}
