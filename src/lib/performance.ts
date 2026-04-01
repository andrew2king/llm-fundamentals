/**
 * Performance Monitoring Utilities
 *
 * Collects Web Vitals metrics (CLS, INP, LCP, FCP, TTFB) and provides
 * console logging and optional reporting functionality.
 */

import {
  onCLS,
  onINP,
  onLCP,
  onFCP,
  onTTFB,
  type CLSMetric,
  type INPMetric,
  type LCPMetric,
  type FCPMetric,
  type TTFBMetric,
} from 'web-vitals';

/**
 * Performance metric data structure
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
}

/**
 * Performance report configuration
 */
export interface PerformanceConfig {
  /** Enable console logging (default: true in development) */
  logToConsole?: boolean;
  /** Custom reporting endpoint URL */
  reportUrl?: string;
  /** Custom report function */
  onReport?: (metric: PerformanceMetric) => void;
  /** Debug mode for verbose logging */
  debug?: boolean;
}

// Store collected metrics
const collectedMetrics: Map<string, PerformanceMetric> = new Map();

/**
 * Get rating based on metric name and value
 */
export function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    CLS: [0.1, 0.25],      // Good: <0.1, Needs improvement: 0.1-0.25, Poor: >0.25
    INP: [200, 500],       // Good: <200ms, Needs improvement: 200-500ms, Poor: >500ms
    LCP: [2500, 4000],     // Good: <2.5s, Needs improvement: 2.5s-4s, Poor: >4s
    FCP: [1800, 3000],     // Good: <1.8s, Needs improvement: 1.8s-3s, Poor: >3s
    TTFB: [800, 1800],     // Good: <800ms, Needs improvement: 800ms-1.8s, Poor: >1.8s
  };

  const [good, poor] = thresholds[name] || [0, Infinity];

  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Convert web-vitals metric to our PerformanceMetric format
 */
export function convertMetric(
  metric: CLSMetric | INPMetric | LCPMetric | FCPMetric | TTFBMetric
): PerformanceMetric {
  return {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
  };
}

/**
 * Log metric to console with color coding
 */
function logMetric(metric: PerformanceMetric): void {
  const colors: Record<string, string> = {
    good: '\x1b[32m',      // Green
    'needs-improvement': '\x1b[33m', // Yellow
    poor: '\x1b[31m',      // Red
  };
  const reset = '\x1b[0m';
  const color = colors[metric.rating];

  // Format value based on metric type
  let formattedValue: string;
  if (metric.name === 'CLS') {
    formattedValue = metric.value.toFixed(3);
  } else {
    formattedValue = metric.value < 1000
      ? `${metric.value.toFixed(0)}ms`
      : `${(metric.value / 1000).toFixed(2)}s`;
  }

  console.log(
    `${color}[Performance] ${metric.name}: ${formattedValue} (${metric.rating})${reset}`,
    {
      id: metric.id,
      delta: metric.delta,
      navigationType: metric.navigationType,
    }
  );
}

/**
 * Send metric to reporting endpoint
 */
async function reportMetric(
  metric: PerformanceMetric,
  reportUrl: string
): Promise<void> {
  try {
    const beaconData = new Blob([JSON.stringify(metric)], {
      type: 'application/json',
    });

    // Use sendBeacon for reliability during page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(reportUrl, beaconData);
    } else {
      // Fallback to fetch for browsers without sendBeacon
      await fetch(reportUrl, {
        method: 'POST',
        body: JSON.stringify(metric),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      });
    }
  } catch (error) {
    console.error('[Performance] Failed to report metric:', error);
  }
}

/**
 * Handle metric collection
 */
function handleMetric(
  metric: CLSMetric | INPMetric | LCPMetric | FCPMetric | TTFBMetric,
  config: PerformanceConfig
): void {
  const performanceMetric = convertMetric(metric);

  // Store metric
  collectedMetrics.set(metric.name, performanceMetric);

  // Log to console if enabled
  if (config.logToConsole !== false) {
    logMetric(performanceMetric);
  }

  // Custom callback
  if (config.onReport) {
    config.onReport(performanceMetric);
  }

  // Send to reporting endpoint
  if (config.reportUrl) {
    reportMetric(performanceMetric, config.reportUrl);
  }
}

/**
 * Initialize performance monitoring
 *
 * @param config - Configuration options for performance monitoring
 *
 * @example
 * ```ts
 * // Basic usage
 * initPerformanceMonitoring();
 *
 * // With custom reporting
 * initPerformanceMonitoring({
 *   reportUrl: '/api/analytics/performance',
 *   onReport: (metric) => {
 *     // Custom handling
 *   }
 * });
 * ```
 */
export function initPerformanceMonitoring(config: PerformanceConfig = {}): void {
  const isDevelopment = import.meta.env.DEV;

  // Default configuration
  const finalConfig: PerformanceConfig = {
    logToConsole: isDevelopment || config.debug,
    debug: config.debug,
    ...config,
  };

  if (finalConfig.debug) {
    console.log('[Performance] Initializing monitoring with config:', finalConfig);
  }

  // Register metric collectors
  onCLS((metric) => handleMetric(metric, finalConfig));
  onINP((metric) => handleMetric(metric, finalConfig));
  onLCP((metric) => handleMetric(metric, finalConfig));
  onFCP((metric) => handleMetric(metric, finalConfig));
  onTTFB((metric) => handleMetric(metric, finalConfig));

  if (finalConfig.logToConsole) {
    console.log('[Performance] Monitoring initialized');
  }
}

/**
 * Get all collected metrics
 */
export function getMetrics(): Map<string, PerformanceMetric> {
  return new Map(collectedMetrics);
}

/**
 * Get a specific metric by name
 */
export function getMetric(name: string): PerformanceMetric | undefined {
  return collectedMetrics.get(name);
}

/**
 * Get summary of all metrics
 */
export function getMetricsSummary(): {
  metrics: PerformanceMetric[];
  overallRating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
} {
  const metrics = Array.from(collectedMetrics.values());

  // Calculate overall rating
  const ratings = metrics.map((m) => m.rating);
  let overallRating: 'good' | 'needs-improvement' | 'poor' = 'good';

  if (ratings.includes('poor')) {
    overallRating = 'poor';
  } else if (ratings.includes('needs-improvement')) {
    overallRating = 'needs-improvement';
  }

  return {
    metrics,
    overallRating,
    timestamp: Date.now(),
  };
}

/**
 * Clear all collected metrics
 */
export function clearMetrics(): void {
  collectedMetrics.clear();
}

// Export metric types for external use
export type {
  CLSMetric,
  INPMetric,
  LCPMetric,
  FCPMetric,
  TTFBMetric,
};