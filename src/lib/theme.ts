/**
 * Foundational UI Theme Configuration
 * 
 * This theme is designed with calm, professional aesthetics that reduce cognitive load
 * for creative agency project management. The design principles focus on:
 * 
 * 1. Reduced visual noise through subtle contrasts
 * 2. Consistent spacing and typography hierarchy
 * 3. Calming color palette optimized for long work sessions
 * 4. Accessibility-first approach with proper focus states
 * 5. Smooth animations that feel natural and non-intrusive
 */

export const theme = {
  // Color system optimized for dark theme and reduced eye strain
  colors: {
    // Primary background - deep, calming dark
    background: {
      primary: 'hsl(240, 10%, 3.9%)', // #0f0f10
      secondary: 'hsl(240, 3.7%, 15.9%)', // Elevated surfaces
      tertiary: 'hsl(240, 3.7%, 18%)', // Interactive hover states
    },
    
    // Text hierarchy for clear information architecture
    text: {
      primary: 'hsl(0, 0%, 98%)', // High contrast for important content
      secondary: 'hsl(0, 0%, 63.9%)', // Supporting information
      muted: 'hsl(0, 0%, 45%)', // Subtle details and metadata
      inverse: 'hsl(240, 5.9%, 10%)', // Text on light backgrounds
    },
    
    // Interactive elements
    interactive: {
      primary: 'hsl(0, 0%, 98%)', // Primary actions
      secondary: 'hsl(240, 3.7%, 15.9%)', // Secondary actions
      accent: 'hsl(217, 91%, 60%)', // Accent actions and highlights
      hover: 'hsl(240, 3.7%, 18%)', // Hover states
    },
    
    // Status and feedback colors - carefully chosen for accessibility
    status: {
      success: {
        background: 'hsl(142, 76%, 36%, 0.1)',
        foreground: 'hsl(142, 76%, 45%)',
        border: 'hsl(142, 76%, 36%, 0.2)',
      },
      warning: {
        background: 'hsl(38, 92%, 50%, 0.1)',
        foreground: 'hsl(38, 92%, 60%)',
        border: 'hsl(38, 92%, 50%, 0.2)',
      },
      error: {
        background: 'hsl(0, 62.8%, 30.6%, 0.1)',
        foreground: 'hsl(0, 62.8%, 40%)',
        border: 'hsl(0, 62.8%, 30.6%, 0.2)',
      },
      info: {
        background: 'hsl(217, 91%, 60%, 0.1)',
        foreground: 'hsl(217, 91%, 70%)',
        border: 'hsl(217, 91%, 60%, 0.2)',
      },
    },
    
    // Chart and data visualization colors
    charts: {
      primary: 'hsl(217, 91%, 60%)', // Calming blue
      secondary: 'hsl(142, 76%, 36%)', // Success green
      tertiary: 'hsl(38, 92%, 50%)', // Warning amber
      quaternary: 'hsl(280, 100%, 70%)', // Accent purple
      quinary: 'hsl(340, 82%, 52%)', // Highlight pink
    },
    
    // Border and separator colors
    borders: {
      subtle: 'hsl(240, 3.7%, 15.9%)', // Subtle separation
      default: 'hsl(240, 3.7%, 20%)', // Standard borders
      emphasis: 'hsl(240, 4.9%, 83.9%)', // Focus rings and emphasis
    },
  },
  
  // Typography system for clear information hierarchy
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
    },
    
    // Font feature settings for improved readability
    fontFeatures: {
      inter: '"cv02", "cv03", "cv04", "cv11"', // Inter font optimizations
    },
    
    // Type scale optimized for readability and hierarchy
    scale: {
      xs: { fontSize: '0.75rem', lineHeight: '1rem' }, // 12px
      sm: { fontSize: '0.875rem', lineHeight: '1.25rem' }, // 14px
      base: { fontSize: '1rem', lineHeight: '1.5rem' }, // 16px
      lg: { fontSize: '1.125rem', lineHeight: '1.75rem' }, // 18px
      xl: { fontSize: '1.25rem', lineHeight: '1.75rem' }, // 20px
      '2xl': { fontSize: '1.5rem', lineHeight: '2rem' }, // 24px
      '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' }, // 30px
      '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem' }, // 36px
    },
    
    // Semantic text styles
    hierarchy: {
      h1: 'text-2xl font-semibold text-foreground tracking-tight',
      h2: 'text-xl font-medium text-foreground tracking-tight',
      h3: 'text-lg font-medium text-foreground',
      body: 'text-sm text-foreground leading-relaxed',
      caption: 'text-xs text-muted-foreground',
    },
  },
  
  // Spacing system based on 4px grid for consistency
  spacing: {
    // Base unit: 4px (0.25rem)
    unit: 4,
    
    // Semantic spacing values
    section: '2rem', // 32px - Between major sections
    component: '1rem', // 16px - Between components
    element: '0.5rem', // 8px - Between related elements
    tight: '0.25rem', // 4px - Tight spacing
    loose: '1.5rem', // 24px - Loose spacing
    
    // Layout spacing
    layout: {
      xs: '0.5rem', // 8px
      sm: '1rem', // 16px
      md: '1.5rem', // 24px
      lg: '2rem', // 32px
      xl: '3rem', // 48px
      '2xl': '4rem', // 64px
    },
  },
  
  // Border radius system for consistent rounded corners
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    default: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px - Primary radius
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    full: '9999px',
  },
  
  // Shadow system for depth and elevation
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // Animation system for smooth, natural interactions
  animations: {
    // Duration values
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    
    // Easing functions
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    
    // Common animation presets
    presets: {
      fadeIn: 'fadeIn 0.3s ease-in-out',
      slideUp: 'slideUp 0.3s ease-out',
      scaleIn: 'scaleIn 0.2s ease-out',
    },
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index system for consistent layering
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    tooltip: 1700,
    toast: 1800,
  },
} as const

// Theme utilities for consistent usage
export const themeUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number) => {
    return `${color.replace('hsl(', 'hsl(').replace(')', `, ${opacity})`)})`
  },
  
  // Generate focus ring styles
  focusRing: (color = theme.colors.borders.emphasis) => ({
    outline: 'none',
    boxShadow: `0 0 0 2px ${color}`,
  }),
  
  // Generate surface styles with elevation
  surface: (elevation: 'base' | 'elevated' | 'interactive' = 'base') => {
    const styles = {
      base: {
        backgroundColor: theme.colors.background.primary,
        border: `1px solid ${theme.colors.borders.subtle}`,
      },
      elevated: {
        backgroundColor: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.borders.subtle}`,
        boxShadow: theme.shadows.sm,
      },
      interactive: {
        backgroundColor: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.borders.subtle}`,
        transition: 'all 200ms ease-in-out',
        '&:hover': {
          backgroundColor: theme.colors.background.tertiary,
        },
      },
    }
    return styles[elevation]
  },
  
  // Generate status styles
  status: (type: 'success' | 'warning' | 'error' | 'info') => {
    const statusColors = theme.colors.status[type]
    return {
      backgroundColor: statusColors.background,
      color: statusColors.foreground,
      border: `1px solid ${statusColors.border}`,
    }
  },
}

// Export individual theme sections for convenience
export const colors = theme.colors
export const typography = theme.typography
export const spacing = theme.spacing
export const animations = theme.animations
export const breakpoints = theme.breakpoints

// Default export
export default theme 