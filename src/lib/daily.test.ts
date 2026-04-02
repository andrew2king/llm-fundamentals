import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getLatestDaily, getDailyByDate, formatDate, getRelativeTime } from '@/lib/daily'

// Mock fetchWithRetry
vi.mock('@/lib/fetchWithRetry', () => ({
  fetchWithRetry: vi.fn(),
}))

// Mock the embedded daily data
vi.mock('@/data/daily', () => ({
  dailyData: {
    date: '2024-01-01',
    title: 'Embedded Daily News',
    summary: 'This is embedded data',
    news: [],
    papers: [],
  },
}))

import { fetchWithRetry } from '@/lib/fetchWithRetry'

const mockFetchWithRetry = vi.mocked(fetchWithRetry)

describe('daily utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getLatestDaily', () => {
    it('should return today data when available', async () => {
      const today = new Date().toISOString().split('T')[0]
      const mockData = {
        date: today,
        title: 'Today News',
        summary: 'Summary',
        news: [],
        papers: [],
      }

      mockFetchWithRetry.mockResolvedValueOnce({
        success: true,
        data: mockData,
        error: null,
        retryCount: 0,
        isNetworkError: false,
      })

      const result = await getLatestDaily()

      expect(result).toEqual(mockData)
      expect(mockFetchWithRetry).toHaveBeenCalledWith(
        `/data/daily/${today}.json`,
        expect.objectContaining({ cache: 'no-store' })
      )
    })

    it('should fallback to previous days when today is not available', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      const yesterdayData = {
        date: yesterday,
        title: 'Yesterday News',
        summary: 'Summary',
        news: [],
        papers: [],
      }

      // Today fails
      mockFetchWithRetry.mockResolvedValueOnce({
        success: false,
        data: null,
        error: new Error('Not found'),
        retryCount: 0,
        isNetworkError: false,
      })

      // Yesterday succeeds
      mockFetchWithRetry.mockResolvedValueOnce({
        success: true,
        data: yesterdayData,
        error: null,
        retryCount: 0,
        isNetworkError: false,
      })

      const result = await getLatestDaily()

      expect(result).toEqual(yesterdayData)
    })

    it('should return embedded data when all fetches fail', async () => {
      // All fetches fail
      mockFetchWithRetry.mockResolvedValue({
        success: false,
        data: null,
        error: new Error('Not found'),
        retryCount: 0,
        isNetworkError: false,
      })

      const result = await getLatestDaily()

      expect(result).toEqual({
        date: '2024-01-01',
        title: 'Embedded Daily News',
        summary: 'This is embedded data',
        news: [],
        papers: [],
      })
    })

    it('should return embedded data on unexpected error', async () => {
      mockFetchWithRetry.mockRejectedValue(new Error('Unexpected error'))

      const result = await getLatestDaily()

      expect(result).toEqual({
        date: '2024-01-01',
        title: 'Embedded Daily News',
        summary: 'This is embedded data',
        news: [],
        papers: [],
      })
    })
  })

  describe('getDailyByDate', () => {
    it('should return data for specific date', async () => {
      const mockData = {
        date: '2024-01-15',
        title: 'Jan 15 News',
        summary: 'Summary',
        news: [],
        papers: [],
      }

      mockFetchWithRetry.mockResolvedValueOnce({
        success: true,
        data: mockData,
        error: null,
        retryCount: 0,
        isNetworkError: false,
      })

      const result = await getDailyByDate('2024-01-15')

      expect(result).toEqual(mockData)
      expect(mockFetchWithRetry).toHaveBeenCalledWith(
        '/data/daily/2024-01-15.json',
        expect.objectContaining({ maxRetries: 2, cache: 'no-store' })
      )
    })

    it('should return null when fetch fails', async () => {
      mockFetchWithRetry.mockResolvedValueOnce({
        success: false,
        data: null,
        error: new Error('Not found'),
        retryCount: 2,
        isNetworkError: false,
      })

      const result = await getDailyByDate('2024-01-15')

      expect(result).toBeNull()
    })
  })

  describe('formatDate', () => {
    it('should format date in Chinese locale', () => {
      const result = formatDate('2024-01-15')

      // The exact format depends on the locale, but should contain year, month, day
      expect(result).toContain('2024')
      expect(result).toContain('15')
    })

    it('should handle different date formats', () => {
      // ISO format
      expect(() => formatDate('2024-01-15')).not.toThrow()
      // With time
      expect(() => formatDate('2024-01-15T10:30:00Z')).not.toThrow()
    })
  })

  describe('getRelativeTime', () => {
    it('should return "今天" for today', () => {
      const today = new Date().toISOString().split('T')[0]

      const result = getRelativeTime(today)

      expect(result).toBe('今天')
    })

    it('should return "昨天" for yesterday', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      const result = getRelativeTime(yesterday)

      expect(result).toBe('昨天')
    })

    it('should return "X天前" for days within a week', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]

      const result = getRelativeTime(threeDaysAgo)

      expect(result).toBe('3天前')
    })

    it('should return formatted date for days over a week ago', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0]

      const result = getRelativeTime(tenDaysAgo)

      // Should return the formatted date, not relative time
      expect(result).toContain('202') // Year
    })
  })
})