import React from 'react'
import { cn } from '@/lib/utils'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card'

interface PanelProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  footer?: React.ReactNode
  variant?: 'default' | 'outline'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Panel({
  children,
  className,
  title,
  description,
  footer,
  variant = 'default',
  padding = 'md',
}: PanelProps) {
  return (
    <Card 
      className={cn(
        variant === 'outline' && 'border-2',
        className
      )}
    >
      {(title || description) && (
        <CardHeader className={cn(paddingClasses[padding], 'pb-3')}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent 
        className={cn(
          paddingClasses[padding],
          (title || description) && 'pt-0'
        )}
      >
        {children}
      </CardContent>

      {footer && (
        <CardFooter className={cn(paddingClasses[padding], 'pt-0')}>
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}

// Export additional Card components for direct use
export {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card' 