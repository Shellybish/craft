import React from 'react'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '../providers/LayoutProvider'
import { ViewportProvider } from '../providers/ViewportProvider'

interface AppLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <ViewportProvider>
      <LayoutProvider>
        <div 
          className={cn(
            'min-h-screen bg-background text-foreground',
            'flex flex-col lg:flex-row',
            'transition-colors duration-200',
            className
          )}
        >
          {children}
        </div>
      </LayoutProvider>
    </ViewportProvider>
  )
} 