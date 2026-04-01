/**
 * Analytics Events System
 *
 * A platform-agnostic analytics event tracking system.
 * Provides type-safe event definitions and tracking methods.
 * Can be integrated with GA4, Baidu Analytics, or any other analytics platform.
 */

// ============================================
// Event Names Constants
// ============================================

export const AnalyticsEvent = {
  // Course Events
  VIEW_COURSE: 'view_course',
  START_LESSON: 'start_lesson',
  COMPLETE_LESSON: 'complete_lesson',
  LESSON_PROGRESS: 'lesson_progress',

  // Purchase Events
  CLICK_PURCHASE: 'click_purchase',
  COMPLETE_PURCHASE: 'complete_purchase',
  BEGIN_CHECKOUT: 'begin_checkout',

  // Achievement Events
  EARN_CERTIFICATE: 'earn_certificate',
  COMPLETE_QUIZ: 'complete_quiz',
  COMPLETE_MODULE: 'complete_module',

  // Engagement Events
  SEARCH: 'search',
  SHARE: 'share',
  CLICK_CTA: 'click_cta',
  VIEW_SECTION: 'view_section',

  // Error Events
  ERROR: 'error',
  API_ERROR: 'api_error',

  // Page Events
  PAGE_VIEW: 'page_view',

  // Conversion Funnel Events
  FUNNEL_STEP: 'funnel_step',
} as const;

// ============================================
// Event Parameter Types
// ============================================

export interface BaseEventParams {
  timestamp?: number;
  sessionId?: string;
  userId?: string;
}

export interface CourseEventParams extends BaseEventParams {
  courseId: string;
  courseName: string;
  coursePrice?: number;
  courseLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface LessonEventParams extends BaseEventParams {
  courseId: string;
  lessonId: string;
  lessonName: string;
  moduleName?: string;
  moduleIndex?: number;
  lessonIndex?: number;
}

export interface LessonProgressParams extends LessonEventParams {
  progressPercent: number;
  milestone: 25 | 50 | 75 | 100;
}

export interface PurchaseEventParams extends BaseEventParams {
  courseId: string;
  courseName: string;
  price: number;
  currency: string;
  couponCode?: string;
}

export interface QuizEventParams extends BaseEventParams {
  quizId: string;
  quizName: string;
  score: number;
  maxScore: number;
  passed: boolean;
}

export interface CertificateEventParams extends BaseEventParams {
  certificateId: string;
  certificateName: string;
  courseId: string;
  courseName: string;
  issueDate: string;
}

export interface SearchEventParams extends BaseEventParams {
  searchTerm: string;
  resultCount: number;
  filters?: Record<string, string>;
}

export interface ShareEventParams extends BaseEventParams {
  contentType: 'course' | 'lesson' | 'certificate' | 'achievement';
  contentId: string;
  shareMethod: 'copy_link' | 'wechat' | 'weibo' | 'twitter' | 'facebook' | 'linkedin' | 'other';
}

export interface ErrorEventParams extends BaseEventParams {
  errorCode: string;
  errorMessage: string;
  errorType: 'api' | 'network' | 'validation' | 'runtime' | 'unknown';
  componentStack?: string;
}

export interface PageViewParams extends BaseEventParams {
  pagePath: string;
  pageTitle: string;
  referrer?: string;
}

export interface FunnelStepParams extends BaseEventParams {
  funnelName: string;
  funnelStep: number;
  funnelStepName: string;
  funnelTotalSteps: number;
  metadata?: Record<string, unknown>;
}

export interface CTAEventParams extends BaseEventParams {
  ctaName: string;
  ctaLocation: string;
  targetUrl?: string;
}

// ============================================
// Event Types Union
// ============================================

export type AnalyticsEventType = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

// Event parameter map for type safety
export interface EventParamsMap {
  [AnalyticsEvent.VIEW_COURSE]: CourseEventParams;
  [AnalyticsEvent.START_LESSON]: LessonEventParams;
  [AnalyticsEvent.COMPLETE_LESSON]: LessonEventParams;
  [AnalyticsEvent.LESSON_PROGRESS]: LessonProgressParams;
  [AnalyticsEvent.CLICK_PURCHASE]: PurchaseEventParams;
  [AnalyticsEvent.COMPLETE_PURCHASE]: PurchaseEventParams;
  [AnalyticsEvent.BEGIN_CHECKOUT]: PurchaseEventParams;
  [AnalyticsEvent.EARN_CERTIFICATE]: CertificateEventParams;
  [AnalyticsEvent.COMPLETE_QUIZ]: QuizEventParams;
  [AnalyticsEvent.COMPLETE_MODULE]: LessonEventParams;
  [AnalyticsEvent.SEARCH]: SearchEventParams;
  [AnalyticsEvent.SHARE]: ShareEventParams;
  [AnalyticsEvent.ERROR]: ErrorEventParams;
  [AnalyticsEvent.API_ERROR]: ErrorEventParams;
  [AnalyticsEvent.PAGE_VIEW]: PageViewParams;
  [AnalyticsEvent.FUNNEL_STEP]: FunnelStepParams;
  [AnalyticsEvent.CLICK_CTA]: CTAEventParams;
  [AnalyticsEvent.VIEW_SECTION]: BaseEventParams & { sectionId: string; sectionName: string };
}

// ============================================
// Conversion Funnel Definitions
// ============================================

export const ConversionFunnels = {
  // Course purchase funnel: view -> preview -> purchase_click -> complete
  COURSE_PURCHASE: {
    name: 'course_purchase',
    steps: ['view_course', 'start_lesson', 'click_purchase', 'complete_purchase'] as const,
    stepNames: ['View Course', 'Start Preview Lesson', 'Click Purchase', 'Complete Purchase'] as const,
  },

  // Learning progress funnel
  LEARNING_PROGRESS: {
    name: 'learning_progress',
    steps: ['start_lesson', 'progress_25', 'progress_50', 'progress_75', 'complete_lesson'] as const,
    stepNames: ['Start Lesson', '25% Progress', '50% Progress', '75% Progress', 'Complete Lesson'] as const,
  },

  // Certificate funnel
  CERTIFICATE_EARN: {
    name: 'certificate_earn',
    steps: ['start_course', 'complete_all_lessons', 'pass_quiz', 'earn_certificate'] as const,
    stepNames: ['Start Course', 'Complete All Lessons', 'Pass Quiz', 'Earn Certificate'] as const,
  },
} as const;

// ============================================
// Event Tracking Configuration
// ============================================

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  sessionId: string;
  userId?: string;
  onEvent?: (eventName: string, params: Record<string, unknown>) => void;
}

// Default configuration
export const defaultAnalyticsConfig: AnalyticsConfig = {
  enabled: true,
  debug: import.meta.env.DEV,
  sessionId: generateSessionId(),
};

// ============================================
// Helper Functions
// ============================================

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function createEventParams<T extends BaseEventParams>(
  params: Omit<T, 'timestamp' | 'sessionId'>
): T {
  return {
    ...params,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  } as T;
}

let currentSessionId = defaultAnalyticsConfig.sessionId;

export function getSessionId(): string {
  return currentSessionId;
}

export function setSessionId(sessionId: string): void {
  currentSessionId = sessionId;
}

// ============================================
// Event Validation
// ============================================

export function isValidEventName(eventName: string): eventName is AnalyticsEventType {
  return Object.values(AnalyticsEvent).includes(eventName as AnalyticsEventType);
}

// ============================================
// Type Guard Functions
// ============================================

export function isCourseEvent(params: unknown): params is CourseEventParams {
  return (
    typeof params === 'object' &&
    params !== null &&
    'courseId' in params &&
    'courseName' in params
  );
}

export function isLessonEvent(params: unknown): params is LessonEventParams {
  return (
    typeof params === 'object' &&
    params !== null &&
    'courseId' in params &&
    'lessonId' in params &&
    'lessonName' in params
  );
}

export function isPurchaseEvent(params: unknown): params is PurchaseEventParams {
  return (
    typeof params === 'object' &&
    params !== null &&
    'courseId' in params &&
    'price' in params
  );
}

// ============================================
// Analytics Event Builder
// ============================================

export const AnalyticsEvents = {
  viewCourse: (courseId: string, courseName: string, extras?: Partial<CourseEventParams>): CourseEventParams => ({
    courseId,
    courseName,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),

  startLesson: (courseId: string, lessonId: string, lessonName: string, extras?: Partial<LessonEventParams>): LessonEventParams => ({
    courseId,
    lessonId,
    lessonName,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),

  completeLesson: (courseId: string, lessonId: string, lessonName: string, extras?: Partial<LessonEventParams>): LessonEventParams => ({
    courseId,
    lessonId,
    lessonName,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),

  lessonProgress: (
    courseId: string,
    lessonId: string,
    lessonName: string,
    progressPercent: number,
    extras?: Partial<LessonProgressParams>
  ): LessonProgressParams => ({
    courseId,
    lessonId,
    lessonName,
    progressPercent,
    milestone: (progressPercent >= 100 ? 100 : progressPercent >= 75 ? 75 : progressPercent >= 50 ? 50 : 25) as 25 | 50 | 75 | 100,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),

  clickPurchase: (courseId: string, courseName: string, price: number, extras?: Partial<PurchaseEventParams>): PurchaseEventParams => ({
    courseId,
    courseName,
    price,
    currency: 'CNY',
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),

  completePurchase: (courseId: string, courseName: string, price: number, extras?: Partial<PurchaseEventParams>): PurchaseEventParams => ({
    courseId,
    courseName,
    price,
    currency: 'CNY',
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),

  earnCertificate: (
    certificateId: string,
    certificateName: string,
    courseId: string,
    courseName: string,
    extras?: Partial<CertificateEventParams>
  ): CertificateEventParams => ({
    certificateId,
    certificateName,
    courseId,
    courseName,
    issueDate: new Date().toISOString(),
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),

  completeQuiz: (
    quizId: string,
    quizName: string,
    score: number,
    maxScore: number,
    extras?: Partial<QuizEventParams>
  ): QuizEventParams => ({
    quizId,
    quizName,
    score,
    maxScore,
    passed: score >= maxScore * 0.6,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),

  search: (searchTerm: string, resultCount: number, extras?: Partial<SearchEventParams>): SearchEventParams => ({
    searchTerm,
    resultCount,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),

  share: (
    contentType: ShareEventParams['contentType'],
    contentId: string,
    shareMethod: ShareEventParams['shareMethod'],
    extras?: Partial<ShareEventParams>
  ): ShareEventParams => ({
    contentType,
    contentId,
    shareMethod,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),

  error: (
    errorCode: string,
    errorMessage: string,
    errorType: ErrorEventParams['errorType'],
    extras?: Partial<ErrorEventParams>
  ): ErrorEventParams => ({
    errorCode,
    errorMessage,
    errorType,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),

  pageView: (pagePath: string, pageTitle: string, extras?: Partial<PageViewParams>): PageViewParams => ({
    pagePath,
    pageTitle,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),

  funnelStep: (
    funnelName: string,
    funnelStep: number,
    funnelStepName: string,
    funnelTotalSteps: number,
    extras?: Partial<FunnelStepParams>
  ): FunnelStepParams => ({
    funnelName,
    funnelStep,
    funnelStepName,
    funnelTotalSteps,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    ...extras,
  }),
};