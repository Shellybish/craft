import React from 'react'
import { cn } from '@/lib/utils'

interface GridLayoutProps {
  children: React.ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  rows?: 'auto' | number
  autoFit?: boolean
  minItemWidth?: string
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

export function GridLayout({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'md',
  rows = 'auto',
  autoFit = false,
  minItemWidth = '250px',
}: GridLayoutProps) {
  const colClasses = Object.entries(cols)
    .map(([breakpoint, count]) => {
      if (breakpoint === 'default') {
        return `grid-cols-${count}`
      }
      return `${breakpoint}:grid-cols-${count}`
    })
    .join(' ')

  const rowClass = rows === 'auto' ? 'grid-rows-auto' : `grid-rows-${rows}`

  const gridStyle = autoFit
    ? {
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
      }
    : undefined

  return (
    <div
      className={cn(
        'grid',
        !autoFit && colClasses,
        rows !== 'auto' && rowClass,
        gapClasses[gap],
        className
      )}
      style={gridStyle}
    >
      {children}
    </div>
  )
} 