/**
 * Analytics integration for Google Analytics 4
 *
 * This module provides a centralized way to track user interactions
 * with placeholder configuration for easy setup.
 */

/**
 * Analytics event names used throughout the application
 */
export const ANALYTICS_EVENTS = {
  /** User viewed a course */
  COURSE_VIEW: 'course_view',
  /** User completed a lesson within a course */
  COURSE_LESSON_COMPLETE: 'course_lesson_complete',
  /** User clicked a purchase button */
  PURCHASE_CLICK: 'purchase_click',
  /** User earned a certificate */
  CERTIFICATE_EARNED: 'certificate_earned',
  /** User completed a quiz */
  QUIZ_COMPLETE: 'quiz_complete',
  /** User performed a search */
  SEARCH: 'search',
} as const

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

/**
 * Common event parameters
 */
export interface EventParams {
  /** Course identifier */
  course_id?: string
  /** Course name */
  course_name?: string
  /** Lesson identifier */
  lesson_id?: string
  /** Lesson name */
  lesson_name?: string
  /** Quiz score (0-100) */
  quiz_score?: number
  /** Search query */
  search_term?: string
  /** Certificate identifier */
  certificate_id?: string
  /** Custom parameters */
  [key: string]: string | number | undefined
}

/**
 * Initialize Google Analytics
 * Call this once when the application starts
 */
export function initAnalytics(): void {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

  // Skip if no measurement ID configured
  if (!measurementId || measurementId === 'YOUR_GA_MEASUREMENT_ID_HERE') {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Skipped initialization - no measurement ID configured')
    }
    return
  }

  // Load gtag.js script dynamically
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }

  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    send_page_view: false, // We'll handle page views manually
  })

  if (import.meta.env.DEV) {
    console.log(`[Analytics] Initialized with measurement ID: ${measurementId}`)
  }
}

/**
 * Track a page view
 * @param path - The page path to track (e.g., '/courses/transformer')
 */
export function trackPageView(path: string): void {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

  if (!measurementId || measurementId === 'YOUR_GA_MEASUREMENT_ID_HERE') {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Page view (not configured): ${path}`)
    }
    return
  }

  if (typeof window.gtag === 'function') {
    window.gtag('config', measurementId, {
      page_path: path,
    })

    if (import.meta.env.DEV) {
      console.log(`[Analytics] Page view: ${path}`)
    }
  }
}

/**
 * Track a custom event
 * @param eventName - The event name from ANALYTICS_EVENTS
 * @param params - Event parameters
 */
export function trackEvent(eventName: AnalyticsEventName, params?: EventParams): void {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

  if (!measurementId || measurementId === 'YOUR_GA_MEASUREMENT_ID_HERE') {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event (not configured): ${eventName}`, params)
    }
    return
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)

    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event: ${eventName}`, params)
    }
  }
}

/**
 * Type declarations for Google Analytics global objects
 */
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}