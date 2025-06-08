import React from 'react'
import { cn } from '@/lib/utils'

interface FlexLayoutProps {
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: {
    sm?: Partial<Omit<FlexLayoutProps, 'children' | 'className' | 'responsive'>>
    md?: Partial<Omit<FlexLayoutProps, 'children' | 'className' | 'responsive'>>
    lg?: Partial<Omit<FlexLayoutProps, 'children' | 'className' | 'responsive'>>
    xl?: Partial<Omit<FlexLayoutProps, 'children' | 'className' | 'responsive'>>
  }
}

const directionClasses = {
  row: 'flex-row',
  col: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse',
}

const wrapClasses = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  'wrap-reverse': 'flex-wrap-reverse',
}

const justifyClasses = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

const alignClasses = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

export function FlexLayout({
  children,
  className,
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'start',
  gap = 'none',
  responsive,
}: FlexLayoutProps) {
  const getResponsiveClasses = () => {
    if (!responsive) return ''
    
    return Object.entries(responsive)
      .map(([breakpoint, props]) => {
        const classes = []
        
        if (props.direction) {
          classes.push(`${breakpoint}:${directionClasses[props.direction]}`)
        }
        if (props.wrap) {
          classes.push(`${breakpoint}:${wrapClasses[props.wrap]}`)
        }
        if (props.justify) {
          classes.push(`${breakpoint}:${justifyClasses[props.justify]}`)
        }
        if (props.align) {
          classes.push(`${breakpoint}:${alignClasses[props.align]}`)
        }
        if (props.gap) {
          classes.push(`${breakpoint}:${gapClasses[props.gap]}`)
        }
        
        return classes.join(' ')
      })
      .join(' ')
  }

  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        wrapClasses[wrap],
        justifyClasses[justify],
        alignClasses[align],
        gapClasses[gap],
        getResponsiveClasses(),
        className
      )}
    >
      {children}
    </div>
  )
} 