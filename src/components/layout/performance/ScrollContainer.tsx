'use client'

import React, { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ScrollContainerProps {
  children: React.ReactNode
  className?: string
  direction?: 'vertical' | 'horizontal' | 'both'
  showScrollbar?: boolean
  showScrollIndicators?: boolean
  smoothScrolling?: boolean
  scrollBehavior?: 'auto' | 'smooth'
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void
}

export function ScrollContainer({
  children,
  className,
  direction = 'vertical',
  showScrollbar = true,
  showScrollIndicators = false,
  smoothScrolling = true,
  scrollBehavior = 'smooth',
  onScroll,
}: ScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
    canScrollLeft: false,
    canScrollRight: false,
  })

  // Update scroll indicators
  useEffect(() => {
    const updateScrollState = () => {
      if (!containerRef.current) return

      const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } =
        containerRef.current

      setScrollState({
        canScrollUp: scrollTop > 0,
        canScrollDown: scrollTop < scrollHeight - clientHeight,
        canScrollLeft: scrollLeft > 0,
        canScrollRight: scrollLeft < scrollWidth - clientWidth,
      })
    }

    const container = containerRef.current
    if (container) {
      updateScrollState()
      container.addEventListener('scroll', updateScrollState)
      
      // Update on resize
      const resizeObserver = new ResizeObserver(updateScrollState)
      resizeObserver.observe(container)

      return () => {
        container.removeEventListener('scroll', updateScrollState)
        resizeObserver.disconnect()
      }
    }
  }, [])

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    onScroll?.(event)
  }

  const scrollDirectionClasses = {
    vertical: 'overflow-y-auto overflow-x-hidden',
    horizontal: 'overflow-x-auto overflow-y-hidden',
    both: 'overflow-auto',
  }

  return (
    <div className="relative">
      {/* Scroll Indicators */}
      {showScrollIndicators && (
        <>
          {/* Top indicator */}
          {(direction === 'vertical' || direction === 'both') && (
            <div
              className={cn(
                'absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none transition-opacity',
                scrollState.canScrollUp ? 'opacity-100' : 'opacity-0'
              )}
            />
          )}

          {/* Bottom indicator */}
          {(direction === 'vertical' || direction === 'both') && (
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none transition-opacity',
                scrollState.canScrollDown ? 'opacity-100' : 'opacity-0'
              )}
            />
          )}

          {/* Left indicator */}
          {(direction === 'horizontal' || direction === 'both') && (
            <div
              className={cn(
                'absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity',
                scrollState.canScrollLeft ? 'opacity-100' : 'opacity-0'
              )}
            />
          )}

          {/* Right indicator */}
          {(direction === 'horizontal' || direction === 'both') && (
            <div
              className={cn(
                'absolute top-0 bottom-0 right-0 w-4 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity',
                scrollState.canScrollRight ? 'opacity-100' : 'opacity-0'
              )}
            />
          )}
        </>
      )}

      {/* Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          'h-full w-full',
          scrollDirectionClasses[direction],
          !showScrollbar && 'scrollbar-hide',
          smoothScrolling && 'scroll-smooth',
          className
        )}
        style={{
          scrollBehavior,
        }}
      >
        {children}
      </div>
    </div>
  )
} 