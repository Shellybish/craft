'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useLayout } from '../providers/LayoutProvider'
import { useViewport } from '../providers/ViewportProvider'
import { X, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
  const { sidebarCollapsed, sidebarOpen, toggleSidebar, setSidebarOpen } = useLayout()
  const { isBelow } = useViewport()
  
  const isMobile = isBelow('lg')

  // Mobile Sidebar using Sheet
  if (isMobile) {
    return (
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="text-left">Craft</SheetTitle>
          </SheetHeader>
          <Separator />
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
          <Separator />
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">v1.0.0</span>
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop Sidebar
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50',
          'bg-card border-r border-border',
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64',
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4">
          <div
            className={cn(
              'flex items-center gap-2 transition-opacity duration-200',
              sidebarCollapsed && 'lg:opacity-0 lg:pointer-events-none'
            )}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Craft</h2>
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </div>
          </div>
          
          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2 hover:bg-accent"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        <Separator />

        {/* Sidebar Footer */}
        <div
          className={cn(
            'p-4 transition-opacity duration-200',
            sidebarCollapsed && 'lg:opacity-0'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Version 1.0.0</span>
            <Badge variant="outline" className="text-xs">
              Pro
            </Badge>
          </div>
        </div>
      </aside>

      {/* Desktop Spacer */}
      <div
        className={cn(
          'hidden lg:block transition-all duration-300',
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        )}
      />
    </>
  )
} 