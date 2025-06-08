'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useLayout } from '../providers/LayoutProvider'
import { useViewport } from '../providers/ViewportProvider'
import { X, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileNavProps {
  children: React.ReactNode
  className?: string
  trigger?: React.ReactNode
}

export function MobileNav({ children, className, trigger }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isBelow } = useViewport()
  const isMobile = isBelow('lg')

  // Close on desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false)
    }
  }, [isMobile, isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isMobile) {
    return null
  }

  return (
    <>
      {/* Trigger Button */}
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw]',
          'bg-background border-r border-border',
          'transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="p-2"
            aria-label="Close mobile menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
} 