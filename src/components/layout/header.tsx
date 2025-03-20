import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function Header({
  className,
  fixed = false,
  children,
}: {
  className?: string
  fixed?: boolean
  children?: React.ReactNode
}) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (!fixed) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [fixed])

  return (
    <header
      className={cn(
        'flex h-14 items-center gap-4 border-b bg-background',
        fixed && 'sticky top-0 z-40',
        isScrolled && 'shadow-sm',
        className
      )}
    >
      <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
      <Separator orientation='vertical' className='h-6' />
      {children}
    </header>
  )
}

Header.displayName = 'Header'
