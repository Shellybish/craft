'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface ViewportState {
  width: number
  height: number
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  orientation: 'portrait' | 'landscape'
  isTouch: boolean
}

interface ViewportContextType extends ViewportState {
  isAbove: (breakpoint: ViewportState['breakpoint']) => boolean
  isBelow: (breakpoint: ViewportState['breakpoint']) => boolean
}

const ViewportContext = createContext<ViewportContextType | undefined>(undefined)

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

function getBreakpoint(width: number): ViewportState['breakpoint'] {
  if (width >= breakpoints['2xl']) return '2xl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}

export function ViewportProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ViewportState>({
    width: 0,
    height: 0,
    breakpoint: 'xs',
    orientation: 'portrait',
    isTouch: false,
  })

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setState({
        width,
        height,
        breakpoint: getBreakpoint(width),
        orientation: width > height ? 'landscape' : 'portrait',
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    window.addEventListener('orientationchange', updateViewport)
    
    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('orientationchange', updateViewport)
    }
  }, [])

  const isAbove = (breakpoint: ViewportState['breakpoint']) => {
    return breakpoints[state.breakpoint] >= breakpoints[breakpoint]
  }

  const isBelow = (breakpoint: ViewportState['breakpoint']) => {
    return breakpoints[state.breakpoint] < breakpoints[breakpoint]
  }

  const value: ViewportContextType = {
    ...state,
    isAbove,
    isBelow,
  }

  return (
    <ViewportContext.Provider value={value}>
      {children}
    </ViewportContext.Provider>
  )
}

export function useViewport() {
  const context = useContext(ViewportContext)
  if (context === undefined) {
    throw new Error('useViewport must be used within a ViewportProvider')
  }
  return context
} 