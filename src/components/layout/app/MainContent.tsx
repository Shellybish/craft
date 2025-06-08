import React from 'react'
import { cn } from '@/lib/utils'

interface MainContentProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
  scrollable?: boolean
}

export function MainContent({ 
  children, 
  className, 
  padding = true,
  scrollable = true 
}: MainContentProps) {
  return (
    <main
      className={cn(
        'flex-1 flex flex-col min-w-0',
        scrollable && 'overflow-hidden',
        className
      )}
    >
      <div
        className={cn(
          'flex-1 flex flex-col',
          scrollable && 'overflow-y-auto',
          padding && 'p-4 sm:p-6 lg:p-8'
        )}
      >
        {children}
      </div>
    </main>
  )
} 