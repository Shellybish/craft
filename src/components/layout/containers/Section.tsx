import React from 'react'
import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  as?: 'section' | 'div' | 'article' | 'aside' | 'nav' | 'main'
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  background?: 'none' | 'muted' | 'card'
  border?: 'none' | 'top' | 'bottom' | 'around'
  maxWidth?: boolean
  centered?: boolean
}

const spacingClasses = {
  none: '',
  sm: 'py-4',
  md: 'py-8',
  lg: 'py-12',
  xl: 'py-16',
}

const backgroundClasses = {
  none: '',
  muted: 'bg-muted/50',
  card: 'bg-card',
}

const borderClasses = {
  none: '',
  top: 'border-t border-border',
  bottom: 'border-b border-border',
  around: 'border border-border rounded-lg',
}

export function Section({
  children,
  className,
  as: Component = 'section',
  spacing = 'md',
  background = 'none',
  border = 'none',
  maxWidth = true,
  centered = false,
}: SectionProps) {
  return (
    <Component
      className={cn(
        'w-full',
        spacingClasses[spacing],
        backgroundClasses[background],
        borderClasses[border],
        className
      )}
    >
      <div
        className={cn(
          maxWidth && 'max-w-7xl',
          centered && 'mx-auto',
          (maxWidth || centered) && 'px-4 sm:px-6 lg:px-8'
        )}
      >
        {children}
      </div>
    </Component>
  )
} 