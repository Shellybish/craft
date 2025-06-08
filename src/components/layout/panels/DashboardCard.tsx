import React from 'react'
import { cn } from '@/lib/utils'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LucideIcon, MoreHorizontal } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DashboardCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  icon?: LucideIcon
  badge?: string | number
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  actions?: Array<{
    label: string
    onClick: () => void
    icon?: LucideIcon
  }>
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const trendColors = {
  up: 'text-green-600 bg-green-50 border-green-200',
  down: 'text-red-600 bg-red-50 border-red-200',
  neutral: 'text-blue-600 bg-blue-50 border-blue-200',
}

export function DashboardCard({
  children,
  className,
  title,
  description,
  icon: Icon,
  badge,
  badgeVariant = 'secondary',
  trend,
  trendValue,
  actions,
  loading = false,
  size = 'md',
}: DashboardCardProps) {
  return (
    <Card 
      className={cn(
        'relative transition-all duration-200 hover:shadow-md group',
        loading && 'animate-pulse',
        className
      )}
    >
      <CardHeader className={cn(sizeClasses[size], 'pb-2')}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className={cn(
                'flex items-center justify-center rounded-lg',
                size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10',
                'bg-primary/10 text-primary'
              )}>
                <Icon className={cn(
                  size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
                )} />
              </div>
            )}
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {title && (
                  <CardTitle className={cn(
                    size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg'
                  )}>
                    {title}
                  </CardTitle>
                )}
                {badge && (
                  <Badge variant={badgeVariant} className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              
              {description && (
                <CardDescription className={cn(
                  size === 'sm' ? 'text-xs' : 'text-sm'
                )}>
                  {description}
                </CardDescription>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {trend && trendValue && (
              <div className={cn(
                'px-2 py-1 rounded-full text-xs font-medium border',
                trendColors[trend]
              )}>
                {trendValue}
              </div>
            )}

            {actions && actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={action.onClick}
                      className="cursor-pointer"
                    >
                      {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn(sizeClasses[size], 'pt-0')}>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
} 