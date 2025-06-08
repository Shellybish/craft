'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  MessageSquare, 
  CheckSquare, 
  Calendar, 
  Users, 
  Settings,
  LucideIcon
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NavigationItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: string | number
  children?: NavigationItem[]
}

interface NavigationMenuProps {
  items?: NavigationItem[]
  className?: string
  collapsed?: boolean
}

const defaultItems: NavigationItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/chat',
    label: 'Conversations',
    icon: MessageSquare,
    badge: 3,
  },
  {
    href: '/tasks',
    label: 'Tasks',
    icon: CheckSquare,
    badge: 12,
  },
  {
    href: '/projects',
    label: 'Projects',
    icon: Calendar,
    badge: 5,
  },
  {
    href: '/team',
    label: 'Team',
    icon: Users,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export function NavigationMenu({ 
  items = defaultItems, 
  className,
  collapsed = false 
}: NavigationMenuProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className={cn('flex flex-col space-y-1', className)}>
      {items.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)

        return (
          <Button
            key={item.href}
            variant={active ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              'justify-start h-10 px-3',
              collapsed && 'justify-center px-2',
              active && 'bg-accent text-accent-foreground shadow-sm',
              !active && 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
            asChild
          >
            <Link href={item.href}>
              <Icon className={cn('h-4 w-4 flex-shrink-0', !collapsed && 'mr-3')} />
              
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={active ? "default" : "secondary"}
                      className={cn(
                        'ml-auto text-xs h-5 min-w-[20px] px-1.5',
                        active 
                          ? 'bg-primary/20 text-primary-foreground border-primary/20'
                          : 'bg-muted-foreground/10 text-muted-foreground'
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
              
              {collapsed && item.badge && (
                <Badge 
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
} 