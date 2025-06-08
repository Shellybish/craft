'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TabItem {
  id: string
  label: string
  content?: React.ReactNode
  disabled?: boolean
  badge?: string | number
}

interface TabNavigationProps {
  tabs: TabItem[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  className?: string
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className,
  orientation = 'horizontal',
  size = 'md',
}: TabNavigationProps) {
  const defaultValue = activeTab || tabs[0]?.id || ''

  const sizeClasses = {
    sm: 'text-sm h-8',
    md: 'text-sm h-9',
    lg: 'text-base h-10',
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      defaultValue={defaultValue}
      orientation={orientation}
      className={cn('w-full', className)}
    >
      <TabsList 
        className={cn(
          'grid w-full',
          orientation === 'horizontal' 
            ? `grid-cols-${tabs.length}` 
            : 'grid-rows-auto',
          orientation === 'vertical' && 'h-auto flex-col'
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={cn(
              'relative flex items-center gap-2',
              sizeClasses[size],
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <Badge 
                variant="secondary" 
                className="ml-1 h-5 min-w-[20px] px-1.5 text-xs"
              >
                {tab.badge}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Tab Content */}
      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
} 