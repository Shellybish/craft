'use client'

import React from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * Demo component showcasing the foundational UI theme
 * This demonstrates the calm, professional aesthetics and cognitive load reduction principles
 */
export function ThemeDemo() {
  const { theme, isDark, toggleTheme } = useTheme()

  return (
    <div className="spacing-section max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-hierarchy-1 mb-2">Craft Design System Demo</h1>
        <p className="text-body text-muted-foreground mb-4">
          Showcasing calm, professional aesthetics that reduce cognitive load
        </p>
        <Button onClick={toggleTheme} variant="outline" size="sm">
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </Button>
      </div>

      {/* Typography Hierarchy */}
      <Card className="surface-elevated mb-6">
        <CardHeader>
          <CardTitle className="text-hierarchy-2">Typography Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="spacing-component space-y-4">
          <div>
            <h1 className="text-hierarchy-1">Heading 1 - Page Titles</h1>
            <h2 className="text-hierarchy-2">Heading 2 - Section Headers</h2>
            <h3 className="text-hierarchy-3">Heading 3 - Subsection Headers</h3>
            <p className="text-body">Body text - Main content with proper line height and spacing for optimal readability.</p>
            <p className="text-caption">Caption text - Metadata and subtle details</p>
          </div>
        </CardContent>
      </Card>

      {/* Color System */}
      <Card className="surface-elevated mb-6">
        <CardHeader>
          <CardTitle className="text-hierarchy-2">Color System</CardTitle>
        </CardHeader>
        <CardContent className="spacing-component">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Background Colors */}
            <div>
              <h3 className="text-hierarchy-3 mb-3">Background Layers</h3>
              <div className="space-y-2">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <span className="text-caption">Primary Background</span>
                </div>
                <div className="p-4 rounded-lg surface-elevated">
                  <span className="text-caption">Elevated Surface</span>
                </div>
                <div className="p-4 rounded-lg surface-interactive cursor-pointer">
                  <span className="text-caption">Interactive Surface (hover me)</span>
                </div>
              </div>
            </div>

            {/* Text Colors */}
            <div>
              <h3 className="text-hierarchy-3 mb-3">Text Hierarchy</h3>
              <div className="space-y-2">
                <p className="text-foreground">Primary text - High contrast</p>
                <p className="text-muted-foreground">Secondary text - Supporting info</p>
                <p className="text-muted-foreground/70">Muted text - Subtle details</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Colors */}
      <Card className="surface-elevated mb-6">
        <CardHeader>
          <CardTitle className="text-hierarchy-2">Status & Feedback</CardTitle>
        </CardHeader>
        <CardContent className="spacing-component">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="status-success p-3 rounded-lg">
              <Badge variant="secondary" className="mb-2">Success</Badge>
              <p className="text-sm">Task completed successfully</p>
            </div>
            <div className="status-warning p-3 rounded-lg">
              <Badge variant="secondary" className="mb-2">Warning</Badge>
              <p className="text-sm">Attention required</p>
            </div>
            <div className="status-error p-3 rounded-lg">
              <Badge variant="secondary" className="mb-2">Error</Badge>
              <p className="text-sm">Something went wrong</p>
            </div>
            <div className="status-info p-3 rounded-lg">
              <Badge variant="secondary" className="mb-2">Info</Badge>
              <p className="text-sm">Additional information</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacing System */}
      <Card className="surface-elevated mb-6">
        <CardHeader>
          <CardTitle className="text-hierarchy-2">Spacing System</CardTitle>
        </CardHeader>
        <CardContent className="spacing-component">
          <div className="space-y-4">
            <div>
              <h3 className="text-hierarchy-3 mb-3">Semantic Spacing</h3>
              <div className="space-y-2">
                <div className="bg-accent/20 p-2 rounded">
                  <span className="text-caption">Element spacing (0.5rem)</span>
                </div>
                <div className="bg-accent/20 p-4 rounded">
                  <span className="text-caption">Component spacing (1rem)</span>
                </div>
                <div className="bg-accent/20 p-8 rounded">
                  <span className="text-caption">Section spacing (2rem)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Elements */}
      <Card className="surface-elevated mb-6">
        <CardHeader>
          <CardTitle className="text-hierarchy-2">Interactive Elements</CardTitle>
        </CardHeader>
        <CardContent className="spacing-component">
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Action</Button>
          </div>
        </CardContent>
      </Card>

      {/* Animations */}
      <Card className="surface-elevated mb-6">
        <CardHeader>
          <CardTitle className="text-hierarchy-2">Smooth Animations</CardTitle>
        </CardHeader>
        <CardContent className="spacing-component">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="animate-fade-in p-4 surface-elevated rounded-lg text-center">
              <span className="text-caption">Fade In</span>
            </div>
            <div className="animate-slide-up p-4 surface-elevated rounded-lg text-center">
              <span className="text-caption">Slide Up</span>
            </div>
            <div className="animate-scale-in p-4 surface-elevated rounded-lg text-center">
              <span className="text-caption">Scale In</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Features */}
      <Card className="surface-elevated">
        <CardHeader>
          <CardTitle className="text-hierarchy-2">Accessibility Features</CardTitle>
        </CardHeader>
        <CardContent className="spacing-component">
          <div className="space-y-4">
            <div>
              <h3 className="text-hierarchy-3 mb-2">Focus Management</h3>
              <div className="flex gap-2">
                <Button className="focus-ring">Focusable Button 1</Button>
                <Button className="focus-ring">Focusable Button 2</Button>
                <Button className="focus-ring">Focusable Button 3</Button>
              </div>
              <p className="text-caption mt-2">Try tabbing through these buttons to see focus indicators</p>
            </div>
            
            <div>
              <h3 className="text-hierarchy-3 mb-2">High Contrast Text</h3>
              <p className="text-body">
                All text meets WCAG AA contrast requirements for accessibility. 
                The color system is designed to be readable for users with various visual needs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-caption">
          This design system creates calm, professional interfaces that reduce cognitive load
          while maintaining visual appeal and accessibility.
        </p>
      </div>
    </div>
  )
}

export default ThemeDemo 