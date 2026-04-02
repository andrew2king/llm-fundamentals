/**
 * PerformanceMonitor Component
 *
 * Displays real-time Web Vitals metrics in development mode.
 * Shows CLS, INP, LCP, FCP, and TTFB metrics with color-coded ratings.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  getMetricsSummary,
  clearMetrics,
  type PerformanceMetric,
} from '@/lib/performance';

interface MetricsState {
  metrics: PerformanceMetric[];
  overallRating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

/**
 * Performance Monitor Component
 *
 * Renders a floating panel that displays Web Vitals metrics.
 * Only visible in development mode.
 */
export function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<MetricsState | null>(null);

  // Update metrics periodically
  const updateMetrics = useCallback(() => {
    const summary = getMetricsSummary();
    if (summary.metrics.length > 0) {
      setMetrics(summary);
    }
  }, []);

  useEffect(() => {
    // Only show in development
    if (!import.meta.env.DEV) {
      return;
    }

    // Update metrics every 2 seconds (initial update happens after mount)
    const interval = setInterval(updateMetrics, 2000);

    // Also update on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateMetrics();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateMetrics]);

  // Don't render in production
  if (!import.meta.env.DEV) {
    return null;
  }

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const handleClear = () => {
    clearMetrics();
    setMetrics(null);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-500';
      case 'needs-improvement':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRatingText = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-400';
      case 'needs-improvement':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatValue = (metric: PerformanceMetric) => {
    if (metric.name === 'CLS') {
      return metric.value.toFixed(3);
    }
    return metric.value < 1000
      ? `${metric.value.toFixed(0)}ms`
      : `${(metric.value / 1000).toFixed(2)}s`;
  };

  const formatName = (name: string) => {
    const names: Record<string, string> = {
      CLS: 'Cumulative Layout Shift',
      INP: 'Interaction to Next Paint',
      LCP: 'Largest Contentful Paint',
      FCP: 'First Contentful Paint',
      TTFB: 'Time to First Byte',
    };
    return names[name] || name;
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 z-[9999] bg-zinc-800 text-white p-2 rounded-full shadow-lg hover:bg-zinc-700 transition-colors border border-zinc-600"
        title="Toggle Performance Monitor"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20v-6M6 20V10M18 20V4" />
        </svg>
      </button>

      {/* Metrics Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-[9998] bg-zinc-900 text-white p-4 rounded-lg shadow-xl border border-zinc-700 min-w-[280px] max-w-[320px]">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-700">
            <h3 className="font-semibold text-sm">Web Vitals</h3>
            <button
              onClick={handleClear}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>

          {!metrics || metrics.metrics.length === 0 ? (
            <p className="text-zinc-400 text-sm py-4 text-center">
              Loading metrics...
              <br />
              <span className="text-xs">
                (Interact with the page to collect all metrics)
              </span>
            </p>
          ) : (
            <>
              {/* Overall Rating */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-700">
                <span className="text-xs text-zinc-400">Overall:</span>
                <span
                  className={`text-xs font-medium ${getRatingText(
                    metrics.overallRating
                  )}`}
                >
                  {metrics.overallRating.toUpperCase().replace('-', ' ')}
                </span>
              </div>

              {/* Metrics List */}
              <div className="space-y-2">
                {metrics.metrics.map((metric) => (
                  <div
                    key={metric.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getRatingColor(
                          metric.rating
                        )}`}
                      />
                      <span className="text-zinc-300">{metric.name}</span>
                    </div>
                    <span className={`font-mono ${getRatingText(metric.rating)}`}>
                      {formatValue(metric)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-3 pt-2 border-t border-zinc-700">
                <details className="text-xs text-zinc-500">
                  <summary className="cursor-pointer hover:text-zinc-300">
                    Metric Definitions
                  </summary>
                  <div className="mt-2 space-y-1 pl-2">
                    {metrics.metrics.map((metric) => (
                      <div key={metric.name} className="text-zinc-400">
                        <strong>{metric.name}</strong>: {formatName(metric.name)}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default PerformanceMonitor;