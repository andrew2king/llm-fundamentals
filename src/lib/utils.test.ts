import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn (className utility)', () => {
  it('should merge class names correctly', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const condition = false;
    const result = cn('foo', condition && 'bar', 'baz')
    expect(result).toBe('foo baz')
  })

  it('should handle undefined and null values', () => {
    const result = cn('foo', undefined, null, 'bar')
    expect(result).toBe('foo bar')
  })

  it('should merge tailwind classes correctly', () => {
    // tailwind-merge should deduplicate conflicting classes
    const result = cn('p-4', 'p-2')
    expect(result).toBe('p-2')
  })

  it('should handle object syntax for conditional classes', () => {
    const result = cn({
      foo: true,
      bar: false,
      baz: true,
    })
    expect(result).toBe('foo baz')
  })

  it('should handle array of classes', () => {
    const result = cn(['foo', 'bar'], 'baz')
    expect(result).toBe('foo bar baz')
  })

  it('should merge conflicting tailwind utilities correctly', () => {
    // Later classes should override earlier ones
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('should preserve non-conflicting classes', () => {
    const result = cn('p-4', 'm-2', 'text-center')
    expect(result).toBe('p-4 m-2 text-center')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle complex tailwind class combinations', () => {
    const result = cn(
      'px-4 py-2 rounded-lg',
      'bg-blue-500 hover:bg-blue-600',
      'px-6' // Should override px-4
    )
    expect(result).toContain('px-6')
    expect(result).not.toContain('px-4')
    expect(result).toContain('py-2')
    expect(result).toContain('rounded-lg')
  })
})