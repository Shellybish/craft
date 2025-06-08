'use client'

import React from 'react'
import { useViewport } from '../providers/ViewportProvider'

interface ResponsiveWrapperProps {
  children: React.ReactNode
  show?: {
    xs?: boolean
    sm?: boolean
    md?: boolean
    lg?: boolean
    xl?: boolean
    '2xl'?: boolean
  }
  hide?: {
    xs?: boolean
    sm?: boolean
    md?: boolean
    lg?: boolean
    xl?: boolean
    '2xl'?: boolean
  }
  above?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  below?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  only?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  fallback?: React.ReactNode
}

export function ResponsiveWrapper({
  children,
  show,
  hide,
  above,
  below,
  only,
  fallback = null,
}: ResponsiveWrapperProps) {
  const { breakpoint, isAbove, isBelow } = useViewport()

  // Check if content should be shown
  const shouldShow = () => {
    // Handle 'only' prop
    if (only) {
      return breakpoint === only
    }

    // Handle 'above' prop
    if (above && !isAbove(above)) {
      return false
    }

    // Handle 'below' prop
    if (below && !isBelow(below)) {
      return false
    }

    // Handle 'show' prop
    if (show) {
      const shouldShowAtBreakpoint = show[breakpoint]
      if (shouldShowAtBreakpoint === false) {
        return false
      }
      // If show is defined but current breakpoint is not specified, default to false
      if (shouldShowAtBreakpoint === undefined && Object.keys(show).length > 0) {
        return false
      }
    }

    // Handle 'hide' prop
    if (hide) {
      const shouldHideAtBreakpoint = hide[breakpoint]
      if (shouldHideAtBreakpoint === true) {
        return false
      }
    }

    return true
  }

  if (shouldShow()) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

// Convenience components for common use cases
export function ShowAbove({ 
  breakpoint, 
  children, 
  fallback 
}: { 
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <ResponsiveWrapper above={breakpoint} fallback={fallback}>
      {children}
    </ResponsiveWrapper>
  )
}

export function ShowBelow({ 
  breakpoint, 
  children, 
  fallback 
}: { 
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <ResponsiveWrapper below={breakpoint} fallback={fallback}>
      {children}
    </ResponsiveWrapper>
  )
}

export function ShowOnly({ 
  breakpoint, 
  children, 
  fallback 
}: { 
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <ResponsiveWrapper only={breakpoint} fallback={fallback}>
      {children}
    </ResponsiveWrapper>
  )
} 