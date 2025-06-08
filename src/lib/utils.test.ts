import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-100')
    expect(result).toBe('text-red-500 bg-blue-100')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class', !isActive && 'inactive-class')
    expect(result).toBe('base-class active-class')
  })

  it('should resolve Tailwind conflicts', () => {
    // twMerge should resolve conflicting Tailwind classes
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['text-sm', 'font-bold'], 'text-center')
    expect(result).toBe('text-sm font-bold text-center')
  })

  it('should handle objects with conditional classes', () => {
    const result = cn({
      'text-red-500': true,
      'bg-blue-100': false,
      'font-bold': true,
    })
    expect(result).toBe('text-red-500 font-bold')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
    expect(cn(null, undefined, false)).toBe('')
  })

  it('should handle mixed input types', () => {
    const result = cn(
      'base',
      ['array-class'],
      { 'object-class': true, 'false-class': false },
      true && 'conditional-class',
      'final-class'
    )
    expect(result).toBe('base array-class object-class conditional-class final-class')
  })
}) 