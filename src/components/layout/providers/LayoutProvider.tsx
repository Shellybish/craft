'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface LayoutState {
  sidebarCollapsed: boolean
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  isMobile: boolean
}

interface LayoutContextType extends LayoutState {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LayoutState>({
    sidebarCollapsed: false,
    sidebarOpen: false,
    theme: 'system',
    isMobile: false,
  })

  // Handle responsive breakpoints
  useEffect(() => {
    const checkMobile = () => {
      setState(prev => ({ ...prev, isMobile: window.innerWidth < 768 }))
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (state.isMobile && state.sidebarOpen) {
      setState(prev => ({ ...prev, sidebarOpen: false }))
    }
  }, [state.isMobile, state.sidebarOpen])

  const toggleSidebar = () => {
    setState(prev => ({
      ...prev,
      sidebarCollapsed: state.isMobile ? prev.sidebarCollapsed : !prev.sidebarCollapsed,
      sidebarOpen: state.isMobile ? !prev.sidebarOpen : prev.sidebarOpen,
    }))
  }

  const setSidebarOpen = (open: boolean) => {
    setState(prev => ({ ...prev, sidebarOpen: open }))
  }

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setState(prev => ({ ...prev, theme }))
  }

  const value: LayoutContextType = {
    ...state,
    toggleSidebar,
    setSidebarOpen,
    setTheme,
  }

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
} 