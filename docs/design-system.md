# Craft Design System

## Overview

The Craft design system is built with calm, professional aesthetics that reduce cognitive load for creative agency project management. Our design philosophy centers on creating an environment that allows users to focus on their work without visual distractions or mental fatigue.

## Design Principles

### 1. Cognitive Load Reduction
- **Subtle Contrasts**: Use gentle color differences to create hierarchy without harsh visual breaks
- **Consistent Patterns**: Establish predictable layouts and interactions to reduce mental processing
- **Progressive Disclosure**: Show only essential information at each level, with details available on demand
- **Visual Breathing Room**: Generous spacing prevents visual crowding and mental overwhelm

### 2. Professional Aesthetics
- **Sophisticated Color Palette**: Deep, calming dark theme optimized for long work sessions
- **Typography Hierarchy**: Clear information architecture through consistent font sizing and weights
- **Refined Interactions**: Smooth, natural animations that feel responsive without being distracting
- **Quality Materials**: Elevated surfaces and subtle shadows create depth and premium feel

### 3. Accessibility First
- **High Contrast Text**: Ensures readability for all users
- **Focus Management**: Clear focus indicators for keyboard navigation
- **Reduced Motion Support**: Respects user preferences for motion sensitivity
- **Screen Reader Friendly**: Semantic HTML and proper ARIA labels

### 4. Responsive by Design
- **Mobile-First Approach**: Optimized for all screen sizes and touch interactions
- **Flexible Layouts**: Components adapt gracefully to different viewport sizes
- **Touch-Friendly**: Adequate touch targets and gesture support

## Color System

### Background Colors
Our background system creates depth through subtle layering:

```css
--background-primary: hsl(240, 10%, 3.9%)    /* #0f0f10 - Main background */
--background-secondary: hsl(240, 3.7%, 15.9%) /* Elevated surfaces */
--background-tertiary: hsl(240, 3.7%, 18%)    /* Interactive hover states */
```

### Text Hierarchy
Text colors create clear information hierarchy:

```css
--text-primary: hsl(0, 0%, 98%)      /* High contrast for important content */
--text-secondary: hsl(0, 0%, 63.9%)  /* Supporting information */
--text-muted: hsl(0, 0%, 45%)        /* Subtle details and metadata */
```

### Status Colors
Carefully chosen for accessibility and emotional response:

- **Success**: `hsl(142, 76%, 36%)` - Calming green for positive actions
- **Warning**: `hsl(38, 92%, 50%)` - Attention-grabbing amber for caution
- **Error**: `hsl(0, 62.8%, 30.6%)` - Subdued red to avoid alarm
- **Info**: `hsl(217, 91%, 60%)` - Trustworthy blue for information

## Typography

### Font Stack
```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

Inter is chosen for its excellent readability and professional appearance. Font features are optimized for better character shapes:
```css
font-feature-settings: "cv02", "cv03", "cv04", "cv11";
```

### Type Scale
Our type scale creates clear hierarchy while maintaining readability:

| Size | Usage | CSS Class |
|------|-------|-----------|
| 2xl (24px) | Page titles | `.text-hierarchy-1` |
| xl (20px) | Section headers | `.text-hierarchy-2` |
| lg (18px) | Subsection headers | `.text-hierarchy-3` |
| sm (14px) | Body text | `.text-body` |
| xs (12px) | Captions, metadata | `.text-caption` |

## Spacing System

Based on a 4px grid system for mathematical consistency:

### Semantic Spacing
- **Section**: `2rem` (32px) - Between major page sections
- **Component**: `1rem` (16px) - Between related components
- **Element**: `0.5rem` (8px) - Between related elements
- **Tight**: `0.25rem` (4px) - Minimal spacing

### Layout Spacing
- **xs**: `0.5rem` (8px)
- **sm**: `1rem` (16px)
- **md**: `1.5rem` (24px)
- **lg**: `2rem` (32px)
- **xl**: `3rem` (48px)
- **2xl**: `4rem` (64px)

## Component Patterns

### Surface Elevation
Create depth through subtle elevation:

```tsx
// Base surface
<div className="surface-elevated">Content</div>

// Interactive surface
<div className="surface-interactive">Clickable content</div>
```

### Status Indicators
Consistent status communication:

```tsx
<div className="status-success">Success message</div>
<div className="status-warning">Warning message</div>
<div className="status-error">Error message</div>
<div className="status-info">Information message</div>
```

### Focus Management
Consistent focus indicators:

```tsx
<button className="focus-ring">Accessible button</button>
```

## Animation Guidelines

### Duration
- **Fast**: 150ms - Micro-interactions (hover states)
- **Normal**: 200ms - Standard transitions
- **Slow**: 300ms - Complex state changes
- **Slower**: 500ms - Page transitions

### Easing
- **Ease Out**: `cubic-bezier(0, 0, 0.2, 1)` - Entering animations
- **Ease In**: `cubic-bezier(0.4, 0, 1, 1)` - Exiting animations
- **Ease In Out**: `cubic-bezier(0.4, 0, 0.2, 1)` - Bidirectional animations

### Common Animations
```css
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
.animate-slide-up { animation: slideUp 0.3s ease-out; }
.animate-scale-in { animation: scaleIn 0.2s ease-out; }
```

## Usage Guidelines

### Theme Provider Setup
Wrap your application with the theme provider:

```tsx
import { ThemeProvider } from '@/components/providers/ThemeProvider'

export default function App({ children }) {
  return (
    <ThemeProvider defaultTheme="dark">
      {children}
    </ThemeProvider>
  )
}
```

### Using Theme in Components
Access theme values and utilities:

```tsx
import { useTheme } from '@/components/providers/ThemeProvider'

export function MyComponent() {
  const { theme, utils, isDark } = useTheme()
  
  return (
    <div 
      className="surface-elevated spacing-component"
      style={utils.surface('elevated')}
    >
      <h2 className="text-hierarchy-2">Section Title</h2>
      <p className="text-body">Body content with proper hierarchy.</p>
    </div>
  )
}
```

### CSS Custom Properties
Use theme values in CSS:

```css
.custom-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border-radius: var(--radius);
  padding: var(--spacing-component);
}
```

## Responsive Breakpoints

```css
/* Mobile first approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## Accessibility Features

### Focus Management
- Visible focus indicators on all interactive elements
- Logical tab order throughout the interface
- Skip links for keyboard navigation

### Color Contrast
- All text meets WCAG AA contrast requirements
- Status colors are distinguishable by more than color alone
- High contrast mode support

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Best Practices

### Do's
- ✅ Use semantic spacing classes (`spacing-component`, `spacing-element`)
- ✅ Apply consistent typography hierarchy
- ✅ Use status colors for appropriate feedback
- ✅ Implement proper focus management
- ✅ Test with keyboard navigation
- ✅ Respect user motion preferences

### Don'ts
- ❌ Use arbitrary spacing values
- ❌ Mix different typography scales
- ❌ Overuse bright or saturated colors
- ❌ Create animations longer than 500ms
- ❌ Ignore accessibility requirements
- ❌ Use color as the only way to convey information

## Component Library Integration

This design system works seamlessly with shadcn/ui components. The CSS variables are automatically applied to all shadcn/ui components, ensuring consistent theming throughout the application.

### Example with shadcn/ui
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ThemedCard() {
  return (
    <Card className="surface-elevated">
      <CardHeader>
        <CardTitle className="text-hierarchy-2">Card Title</CardTitle>
      </CardHeader>
      <CardContent className="spacing-component">
        <p className="text-body">Card content with proper theming.</p>
        <Button className="mt-4">Themed Button</Button>
      </CardContent>
    </Card>
  )
}
```

This design system provides a solid foundation for building calm, professional interfaces that reduce cognitive load while maintaining visual appeal and accessibility. 