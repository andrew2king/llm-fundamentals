/**
 * Global Analytics Provider
 *
 * Provides global analytics tracking for:
 * - User behavior path tracking across pages
 * - Session management
 * - Auto page view tracking
 * - Scroll depth tracking
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useBehaviorPathTracker } from '@/hooks/useConversionTracking';
import { AnalyticsEvent } from '@/lib/analytics-events';

interface GlobalAnalyticsProviderProps {
  children: React.ReactNode;
}

// Scroll depth thresholds to track
const SCROLL_THRESHOLDS = [25, 50, 75, 90, 100];

export function GlobalAnalyticsProvider({ children }: GlobalAnalyticsProviderProps) {
  const { trackEvent, trackPageView } = useAnalytics();
  const { enterPage, trackAction, getPathSummary, getDropOffAnalysis } = useBehaviorPathTracker();

  const scrollMilestonesRef = useRef<Set<number>>(new Set());
  const pageStartTimeRef = useRef<number>(Date.now());
  const currentPathRef = useRef<string>(window.location.pathname + window.location.search);

  // Track page views on initial load and hash changes
  useEffect(() => {
    const trackCurrentPage = () => {
      const path = window.location.pathname + window.location.search + window.location.hash;
      const title = document.title;

      // Reset scroll milestones for new page
      scrollMilestonesRef.current.clear();
      pageStartTimeRef.current = Date.now();

      // Enter new page in behavior path
      enterPage(path, title);

      // Track traditional page view
      trackPageView(path, title);

      // Track section visibility
      trackEvent(AnalyticsEvent.VIEW_SECTION, {
        sectionId: path,
        sectionName: title,
      });

      currentPathRef.current = path;
    };

    // Track initial page
    trackCurrentPage();

    // Track hash changes (for SPA navigation)
    const handleHashChange = () => {
      trackCurrentPage();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [enterPage, trackPageView, trackEvent]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      SCROLL_THRESHOLDS.forEach((threshold) => {
        if (scrollPercent >= threshold && !scrollMilestonesRef.current.has(threshold)) {
          scrollMilestonesRef.current.add(threshold);

          trackAction('scroll', `scroll_depth_${threshold}`, {
            scrollPercent,
            threshold,
            timeOnPage: Date.now() - pageStartTimeRef.current,
          });

          trackEvent('scroll_depth' as any, {
            depth: threshold,
            scrollPercent,
            path: currentPathRef.current,
            timeOnPage: Date.now() - pageStartTimeRef.current,
          });
        }
      });
    };

    // Throttle scroll handler
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [trackAction, trackEvent]);

  // Track page exit/time spent
  useEffect(() => {
    const handleBeforeUnload = () => {
      const summary = getPathSummary();
      const dropOff = getDropOffAnalysis();

      // Track session end
      trackEvent('session_end' as any, {
        totalTime: summary.totalTime,
        totalPages: summary.uniquePages,
        averageTimePerPage: summary.averageTimePerPage,
        lastPath: summary.currentPath,
        dropOffRate: dropOff.dropOffRate,
        sessionId: summary.sessionId,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [getPathSummary, getDropOffAnalysis, trackEvent]);

  // Track visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackAction('navigate', 'tab_hidden', {
          timeOnPage: Date.now() - pageStartTimeRef.current,
        });
      } else {
        trackAction('navigate', 'tab_visible', {
          timeOnPage: Date.now() - pageStartTimeRef.current,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [trackAction]);

  // Track clicks on important elements
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();

    // Track link clicks
    if (tagName === 'a' || target.closest('a')) {
      const link = (target.closest('a') as HTMLAnchorElement) || (target as HTMLAnchorElement);
      const href = link.href;
      const isExternal = href && !href.includes(window.location.hostname);

      trackAction('click', link.textContent || 'link', {
        href,
        isExternal,
        linkType: isExternal ? 'external' : 'internal',
      });
    }

    // Track button clicks
    if (tagName === 'button' || target.closest('button')) {
      const button = target.closest('button') as HTMLButtonElement;
      trackAction('click', button.textContent || button.id || 'button', {
        buttonType: button.type,
        buttonText: button.textContent,
      });
    }

    // Track CTA clicks (elements with specific classes)
    if (target.classList.contains('cta') || target.closest('.cta')) {
      trackAction('click', 'cta_click', {
        ctaElement: target.textContent || target.id,
      });
    }
  }, [trackAction]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  // Track form submissions
  useEffect(() => {
    const handleFormSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const fields: string[] = [];

      formData.forEach((_, key) => {
        fields.push(key);
      });

      trackAction('submit', form.id || form.name || 'form', {
        formFields: fields,
        formMethod: form.method,
        formAction: form.action,
      });
    };

    document.addEventListener('submit', handleFormSubmit);
    return () => document.removeEventListener('submit', handleFormSubmit);
  }, [trackAction]);

  // Track search events from search component
  useEffect(() => {
    const handleSearch = (e: CustomEvent) => {
      trackAction('search', e.detail?.searchTerm || 'search', {
        resultCount: e.detail?.resultCount,
        searchType: e.detail?.searchType,
      });
    };

    window.addEventListener('site-search' as any, handleSearch);
    return () => window.removeEventListener('site-search' as any, handleSearch);
  }, [trackAction]);

  return <>{children}</>;
}

// Hook to dispatch search events
export function useSearchEventDispatcher() {
  const dispatchSearchEvent = useCallback((searchTerm: string, resultCount: number, searchType?: string) => {
    window.dispatchEvent(
      new CustomEvent('site-search', {
        detail: { searchTerm, resultCount, searchType },
      })
    );
  }, []);

  return { dispatchSearchEvent };
}

// Hook to get current session analytics summary
export function useSessionAnalytics() {
  const { getPathSummary, getDropOffAnalysis } = useBehaviorPathTracker();

  const getSessionSummary = useCallback(() => {
    const pathSummary = getPathSummary();
    const dropOff = getDropOffAnalysis();

    return {
      ...pathSummary,
      dropOffAnalysis: dropOff,
    };
  }, [getPathSummary, getDropOffAnalysis]);

  return { getSessionSummary };
}

export default GlobalAnalyticsProvider;