/**
 * Conversion Tracking Module
 *
 * Deep tracking for conversion funnels:
 * - Course purchase funnel with detailed stages
 * - Learning progress milestones with time tracking
 * - Certificate earn funnel
 * - User behavior path recording
 */

import { useCallback, useRef, useEffect } from 'react';
import { useAnalytics } from './useAnalytics';
import {
  AnalyticsEvent,
  ConversionFunnels,
  getSessionId,
} from '@/lib/analytics-events';

// ============================================
// Types
// ============================================

export interface PurchaseFunnelState {
  courseId: string;
  courseName: string;
  price: number;
  currentStep: number;
  stepsCompleted: Set<string>;
  startedAt: number;
  previewLessonId?: string;
  previewCompleted: boolean;
  timeSpentOnPreview: number;
  purchaseIntentTimestamp?: number;
}

export interface LearningMilestone {
  lessonId: string;
  lessonName: string;
  milestone: 25 | 50 | 75 | 100;
  reachedAt: number;
  timeFromStart: number; // milliseconds
}

export interface BehaviorPathEntry {
  path: string;
  title: string;
  enteredAt: number;
  exitedAt?: number;
  timeSpent?: number;
  referrer?: string;
  actions: BehaviorAction[];
}

export interface BehaviorAction {
  type: 'click' | 'scroll' | 'search' | 'view' | 'submit' | 'navigate';
  target: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// Purchase Funnel Deep Tracking Hook
// ============================================

export function usePurchaseFunnelDeep(
  courseId: string,
  courseName: string,
  price: number
) {
  const {
    trackEvent,
    trackFunnelStep,
    trackCourseView,
    trackLessonStart,
    trackLessonComplete,
    trackPurchaseClick,
    trackPurchaseComplete,
    trackCTA,
  } = useAnalytics();

  const stateRef = useRef<PurchaseFunnelState>({
    courseId,
    courseName,
    price,
    currentStep: 0,
    stepsCompleted: new Set(),
    startedAt: Date.now(),
    previewCompleted: false,
    timeSpentOnPreview: 0,
  });

  const previewStartTimeRef = useRef<number>(0);

  // Step 1: View Course (automatic when component mounts)
  useEffect(() => {
    trackStep('view_course', 1);
    trackCourseView(courseId, courseName, { price });
  }, [courseId, courseName, price]);

  const trackStep = useCallback(
    (stepName: string, stepIndex: number, extras?: Record<string, unknown>) => {
      if (!stateRef.current.stepsCompleted.has(stepName)) {
        stateRef.current.stepsCompleted.add(stepName);
        stateRef.current.currentStep = stepIndex;

        const funnel = ConversionFunnels.COURSE_PURCHASE;
        trackFunnelStep(funnel.name, stepIndex, stepName, funnel.steps.length, {
          courseId,
          courseName,
          price,
          timeFromStart: Date.now() - stateRef.current.startedAt,
          ...extras,
        });
      }
    },
    [courseId, courseName, price, trackFunnelStep]
  );

  // Step 2: Start Preview Lesson
  const startPreviewLesson = useCallback(
    (lessonId: string, lessonName: string) => {
      stateRef.current.previewLessonId = lessonId;
      previewStartTimeRef.current = Date.now();

      trackLessonStart(courseId, lessonId, lessonName, {
        moduleName: 'Preview',
        moduleIndex: 0,
        lessonIndex: 0,
      });

      trackStep('start_preview', 2, { lessonId, lessonName });
      trackCTA('start_preview_lesson', 'courses_section', undefined, {
        courseId,
        lessonId,
      });
    },
    [courseId, trackLessonStart, trackStep, trackCTA]
  );

  // Step 2.5: Complete Preview Lesson (intermediate milestone)
  const completePreviewLesson = useCallback(
    (lessonId: string, lessonName: string) => {
      const timeSpent = Date.now() - previewStartTimeRef.current;
      stateRef.current.previewCompleted = true;
      stateRef.current.timeSpentOnPreview = timeSpent;

      trackLessonComplete(courseId, lessonId, lessonName, {
        moduleName: 'Preview',
        moduleIndex: 0,
        lessonIndex: 0,
      });

      // Track preview completion as a custom event
      (trackEvent as any)(AnalyticsEvent.COMPLETE_LESSON, {
        courseId,
        lessonId,
        lessonName,
        moduleName: 'Preview',
        timeSpent,
        previewCompleted: true,
      });
    },
    [courseId, trackLessonComplete, trackEvent]
  );

  // Step 3: Purchase Intent (hover over purchase button, etc.)
  const trackPurchaseIntent = useCallback(() => {
    stateRef.current.purchaseIntentTimestamp = Date.now();

    trackEvent('purchase_intent' as any, {
      courseId,
      courseName,
      price,
      timeFromView: Date.now() - stateRef.current.startedAt,
      previewCompleted: stateRef.current.previewCompleted,
      timeSpentOnPreview: stateRef.current.timeSpentOnPreview,
    });
  }, [courseId, courseName, price, trackEvent]);

  // Step 4: Click Purchase Button
  const clickPurchase = useCallback(
    (targetUrl: string) => {
      const timeFromIntent = stateRef.current.purchaseIntentTimestamp
        ? Date.now() - stateRef.current.purchaseIntentTimestamp
        : undefined;

      trackPurchaseClick(courseId, courseName, price, {
        targetUrl,
        timeFromView: Date.now() - stateRef.current.startedAt,
        timeFromIntent,
        previewCompleted: stateRef.current.previewCompleted,
      });

      trackStep('click_purchase', 3, {
        targetUrl,
        previewCompleted: stateRef.current.previewCompleted,
      });
    },
    [courseId, courseName, price, trackPurchaseClick, trackStep]
  );

  // Step 5: Complete Purchase (callback after external payment)
  const completePurchase = useCallback(
    (transactionId: string, extras?: Record<string, unknown>) => {
      trackPurchaseComplete(courseId, courseName, price, {
        transactionId,
        totalTime: Date.now() - stateRef.current.startedAt,
        ...extras,
      });

      trackStep('complete_purchase', 4, { transactionId });

      // Track conversion value
      trackEvent('purchase_conversion' as any, {
        courseId,
        courseName,
        price,
        transactionId,
        funnelCompleted: true,
      });
    },
    [courseId, courseName, price, trackPurchaseComplete, trackStep, trackEvent]
  );

  // Get funnel progress summary
  const getFunnelSummary = useCallback(() => {
    return {
      courseId: stateRef.current.courseId,
      currentStep: stateRef.current.currentStep,
      stepsCompleted: Array.from(stateRef.current.stepsCompleted),
      timeFromStart: Date.now() - stateRef.current.startedAt,
      previewCompleted: stateRef.current.previewCompleted,
      purchaseIntentShown: !!stateRef.current.purchaseIntentTimestamp,
    };
  }, []);

  return {
    startPreviewLesson,
    completePreviewLesson,
    trackPurchaseIntent,
    clickPurchase,
    completePurchase,
    getFunnelSummary,
    state: stateRef.current,
  };
}

// ============================================
// Learning Milestone Deep Tracking Hook
// ============================================

export function useLearningMilestoneTracker(
  courseId: string,
  lessonId: string,
  lessonName: string,
  estimatedDurationMinutes: number
) {
  const { trackLessonProgress, trackFunnelStep } = useAnalytics();

  const startTimeRef = useRef<number>(Date.now());
  const milestonesRef = useRef<Map<number, LearningMilestone>>(new Map());
  const lastProgressRef = useRef<number>(0);

  const trackMilestone = useCallback(
    (progressPercent: number) => {
      // Determine milestone
      let milestone: 25 | 50 | 75 | 100 | null = null;
      if (progressPercent >= 25 && progressPercent < 50 && !milestonesRef.current.has(25)) {
        milestone = 25;
      } else if (progressPercent >= 50 && progressPercent < 75 && !milestonesRef.current.has(50)) {
        milestone = 50;
      } else if (progressPercent >= 75 && progressPercent < 100 && !milestonesRef.current.has(75)) {
        milestone = 75;
      } else if (progressPercent >= 100 && !milestonesRef.current.has(100)) {
        milestone = 100;
      }

      if (milestone !== null) {
        const now = Date.now();
        const timeFromStart = now - startTimeRef.current;

        const milestoneData: LearningMilestone = {
          lessonId,
          lessonName,
          milestone,
          reachedAt: now,
          timeFromStart,
        };

        milestonesRef.current.set(milestone, milestoneData);

        // Track the milestone
        trackLessonProgress(courseId, lessonId, lessonName, progressPercent, {
          milestone,
          timeFromStart,
          estimatedDuration: estimatedDurationMinutes * 60 * 1000,
          progressRate: progressPercent / (timeFromStart / 60000), // progress per minute
        });

        // Track funnel step
        const funnel = ConversionFunnels.LEARNING_PROGRESS;
        const stepIndex = milestone === 100 ? 5 : milestone / 25 + 1;
        trackFunnelStep(funnel.name, stepIndex, funnel.stepNames[stepIndex - 1], funnel.steps.length, {
          courseId,
          lessonId,
          milestone,
          timeFromStart,
        });
      }

      lastProgressRef.current = progressPercent;
    },
    [courseId, lessonId, lessonName, estimatedDurationMinutes, trackLessonProgress, trackFunnelStep]
  );

  // Start timer
  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now();
    milestonesRef.current.clear();
    lastProgressRef.current = 0;
  }, []);

  // Get milestone summary
  const getMilestoneSummary = useCallback(() => {
    const milestones = Array.from(milestonesRef.current.values());
    const totalTime = Date.now() - startTimeRef.current;

    return {
      lessonId,
      lessonName,
      reachedMilestones: milestones,
      currentProgress: lastProgressRef.current,
      totalTime,
      averagePace: milestones.length > 0
        ? totalTime / milestones.length / 60000 // minutes per milestone
        : undefined,
      completionRate: milestonesRef.current.has(100) ? 100 : lastProgressRef.current,
    };
  }, [lessonId, lessonName]);

  return {
    trackMilestone,
    startTracking,
    getMilestoneSummary,
    reachedMilestones: Array.from(milestonesRef.current.keys()),
  };
}

// ============================================
// Certificate Funnel Tracking Hook
// ============================================

export function useCertificateFunnelTracker(
  courseId: string,
  courseName: string
) {
  const { trackFunnelStep, trackCertificateEarn, trackQuizComplete, trackEvent } = useAnalytics();

  const stateRef = useRef({
    startedCourse: false,
    completedAllLessons: false,
    passedQuiz: false,
    earnedCertificate: false,
    startedAt: Date.now(),
  });

  const funnel = ConversionFunnels.CERTIFICATE_EARN;

  // Step 1: Start Course
  const trackStartCourse = useCallback(() => {
    if (!stateRef.current.startedCourse) {
      stateRef.current.startedCourse = true;
      trackFunnelStep(funnel.name, 1, funnel.stepNames[0], funnel.steps.length, {
        courseId,
        courseName,
      });
    }
  }, [courseId, courseName, funnel, trackFunnelStep]);

  // Step 2: Complete All Lessons
  const trackCompleteAllLessons = useCallback(
    (totalLessons: number, completedLessons: number) => {
      if (!stateRef.current.completedAllLessons && completedLessons >= totalLessons) {
        stateRef.current.completedAllLessons = true;
        trackFunnelStep(funnel.name, 2, funnel.stepNames[1], funnel.steps.length, {
          courseId,
          courseName,
          totalLessons,
          timeFromStart: Date.now() - stateRef.current.startedAt,
        });
      }
    },
    [courseId, courseName, funnel, trackFunnelStep]
  );

  // Step 3: Pass Quiz
  const trackPassQuiz = useCallback(
    (quizId: string,
     quizName: string,
     score: number,
     maxScore: number,
     passed: boolean) => {
      trackQuizComplete(quizId, quizName, score, maxScore, {
        courseId,
        courseName,
      });

      if (passed && !stateRef.current.passedQuiz) {
        stateRef.current.passedQuiz = true;
        trackFunnelStep(funnel.name, 3, funnel.stepNames[2], funnel.steps.length, {
          courseId,
          courseName,
          quizId,
          score,
          maxScore,
          timeFromStart: Date.now() - stateRef.current.startedAt,
        });
      }
    },
    [courseId, courseName, funnel, trackQuizComplete, trackFunnelStep]
  );

  // Step 4: Earn Certificate
  const trackEarnCertificate = useCallback(
    (certificateId: string,
     certificateName: string) => {
      if (!stateRef.current.earnedCertificate) {
        stateRef.current.earnedCertificate = true;

        trackCertificateEarn(certificateId, certificateName, courseId, courseName, {
          totalTime: Date.now() - stateRef.current.startedAt,
        });

        trackFunnelStep(funnel.name, 4, funnel.stepNames[3], funnel.steps.length, {
          courseId,
          courseName,
          certificateId,
          totalTime: Date.now() - stateRef.current.startedAt,
        });

        // Track certificate conversion
        trackEvent('certificate_conversion' as any, {
          courseId,
          courseName,
          certificateId,
          totalTime: Date.now() - stateRef.current.startedAt,
          funnelCompleted: true,
        });
      }
    },
    [courseId, courseName, funnel, trackCertificateEarn, trackFunnelStep, trackEvent]
  );

  // Get funnel progress
  const getCertificateProgress = useCallback(() => {
    return {
      courseId,
      courseName,
      currentStep: stateRef.current.earnedCertificate ? 4
        : stateRef.current.passedQuiz ? 3
        : stateRef.current.completedAllLessons ? 2
        : stateRef.current.startedCourse ? 1 : 0,
      startedCourse: stateRef.current.startedCourse,
      completedAllLessons: stateRef.current.completedAllLessons,
      passedQuiz: stateRef.current.passedQuiz,
      earnedCertificate: stateRef.current.earnedCertificate,
      timeFromStart: Date.now() - stateRef.current.startedAt,
    };
  }, [courseId, courseName]);

  return {
    trackStartCourse,
    trackCompleteAllLessons,
    trackPassQuiz,
    trackEarnCertificate,
    getCertificateProgress,
  };
}

// ============================================
// User Behavior Path Tracker Hook
// ============================================

export function useBehaviorPathTracker() {
  const { trackEvent, trackPageView } = useAnalytics();

  const pathRef = useRef<BehaviorPathEntry[]>([]);
  const currentPathRef = useRef<BehaviorPathEntry | null>(null);
  const sessionId = getSessionId();

  // Enter a new page
  const enterPage = useCallback(
    (path: string, title: string) => {
      // Close previous page if exists
      if (currentPathRef.current) {
        currentPathRef.current.exitedAt = Date.now();
        currentPathRef.current.timeSpent =
          currentPathRef.current.exitedAt - currentPathRef.current.enteredAt;
      }

      // Create new entry
      const entry: BehaviorPathEntry = {
        path,
        title,
        enteredAt: Date.now(),
        referrer: currentPathRef.current?.path || document.referrer,
        actions: [],
      };

      currentPathRef.current = entry;
      pathRef.current.push(entry);

      // Track page view
      trackPageView(path, title, {
        pathIndex: pathRef.current.length,
        previousPath: pathRef.current.length > 1
          ? pathRef.current[pathRef.current.length - 2].path
          : undefined,
      });
    },
    [trackPageView]
  );

  // Track action on current page
  const trackAction = useCallback(
    (type: BehaviorAction['type'],
     target: string,
     metadata?: Record<string, unknown>) => {
      if (currentPathRef.current) {
        const action: BehaviorAction = {
          type,
          target,
          timestamp: Date.now(),
          metadata,
        };

        currentPathRef.current.actions.push(action);

        // Track significant actions
        if (type === 'click' || type === 'submit' || type === 'search') {
          trackEvent(AnalyticsEvent.CLICK_CTA, {
            ctaName: target,
            ctaLocation: currentPathRef.current.path,
          });
        }
      }
    },
    [trackEvent]
  );

  // Get path summary
  const getPathSummary = useCallback(() => {
    const paths = pathRef.current.map((p) => ({
      path: p.path,
      title: p.title,
      timeSpent: p.timeSpent || (p === currentPathRef.current
        ? Date.now() - p.enteredAt
        : undefined),
      actionCount: p.actions.length,
    }));

    const totalTime = paths.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const uniquePaths = new Set(paths.map((p) => p.path)).size;

    return {
      sessionId,
      totalPages: paths.length,
      uniquePages: uniquePaths,
      totalTime,
      averageTimePerPage: paths.length > 0 ? totalTime / paths.length : 0,
      pathSequence: paths,
      currentPath: currentPathRef.current?.path,
    };
  }, [sessionId]);

  // Get drop-off analysis
  const getDropOffAnalysis = useCallback(() => {
    const paths = pathRef.current;
    const dropOffs: Array<{ path: string; timeSpent: number; reason: string }> = [];

    // Identify potential drop-off points
    paths.forEach((p, index) => {
      if (p.actions.length === 0 && p.timeSpent && p.timeSpent < 10000) {
        // Page with no actions and short time = potential drop-off
        dropOffs.push({
          path: p.path,
          timeSpent: p.timeSpent,
          reason: 'no_interaction_short_time',
        });
      }

      if (index > 0 && p.referrer !== paths[index - 1].path) {
        // Jumped from non-linear path
        dropOffs.push({
          path: p.path,
          timeSpent: p.timeSpent || 0,
          reason: 'non_linear_navigation',
        });
      }
    });

    return {
      potentialDropOffs: dropOffs,
      dropOffRate: dropOffs.length / paths.length,
      lastPath: currentPathRef.current?.path,
    };
  }, []);

  return {
    enterPage,
    trackAction,
    getPathSummary,
    getDropOffAnalysis,
  };
}

// ============================================
// Export Types
// ============================================

export type {
  PurchaseFunnelDeepReturn,
  LearningMilestoneTrackerReturn,
  CertificateFunnelTrackerReturn,
  BehaviorPathTrackerReturn,
};

interface PurchaseFunnelDeepReturn {
  startPreviewLesson: (lessonId: string, lessonName: string) => void;
  completePreviewLesson: (lessonId: string, lessonName: string) => void;
  trackPurchaseIntent: () => void;
  clickPurchase: (targetUrl: string) => void;
  completePurchase: (transactionId: string, extras?: Record<string, unknown>) => void;
  getFunnelSummary: () => ReturnType<typeof usePurchaseFunnelDeep>['getFunnelSummary'];
  state: PurchaseFunnelState;
}

interface LearningMilestoneTrackerReturn {
  trackMilestone: (progressPercent: number) => void;
  startTracking: () => void;
  getMilestoneSummary: () => ReturnType<typeof useLearningMilestoneTracker>['getMilestoneSummary'];
  reachedMilestones: number[];
}

interface CertificateFunnelTrackerReturn {
  trackStartCourse: () => void;
  trackCompleteAllLessons: (totalLessons: number, completedLessons: number) => void;
  trackPassQuiz: (quizId: string, quizName: string, score: number, maxScore: number, passed: boolean) => void;
  trackEarnCertificate: (certificateId: string, certificateName: string) => void;
  getCertificateProgress: () => ReturnType<typeof useCertificateFunnelTracker>['getCertificateProgress'];
}

interface BehaviorPathTrackerReturn {
  enterPage: (path: string, title: string) => void;
  trackAction: (type: BehaviorAction['type'], target: string, metadata?: Record<string, unknown>) => void;
  getPathSummary: () => ReturnType<typeof useBehaviorPathTracker>['getPathSummary'];
  getDropOffAnalysis: () => ReturnType<typeof useBehaviorPathTracker>['getDropOffAnalysis'];
}