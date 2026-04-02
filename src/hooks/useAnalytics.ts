/**
 * useAnalytics Hook
 *
 * A React hook for tracking analytics events.
 * Provides a platform-agnostic interface for event tracking.
 * Can be integrated with GA4, Baidu Analytics, or any other analytics platform.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnalyticsEvent,
  type AnalyticsConfig,
  defaultAnalyticsConfig,
  type EventParamsMap,
  type AnalyticsEventType,
  ConversionFunnels,
  getSessionId,
  setSessionId,
} from '@/lib/analytics-events';

// ============================================
// Types
// ============================================

type TrackingFunction = (eventName: string, params?: Record<string, unknown>) => void | Promise<void>;

interface UseAnalyticsReturn {
  // Core tracking methods
  trackEvent: <K extends AnalyticsEventType>(eventName: K, params: EventParamsMap[K]) => void;
  trackPageView: (pagePath: string, pageTitle: string, extras?: Record<string, unknown>) => void;
  trackConversion: (conversionName: string, value: number, currency?: string, extras?: Record<string, unknown>) => void;

  // Course-specific tracking
  trackCourseView: (courseId: string, courseName: string, extras?: Record<string, unknown>) => void;
  trackLessonStart: (courseId: string, lessonId: string, lessonName: string, extras?: Record<string, unknown>) => void;
  trackLessonComplete: (courseId: string, lessonId: string, lessonName: string, extras?: Record<string, unknown>) => void;
  trackLessonProgress: (
    courseId: string,
    lessonId: string,
    lessonName: string,
    progressPercent: number,
    extras?: Record<string, unknown>
  ) => void;

  // Purchase tracking
  trackPurchaseClick: (courseId: string, courseName: string, price: number, extras?: Record<string, unknown>) => void;
  trackPurchaseComplete: (courseId: string, courseName: string, price: number, extras?: Record<string, unknown>) => void;

  // Achievement tracking
  trackCertificateEarn: (
    certificateId: string,
    certificateName: string,
    courseId: string,
    courseName: string,
    extras?: Record<string, unknown>
  ) => void;
  trackQuizComplete: (
    quizId: string,
    quizName: string,
    score: number,
    maxScore: number,
    extras?: Record<string, unknown>
  ) => void;

  // Engagement tracking
  trackSearch: (searchTerm: string, resultCount: number, extras?: Record<string, unknown>) => void;
  trackShare: (
    contentType: 'course' | 'lesson' | 'certificate' | 'achievement',
    contentId: string,
    shareMethod: 'copy_link' | 'wechat' | 'weibo' | 'twitter' | 'facebook' | 'linkedin' | 'other',
    extras?: Record<string, unknown>
  ) => void;
  trackCTA: (ctaName: string, ctaLocation: string, targetUrl?: string, extras?: Record<string, unknown>) => void;

  // Error tracking
  trackError: (
    errorCode: string,
    errorMessage: string,
    errorType: 'api' | 'network' | 'validation' | 'runtime' | 'unknown',
    extras?: Record<string, unknown>
  ) => void;

  // Funnel tracking
  trackFunnelStep: (
    funnelName: string,
    stepIndex: number,
    stepName: string,
    totalSteps: number,
    extras?: Record<string, unknown>
  ) => void;

  // Session management
  getSessionId: () => string;
  setSessionId: (sessionId: string) => void;

  // Configuration
  isTrackingEnabled: boolean;
  setTrackingEnabled: (enabled: boolean) => void;
}

// ============================================
// Analytics Provider Configuration
// ============================================

interface AnalyticsProvider {
  name: string;
  trackEvent: TrackingFunction;
  trackPageView: TrackingFunction;
  trackConversion: (conversionName: string, value?: number, currency?: string, params?: Record<string, unknown>) => void;
}

// Default providers (can be extended)
const defaultProviders: AnalyticsProvider[] = [];

// Global providers registry
let providers: AnalyticsProvider[] = [...defaultProviders];

// Global config (mutable for runtime configuration)
// eslint-disable-next-line prefer-const
let globalConfig: AnalyticsConfig = { ...defaultAnalyticsConfig };

// ============================================
// Provider Registration
// ============================================

export function registerAnalyticsProvider(provider: AnalyticsProvider): void {
  if (!providers.find((p) => p.name === provider.name)) {
    providers = [...providers, provider];
  }
}

export function unregisterAnalyticsProvider(name: string): void {
  providers = providers.filter((p) => p.name !== name);
}

// ============================================
// GA4 Integration Helper
// ============================================

export function createGA4Provider(ga4MeasurementId: string): AnalyticsProvider {
  // Measurement ID is used for initialization in a real implementation
  void ga4MeasurementId;
  return {
    name: 'ga4',
    trackEvent: (eventName: string, params?: Record<string, unknown>) => {
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as Window & { gtag: (...args: unknown[]) => void }).gtag('event', eventName, params);
      }
    },
    trackPageView: (_pagePath: string, params?: Record<string, unknown>) => {
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as Window & { gtag: (...args: unknown[]) => void }).gtag('event', 'page_view', params);
      }
    },
    trackConversion: (conversionName: string, value?: number, currency?: string, params?: Record<string, unknown>) => {
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as Window & { gtag: (...args: unknown[]) => void }).gtag('event', conversionName, {
          value,
          currency,
          ...params,
        });
      }
    },
  };
}

// ============================================
// Baidu Analytics Integration Helper
// ============================================

export function createBaiduAnalyticsProvider(siteId: string): AnalyticsProvider {
  // Site ID is used for initialization in a real implementation
  void siteId;
  return {
    name: 'baidu',
    trackEvent: (eventName: string, params?: Record<string, unknown>) => {
      if (typeof window !== 'undefined' && '_hmt' in window) {
        const p = params || {};
        (window as Window & { _hmt: { push: (args: unknown[]) => void } })._hmt.push([
          '_trackEvent',
          eventName,
          p.category || 'default',
          p.label || '',
          p.value || 0,
        ]);
      }
    },
    trackPageView: (pagePath: string, params?: Record<string, unknown>) => {
      // params unused but kept for API consistency
      void params;
      if (typeof window !== 'undefined' && '_hmt' in window) {
        (window as Window & { _hmt: { push: (args: unknown[]) => void } })._hmt.push([
          '_trackPageview',
          pagePath,
        ]);
      }
    },
    trackConversion: (conversionName: string, value?: number, currency?: string, params?: Record<string, unknown>) => {
      // value and currency unused but kept for API consistency
      void value;
      void currency;
      if (typeof window !== 'undefined' && '_hmt' in window) {
        const p = params || {};
        (window as Window & { _hmt: { push: (args: unknown[]) => void } })._hmt.push([
          '_trackEvent',
          'conversion',
          conversionName,
          p.label || '',
          p.value || 0,
        ]);
      }
    },
  };
}

// ============================================
// Console Debug Provider (for development)
// ============================================

export const debugProvider: AnalyticsProvider = {
  name: 'debug',
  trackEvent: (eventName: string, params?: Record<string, unknown>) => {
    console.log(`[Analytics] Event: ${eventName}`, params);
  },
  trackPageView: (pagePath: string, params?: Record<string, unknown>) => {
    console.log(`[Analytics] PageView: ${pagePath}`, params);
  },
  trackConversion: (conversionName: string, value?: number, currency?: string, params?: Record<string, unknown>) => {
    console.log(`[Analytics] Conversion: ${conversionName}`, { value, currency, ...params });
  },
};

// ============================================
// Core Tracking Function
// ============================================

function trackToAllProviders<K extends AnalyticsEventType>(
  eventName: K,
  params: EventParamsMap[K]
): void {
  if (!globalConfig.enabled) {
    return;
  }

  const enrichedParams: Record<string, unknown> = {
    ...params,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };

  // Track to all registered providers
  providers.forEach((provider) => {
    try {
      provider.trackEvent(eventName, enrichedParams);
    } catch (error) {
      console.error(`[Analytics] Provider ${provider.name} error:`, error);
    }
  });

  // Debug logging
  if (globalConfig.debug) {
    console.log(`[Analytics] ${eventName}:`, enrichedParams);
  }

  // Custom callback
  if (globalConfig.onEvent) {
    try {
      globalConfig.onEvent(eventName, enrichedParams);
    } catch (error) {
      console.error('[Analytics] Custom callback error:', error);
    }
  }
}

// ============================================
// Main Hook
// ============================================

export function useAnalytics(): UseAnalyticsReturn {
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(globalConfig.enabled);
  const progressMilestonesRef = useRef<Set<string>>(new Set());

  // Enable debug provider in development
  useEffect(() => {
    if (import.meta.env.DEV && !providers.find((p) => p.name === 'debug')) {
      registerAnalyticsProvider(debugProvider);
    }
  }, []);

  // Track generic event
  const trackEvent = useCallback(<K extends AnalyticsEventType>(eventName: K, params: EventParamsMap[K]) => {
    trackToAllProviders(eventName, params);
  }, []);

  // Track page view
  const trackPageView = useCallback((pagePath: string, pageTitle: string, extras?: Record<string, unknown>) => {
    const params = {
      pagePath,
      pageTitle,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      ...extras,
    };

    providers.forEach((provider) => {
      try {
        provider.trackPageView(pagePath, params);
      } catch (error) {
        console.error(`[Analytics] Provider ${provider.name} error:`, error);
      }
    });

    if (globalConfig.debug) {
      console.log(`[Analytics] PageView: ${pagePath}`, params);
    }
  }, []);

  // Track conversion
  const trackConversion = useCallback(
    (conversionName: string, value: number, currency = 'CNY', extras?: Record<string, unknown>) => {
      providers.forEach((provider) => {
        try {
          provider.trackConversion(conversionName, value, currency, extras);
        } catch (error) {
          console.error(`[Analytics] Provider ${provider.name} error:`, error);
        }
      });

      if (globalConfig.debug) {
        console.log(`[Analytics] Conversion: ${conversionName}`, { value, currency, ...extras });
      }
    },
    []
  );

  // Course view tracking
  const trackCourseView = useCallback(
    (courseId: string, courseName: string, extras?: Record<string, unknown>) => {
      trackToAllProviders(AnalyticsEvent.VIEW_COURSE, {
        courseId,
        courseName,
        ...extras,
      } as EventParamsMap[typeof AnalyticsEvent.VIEW_COURSE]);
    },
    []
  );

  // Lesson start tracking
  const trackLessonStart = useCallback(
    (courseId: string, lessonId: string, lessonName: string, extras?: Record<string, unknown>) => {
      trackToAllProviders(AnalyticsEvent.START_LESSON, {
        courseId,
        lessonId,
        lessonName,
        ...extras,
      } as EventParamsMap[typeof AnalyticsEvent.START_LESSON]);
    },
    []
  );

  // Lesson complete tracking
  const trackLessonComplete = useCallback(
    (courseId: string, lessonId: string, lessonName: string, extras?: Record<string, unknown>) => {
      trackToAllProviders(AnalyticsEvent.COMPLETE_LESSON, {
        courseId,
        lessonId,
        lessonName,
        ...extras,
      } as EventParamsMap[typeof AnalyticsEvent.COMPLETE_LESSON]);

      // Track 100% progress milestone
      const milestoneKey = `${courseId}-${lessonId}`;
      if (!progressMilestonesRef.current.has(`${milestoneKey}-100`)) {
        progressMilestonesRef.current.add(`${milestoneKey}-100`);
        trackToAllProviders(AnalyticsEvent.LESSON_PROGRESS, {
          courseId,
          lessonId,
          lessonName,
          progressPercent: 100,
          milestone: 100,
          ...extras,
        } as EventParamsMap[typeof AnalyticsEvent.LESSON_PROGRESS]);
      }
    },
    []
  );

  // Lesson progress tracking with milestone detection
  const trackLessonProgress = useCallback(
    (
      courseId: string,
      lessonId: string,
      lessonName: string,
      progressPercent: number,
      extras?: Record<string, unknown>
    ) => {
      // Determine which milestone we're at
      let milestone: 25 | 50 | 75 | 100 | null = null;
      if (progressPercent >= 25 && progressPercent < 50) {
        milestone = 25;
      } else if (progressPercent >= 50 && progressPercent < 75) {
        milestone = 50;
      } else if (progressPercent >= 75 && progressPercent < 100) {
        milestone = 75;
      } else if (progressPercent >= 100) {
        milestone = 100;
      }

      // Only track each milestone once per lesson per session
      if (milestone !== null) {
        const milestoneKey = `${courseId}-${lessonId}-${milestone}`;
        if (!progressMilestonesRef.current.has(milestoneKey)) {
          progressMilestonesRef.current.add(milestoneKey);
          trackToAllProviders(AnalyticsEvent.LESSON_PROGRESS, {
            courseId,
            lessonId,
            lessonName,
            progressPercent,
            milestone,
            ...extras,
          } as EventParamsMap[typeof AnalyticsEvent.LESSON_PROGRESS]);

          // Also track funnel step for learning progress
          const funnel = ConversionFunnels.LEARNING_PROGRESS;
          const stepIndex = [25, 50, 75, 100].indexOf(milestone) + 1;
          trackToAllProviders(AnalyticsEvent.FUNNEL_STEP, {
            funnelName: funnel.name,
            funnelStep: stepIndex,
            funnelStepName: funnel.stepNames[stepIndex],
            funnelTotalSteps: funnel.steps.length,
            metadata: { courseId, lessonId, progressPercent },
            ...extras,
          } as EventParamsMap[typeof AnalyticsEvent.FUNNEL_STEP]);
        }
      }
    },
    []
  );

  // Purchase click tracking
  const trackPurchaseClick = useCallback(
    (courseId: string, courseName: string, price: number, extras?: Record<string, unknown>) => {
      trackToAllProviders(AnalyticsEvent.CLICK_PURCHASE, {
        courseId,
        courseName,
        price,
        currency: 'CNY',
        ...extras,
      } as EventParamsMap[typeof AnalyticsEvent.CLICK_PURCHASE]);

      // Track conversion
      trackConversion('purchase_click', price, 'CNY', { courseId, courseName, ...extras });
    },
    [trackConversion]
  );

  // Purchase complete tracking
  const trackPurchaseComplete = useCallback(
    (courseId: string, courseName: string, price: number, extras?: Record<string, unknown>) => {
      trackToAllProviders(AnalyticsEvent.COMPLETE_PURCHASE, {
        courseId,
        courseName,
        price,
        currency: 'CNY',
        ...extras,
      } as EventParamsMap[typeof AnalyticsEvent.COMPLETE_PURCHASE]);

      // Track conversion
      trackConversion('purchase_complete', price, 'CNY', { courseId, courseName, ...extras });
    },
    [trackConversion]
  );

  // Certificate tracking
  const trackCertificateEarn = useCallback(
    (
      certificateId: string,
      certificateName: string,
      courseId: string,
      courseName: string,
      extras?: Record<string, unknown>
    ) => {
      trackToAllProviders(AnalyticsEvent.EARN_CERTIFICATE, {
        certificateId,
        certificateName,
        courseId,
        courseName,
        issueDate: new Date().toISOString(),
        ...extras,
      } as EventParamsMap[typeof AnalyticsEvent.EARN_CERTIFICATE]);
    },
    []
  );

  // Quiz tracking
  const trackQuizComplete = useCallback(
    (
      quizId: string,
      quizName: string,
      score: number,
      maxScore: number,
      extras?: Record<string, unknown>
    ) => {
      trackToAllProviders(AnalyticsEvent.COMPLETE_QUIZ, {
        quizId,
        quizName,
        score,
        maxScore,
        passed: score >= maxScore * 0.6,
        ...extras,
      } as EventParamsMap[typeof AnalyticsEvent.COMPLETE_QUIZ]);
    },
    []
  );

  // Search tracking
  const trackSearch = useCallback((searchTerm: string, resultCount: number, extras?: Record<string, unknown>) => {
    trackToAllProviders(AnalyticsEvent.SEARCH, {
      searchTerm,
      resultCount,
      ...extras,
    } as EventParamsMap[typeof AnalyticsEvent.SEARCH]);
  }, []);

  // Share tracking
  const trackShare = useCallback(
    (
      contentType: 'course' | 'lesson' | 'certificate' | 'achievement',
      contentId: string,
      shareMethod: 'copy_link' | 'wechat' | 'weibo' | 'twitter' | 'facebook' | 'linkedin' | 'other',
      extras?: Record<string, unknown>
    ) => {
      trackToAllProviders(AnalyticsEvent.SHARE, {
        contentType,
        contentId,
        shareMethod,
        ...extras,
      } as EventParamsMap[typeof AnalyticsEvent.SHARE]);
    },
    []
  );

  // CTA tracking
  const trackCTA = useCallback(
    (ctaName: string, ctaLocation: string, targetUrl?: string, extras?: Record<string, unknown>) => {
      trackToAllProviders(AnalyticsEvent.CLICK_CTA, {
        ctaName,
        ctaLocation,
        targetUrl,
        ...extras,
      } as EventParamsMap[typeof AnalyticsEvent.CLICK_CTA]);
    },
    []
  );

  // Error tracking
  const trackError = useCallback(
    (
      errorCode: string,
      errorMessage: string,
      errorType: 'api' | 'network' | 'validation' | 'runtime' | 'unknown',
      extras?: Record<string, unknown>
    ) => {
      trackToAllProviders(AnalyticsEvent.ERROR, {
        errorCode,
        errorMessage,
        errorType,
        ...extras,
      } as EventParamsMap[typeof AnalyticsEvent.ERROR]);
    },
    []
  );

  // Funnel step tracking
  const trackFunnelStep = useCallback(
    (
      funnelName: string,
      stepIndex: number,
      stepName: string,
      totalSteps: number,
      extras?: Record<string, unknown>
    ) => {
      trackToAllProviders(AnalyticsEvent.FUNNEL_STEP, {
        funnelName,
        funnelStep: stepIndex,
        funnelStepName: stepName,
        funnelTotalSteps: totalSteps,
        ...extras,
      } as EventParamsMap[typeof AnalyticsEvent.FUNNEL_STEP]);
    },
    []
  );

  // Set tracking enabled/disabled
  const setTrackingEnabled = useCallback((enabled: boolean) => {
    globalConfig.enabled = enabled;
    setIsTrackingEnabled(enabled);
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackCourseView,
    trackLessonStart,
    trackLessonComplete,
    trackLessonProgress,
    trackPurchaseClick,
    trackPurchaseComplete,
    trackCertificateEarn,
    trackQuizComplete,
    trackSearch,
    trackShare,
    trackCTA,
    trackError,
    trackFunnelStep,
    getSessionId,
    setSessionId,
    isTrackingEnabled,
    setTrackingEnabled,
  };
}

// ============================================
// Hook for Tracking Course Purchase Funnel
// ============================================

export function usePurchaseFunnel(courseId: string, courseName: string, price: number) {
  const {
    trackCourseView,
    trackLessonStart,
    trackPurchaseClick,
    trackPurchaseComplete,
    trackFunnelStep,
  } = useAnalytics();
  const funnel = ConversionFunnels.COURSE_PURCHASE;
  const [currentStep, setCurrentStep] = useState(0);

  const trackStep = useCallback(
    (stepIndex: number, extras?: Record<string, unknown>) => {
      if (stepIndex > currentStep) {
        setCurrentStep(stepIndex);
        trackFunnelStep(funnel.name, stepIndex + 1, funnel.stepNames[stepIndex], funnel.steps.length, {
          courseId,
          courseName,
          price,
          ...extras,
        });
      }
    },
    [funnel, trackFunnelStep, courseId, courseName, price, currentStep]
  );

  const trackViewCourse = useCallback(
    (extras?: Record<string, unknown>) => {
      trackCourseView(courseId, courseName, extras);
      trackStep(0, extras);
    },
    [trackCourseView, trackStep, courseId, courseName]
  );

  const trackStartPreview = useCallback(
    (lessonId: string, lessonName: string, extras?: Record<string, unknown>) => {
      trackLessonStart(courseId, lessonId, lessonName, extras);
      trackStep(1, { lessonId, lessonName, ...extras });
    },
    [trackLessonStart, trackStep, courseId]
  );

  const trackClickPurchase = useCallback(
    (extras?: Record<string, unknown>) => {
      trackPurchaseClick(courseId, courseName, price, extras);
      trackStep(2, extras);
    },
    [trackPurchaseClick, trackStep, courseId, courseName, price]
  );

  const trackCompletePurchase = useCallback(
    (extras?: Record<string, unknown>) => {
      trackPurchaseComplete(courseId, courseName, price, extras);
      trackStep(3, extras);
    },
    [trackPurchaseComplete, trackStep, courseId, courseName, price]
  );

  return {
    trackViewCourse,
    trackStartPreview,
    trackClickPurchase,
    trackCompletePurchase,
    currentStep,
    totalSteps: funnel.steps.length,
  };
}

// ============================================
// Hook for Tracking Learning Progress Funnel
// ============================================

export function useLearningProgressFunnel(courseId: string, lessonId: string, lessonName: string) {
  const { trackLessonStart, trackLessonComplete, trackLessonProgress, trackFunnelStep } = useAnalytics();
  const funnel = ConversionFunnels.LEARNING_PROGRESS;
  const [reachedMilestones, setReachedMilestones] = useState<number[]>([]);

  const trackStart = useCallback(
    (extras?: Record<string, unknown>) => {
      trackLessonStart(courseId, lessonId, lessonName, extras);
      trackFunnelStep(funnel.name, 1, funnel.stepNames[0], funnel.steps.length, {
        courseId,
        lessonId,
        lessonName,
        ...extras,
      });
    },
    [trackLessonStart, trackFunnelStep, funnel, courseId, lessonId, lessonName]
  );

  const trackProgress = useCallback(
    (progressPercent: number, extras?: Record<string, unknown>) => {
      // Track milestones
      const milestonesToCheck: Array<{ threshold: number; step: number }> = [
        { threshold: 25, step: 2 },
        { threshold: 50, step: 3 },
        { threshold: 75, step: 4 },
      ];

      milestonesToCheck.forEach(({ threshold, step }) => {
        if (progressPercent >= threshold && !reachedMilestones.includes(threshold)) {
          setReachedMilestones((prev) => [...prev, threshold]);
          trackFunnelStep(funnel.name, step, funnel.stepNames[step - 1], funnel.steps.length, {
            courseId,
            lessonId,
            lessonName,
            progressPercent,
            ...extras,
          });
        }
      });

      trackLessonProgress(courseId, lessonId, lessonName, progressPercent, extras);
    },
    [trackLessonProgress, trackFunnelStep, funnel, courseId, lessonId, lessonName, reachedMilestones]
  );

  const trackComplete = useCallback(
    (extras?: Record<string, unknown>) => {
      trackLessonComplete(courseId, lessonId, lessonName, extras);
      trackFunnelStep(funnel.name, 5, funnel.stepNames[4], funnel.steps.length, {
        courseId,
        lessonId,
        lessonName,
        ...extras,
      });
    },
    [trackLessonComplete, trackFunnelStep, funnel, courseId, lessonId, lessonName]
  );

  return {
    trackStart,
    trackProgress,
    trackComplete,
    reachedMilestones,
  };
}

// ============================================
// Export Types
// ============================================

export type { UseAnalyticsReturn };