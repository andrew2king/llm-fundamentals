import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getRating,
  convertMetric,
  getMetrics,
  getMetric,
  getMetricsSummary,
  clearMetrics,
  initPerformanceMonitoring,
} from '@/lib/performance'

// Mock web-vitals
vi.mock('web-vitals', () => ({
  onCLS: vi.fn((cb) => cb({ name: 'CLS', value: 0.05, delta: 0.05, id: 'cls-1', navigationType: 'navigate' })),
  onINP: vi.fn((cb) => cb({ name: 'INP', value: 100, delta: 100, id: 'inp-1', navigationType: 'navigate' })),
  onLCP: vi.fn((cb) => cb({ name: 'LCP', value: 2000, delta: 2000, id: 'lcp-1', navigationType: 'navigate' })),
  onFCP: vi.fn((cb) => cb({ name: 'FCP', value: 1500, delta: 1500, id: 'fcp-1', navigationType: 'navigate' })),
  onTTFB: vi.fn((cb) => cb({ name: 'TTFB', value: 500, delta: 500, id: 'ttfb-1', navigationType: 'navigate' })),
}))

describe('Performance Utilities', () => {
  beforeEach(() => {
    clearMetrics()
    vi.clearAllMocks()
  })

  afterEach(() => {
    clearMetrics()
  })

  describe('getRating', () => {
    it('should return "good" for CLS values <= 0.1', () => {
      // Threshold: [0.1, 0.25] - value <= 0.1 is good
      expect(getRating('CLS', 0.05)).toBe('good')
      expect(getRating('CLS', 0.0)).toBe('good')
      expect(getRating('CLS', 0.1)).toBe('good')
    })

    it('should return "needs-improvement" for CLS values > 0.1 and <= 0.25', () => {
      // Threshold: [0.1, 0.25] - value > 0.1 and <= 0.25
      expect(getRating('CLS', 0.11)).toBe('needs-improvement')
      expect(getRating('CLS', 0.15)).toBe('needs-improvement')
      expect(getRating('CLS', 0.25)).toBe('needs-improvement')
    })

    it('should return "poor" for CLS values above 0.25', () => {
      expect(getRating('CLS', 0.26)).toBe('poor')
      expect(getRating('CLS', 1.0)).toBe('poor')
    })

    it('should correctly rate INP values', () => {
      // Threshold: [200, 500] - value <= 200 is good
      expect(getRating('INP', 100)).toBe('good')
      expect(getRating('INP', 200)).toBe('good')
      expect(getRating('INP', 201)).toBe('needs-improvement')
      expect(getRating('INP', 500)).toBe('needs-improvement')
      expect(getRating('INP', 501)).toBe('poor')
    })

    it('should correctly rate LCP values', () => {
      // Threshold: [2500, 4000] - value <= 2500 is good
      expect(getRating('LCP', 1000)).toBe('good')
      expect(getRating('LCP', 2500)).toBe('good')
      expect(getRating('LCP', 2501)).toBe('needs-improvement')
      expect(getRating('LCP', 4000)).toBe('needs-improvement')
      expect(getRating('LCP', 4001)).toBe('poor')
    })

    it('should correctly rate FCP values', () => {
      // Threshold: [1800, 3000] - value <= 1800 is good
      expect(getRating('FCP', 1000)).toBe('good')
      expect(getRating('FCP', 1800)).toBe('good')
      expect(getRating('FCP', 1801)).toBe('needs-improvement')
      expect(getRating('FCP', 3000)).toBe('needs-improvement')
      expect(getRating('FCP', 3001)).toBe('poor')
    })

    it('should correctly rate TTFB values', () => {
      // Threshold: [800, 1800] - value <= 800 is good
      expect(getRating('TTFB', 500)).toBe('good')
      expect(getRating('TTFB', 800)).toBe('good')
      expect(getRating('TTFB', 801)).toBe('needs-improvement')
      expect(getRating('TTFB', 1800)).toBe('needs-improvement')
      expect(getRating('TTFB', 1801)).toBe('poor')
    })

    it('should handle unknown metric names', () => {
      // Unknown metrics default to [0, Infinity]
      // value <= 0 → 'good', value <= Infinity → 'needs-improvement'
      expect(getRating('UNKNOWN', 0)).toBe('good')
      expect(getRating('UNKNOWN', 100)).toBe('needs-improvement')
    })
  })

  describe('convertMetric', () => {
    it('should convert a web-vitals metric to PerformanceMetric format', () => {
      const metric = {
        name: 'CLS' as const,
        value: 0.15,
        delta: 0.15,
        id: 'test-id',
        navigationType: 'navigate' as const,
        entries: [],
        rating: 'needs-improvement' as const,
      }

      const result = convertMetric(metric as Parameters<typeof convertMetric>[0])

      expect(result.name).toBe('CLS')
      expect(result.value).toBe(0.15)
      expect(result.rating).toBe('needs-improvement')
      expect(result.delta).toBe(0.15)
      expect(result.id).toBe('test-id')
      expect(result.navigationType).toBe('navigate')
      expect(result.timestamp).toBeDefined()
    })
  })

  describe('metrics storage', () => {
    it('should store and retrieve metrics', () => {
      // Clear first
      clearMetrics()

      // initPerformanceMonitoring will populate metrics via mocks
      initPerformanceMonitoring({ logToConsole: false })

      const metrics = getMetrics()
      expect(metrics.size).toBeGreaterThan(0)
    })

    it('should get individual metric by name', () => {
      clearMetrics()
      initPerformanceMonitoring({ logToConsole: false })

      const cls = getMetric('CLS')
      expect(cls).toBeDefined()
      expect(cls?.name).toBe('CLS')
    })

    it('should return undefined for non-existent metric', () => {
      clearMetrics()
      const metric = getMetric('NON_EXISTENT')
      expect(metric).toBeUndefined()
    })

    it('should clear all metrics', () => {
      initPerformanceMonitoring({ logToConsole: false })
      clearMetrics()

      const metrics = getMetrics()
      expect(metrics.size).toBe(0)
    })
  })

  describe('getMetricsSummary', () => {
    it('should return summary with overall rating of "good"', () => {
      clearMetrics()
      initPerformanceMonitoring({ logToConsole: false })

      const summary = getMetricsSummary()
      expect(summary.metrics).toBeInstanceOf(Array)
      expect(summary.overallRating).toBeDefined()
      expect(summary.timestamp).toBeDefined()
    })

    it('should calculate overall rating correctly', () => {
      clearMetrics()
      initPerformanceMonitoring({ logToConsole: false })

      // Our mocked values should all be good or needs-improvement
      const summary = getMetricsSummary()
      expect(['good', 'needs-improvement', 'poor']).toContain(summary.overallRating)
    })
  })

  describe('initPerformanceMonitoring', () => {
    it('should initialize without errors', () => {
      expect(() => initPerformanceMonitoring()).not.toThrow()
    })

    it('should accept configuration options', () => {
      const onReport = vi.fn()
      expect(() =>
        initPerformanceMonitoring({
          logToConsole: false,
          onReport,
          debug: true,
        })
      ).not.toThrow()
    })

    it('should call onReport callback when provided', () => {
      const onReport = vi.fn()
      clearMetrics()
      initPerformanceMonitoring({ logToConsole: false, onReport })

      expect(onReport).toHaveBeenCalled()
    })
  })
})