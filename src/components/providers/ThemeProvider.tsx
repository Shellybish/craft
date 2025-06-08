'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import theme, { themeUtils } from '@/lib/theme'

// Theme context type
interface ThemeContextType {
  theme: typeof theme
  utils: typeof themeUtils
  isDark: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark' | 'system'
  storageKey?: string
}

/**
 * ThemeProvider component that provides theme configuration and utilities
 * throughout the application. Supports dark/light mode switching and
 * system preference detection.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'dark', // Default to dark theme for our design
  storageKey = 'craft-theme',
}: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(true) // Default to dark theme
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    let initialTheme: boolean
    if (stored) {
      initialTheme = stored === 'dark'
    } else if (defaultTheme === 'system') {
      initialTheme = systemPrefersDark
    } else {
      initialTheme = defaultTheme === 'dark'
    }

    setIsDark(initialTheme)
    setMounted(true)
  }, [defaultTheme, storageKey])

  // Update document class and localStorage when theme changes
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    if (isDark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }

    localStorage.setItem(storageKey, isDark ? 'dark' : 'light')
  }, [isDark, mounted, storageKey])

  // Listen for system theme changes
  useEffect(() => {
    if (defaultTheme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [defaultTheme])

  const toggleTheme = () => {
    setIsDark(prev => !prev)
  }

  const setTheme = (dark: boolean) => {
    setIsDark(dark)
  }

  const contextValue: ThemeContextType = {
    theme,
    utils: themeUtils,
    isDark,
    toggleTheme,
    setTheme,
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme configuration and utilities
 * 
 * @example
 * ```tsx
 * const { theme, utils, isDark, toggleTheme } = useTheme()
 * 
 * // Use theme colors
 * const buttonStyle = {
 *   backgroundColor: theme.colors.interactive.primary,
 *   color: theme.colors.text.primary,
 * }
 * 
 * // Use theme utilities
 * const focusStyle = utils.focusRing()
 * const surfaceStyle = utils.surface('elevated')
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}

/**
 * Hook to get theme-aware CSS custom properties
 * Useful for dynamic styling with CSS-in-JS or inline styles
 */
export function useThemeVars() {
  const { theme, isDark } = useTheme()
  
  return {
    '--color-background-primary': theme.colors.background.primary,
    '--color-background-secondary': theme.colors.background.secondary,
    '--color-background-tertiary': theme.colors.background.tertiary,
    '--color-text-primary': theme.colors.text.primary,
    '--color-text-secondary': theme.colors.text.secondary,
    '--color-text-muted': theme.colors.text.muted,
    '--color-interactive-primary': theme.colors.interactive.primary,
    '--color-interactive-accent': theme.colors.interactive.accent,
    '--border-radius-default': theme.borderRadius.lg,
    '--spacing-component': theme.spacing.component,
    '--animation-duration-normal': theme.animations.duration.normal,
    '--font-family-sans': theme.typography.fontFamily.sans,
  } as React.CSSProperties
}

/**
 * Component that applies theme-aware styling to its children
 * Useful for creating themed sections or components
 */
interface ThemedSectionProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'interactive'
  className?: string
}

export function ThemedSection({ 
  children, 
  variant = 'default',
  className = '' 
}: ThemedSectionProps) {
  const { utils } = useTheme()
  
  const variantClasses = {
    default: 'bg-background',
    elevated: 'surface-elevated',
    interactive: 'surface-interactive',
  }
  
  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  )
}

export default ThemeProvider 