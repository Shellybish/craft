import theme, { themeUtils, colors, typography, spacing, animations } from '../theme'

describe('Theme Configuration', () => {
  describe('Color System', () => {
    it('should have all required background colors', () => {
      expect(theme.colors.background.primary).toBe('hsl(240, 10%, 3.9%)')
      expect(theme.colors.background.secondary).toBe('hsl(240, 3.7%, 15.9%)')
      expect(theme.colors.background.tertiary).toBe('hsl(240, 3.7%, 18%)')
    })

    it('should have proper text hierarchy colors', () => {
      expect(theme.colors.text.primary).toBe('hsl(0, 0%, 98%)')
      expect(theme.colors.text.secondary).toBe('hsl(0, 0%, 63.9%)')
      expect(theme.colors.text.muted).toBe('hsl(0, 0%, 45%)')
    })

    it('should have all status colors with proper structure', () => {
      const statusTypes = ['success', 'warning', 'error', 'info'] as const
      
      statusTypes.forEach(type => {
        expect(theme.colors.status[type]).toHaveProperty('background')
        expect(theme.colors.status[type]).toHaveProperty('foreground')
        expect(theme.colors.status[type]).toHaveProperty('border')
      })
    })

    it('should have chart colors for data visualization', () => {
      expect(theme.colors.charts.primary).toBe('hsl(217, 91%, 60%)')
      expect(theme.colors.charts.secondary).toBe('hsl(142, 76%, 36%)')
      expect(theme.colors.charts.tertiary).toBe('hsl(38, 92%, 50%)')
    })
  })

  describe('Typography System', () => {
    it('should have proper font family configuration', () => {
      expect(theme.typography.fontFamily.sans).toContain('Inter')
      expect(theme.typography.fontFamily.sans).toContain('-apple-system')
    })

    it('should have complete type scale', () => {
      const expectedSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'] as const
      
      expectedSizes.forEach(size => {
        expect(theme.typography.scale[size]).toHaveProperty('fontSize')
        expect(theme.typography.scale[size]).toHaveProperty('lineHeight')
      })
    })

    it('should have semantic hierarchy classes', () => {
      expect(theme.typography.hierarchy.h1).toContain('text-2xl')
      expect(theme.typography.hierarchy.h2).toContain('text-xl')
      expect(theme.typography.hierarchy.body).toContain('text-sm')
    })
  })

  describe('Spacing System', () => {
    it('should have consistent base unit', () => {
      expect(theme.spacing.unit).toBe(4)
    })

    it('should have semantic spacing values', () => {
      expect(theme.spacing.section).toBe('2rem')
      expect(theme.spacing.component).toBe('1rem')
      expect(theme.spacing.element).toBe('0.5rem')
    })

    it('should have layout spacing scale', () => {
      const layoutSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const
      
      layoutSizes.forEach(size => {
        expect(theme.spacing.layout[size]).toBeDefined()
      })
    })
  })

  describe('Animation System', () => {
    it('should have proper duration values', () => {
      expect(theme.animations.duration.fast).toBe('150ms')
      expect(theme.animations.duration.normal).toBe('200ms')
      expect(theme.animations.duration.slow).toBe('300ms')
    })

    it('should have easing functions', () => {
      expect(theme.animations.easing.easeOut).toBe('cubic-bezier(0, 0, 0.2, 1)')
      expect(theme.animations.easing.easeIn).toBe('cubic-bezier(0.4, 0, 1, 1)')
    })

    it('should have animation presets', () => {
      expect(theme.animations.presets.fadeIn).toContain('fadeIn')
      expect(theme.animations.presets.slideUp).toContain('slideUp')
    })
  })

  describe('Border Radius System', () => {
    it('should have consistent border radius values', () => {
      expect(theme.borderRadius.lg).toBe('0.5rem')
      expect(theme.borderRadius.default).toBe('0.25rem')
      expect(theme.borderRadius.full).toBe('9999px')
    })
  })

  describe('Z-Index System', () => {
    it('should have proper layering hierarchy', () => {
      expect(theme.zIndex.modal).toBeGreaterThan(theme.zIndex.overlay)
      expect(theme.zIndex.tooltip).toBeGreaterThan(theme.zIndex.modal)
      expect(theme.zIndex.toast).toBeGreaterThan(theme.zIndex.tooltip)
    })
  })
})

describe('Theme Utilities', () => {
  describe('withOpacity', () => {
    it('should add opacity to HSL color', () => {
      const color = 'hsl(240, 10%, 3.9%)'
      const result = themeUtils.withOpacity(color, 0.5)
      expect(result).toContain('0.5')
    })
  })

  describe('focusRing', () => {
    it('should generate focus ring styles', () => {
      const focusStyles = themeUtils.focusRing()
      expect(focusStyles).toHaveProperty('outline', 'none')
      expect(focusStyles).toHaveProperty('boxShadow')
    })

    it('should accept custom color', () => {
      const customColor = theme.colors.borders.emphasis
      const focusStyles = themeUtils.focusRing(customColor)
      expect(focusStyles.boxShadow).toContain(customColor)
    })
  })

  describe('surface', () => {
    it('should generate base surface styles', () => {
      const surfaceStyles = themeUtils.surface('base')
      expect(surfaceStyles).toHaveProperty('backgroundColor')
      expect(surfaceStyles).toHaveProperty('border')
    })

    it('should generate elevated surface styles', () => {
      const surfaceStyles = themeUtils.surface('elevated')
      expect(surfaceStyles).toHaveProperty('boxShadow')
    })

    it('should generate interactive surface styles', () => {
      const surfaceStyles = themeUtils.surface('interactive')
      expect(surfaceStyles).toHaveProperty('transition')
      expect(surfaceStyles).toHaveProperty('&:hover')
    })
  })

  describe('status', () => {
    it('should generate status styles for all types', () => {
      const statusTypes = ['success', 'warning', 'error', 'info'] as const
      
      statusTypes.forEach(type => {
        const statusStyles = themeUtils.status(type)
        expect(statusStyles).toHaveProperty('backgroundColor')
        expect(statusStyles).toHaveProperty('color')
        expect(statusStyles).toHaveProperty('border')
      })
    })
  })
})

describe('Exported Theme Sections', () => {
  it('should export individual theme sections', () => {
    expect(colors).toBe(theme.colors)
    expect(typography).toBe(theme.typography)
    expect(spacing).toBe(theme.spacing)
    expect(animations).toBe(theme.animations)
  })
})

describe('Theme Consistency', () => {
  it('should maintain consistent color format (HSL)', () => {
    const colorValues = [
      theme.colors.background.primary,
      theme.colors.text.primary,
      theme.colors.interactive.accent,
    ]
    
    colorValues.forEach(color => {
      expect(color).toMatch(/^hsl\(\d+,\s*\d+%,\s*[\d.]+%\)$/)
    })
  })

  it('should have consistent spacing units', () => {
    const spacingValues = Object.values(theme.spacing.layout)
    
    spacingValues.forEach(value => {
      expect(value).toMatch(/^\d+(\.\d+)?rem$/)
    })
  })

  it('should have consistent animation durations', () => {
    const durationValues = Object.values(theme.animations.duration)
    
    durationValues.forEach(duration => {
      expect(duration).toMatch(/^\d+ms$/)
    })
  })
}) 