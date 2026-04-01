import { useState, useEffect } from 'react';

/**
 * 网络状态检测 Hook
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // 网络恢复后可以触发重新加载
        window.dispatchEvent(new CustomEvent('network-restored'));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

/**
 * 检测是否为网络错误
 */
function isNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    'Failed to fetch',
    'NetworkError',
    'Network request failed',
    'ERR_NETWORK',
    'ERR_CONNECTION_REFUSED',
    'ERR_CONNECTION_RESET',
    'ERR_CONNECTION_TIMED_OUT',
    'ERR_INTERNET_DISCONNECTED',
    'ENOTFOUND',
  ];

  return (
    error.name === 'TypeError' ||
    networkErrorMessages.some(msg =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    ) ||
    !navigator.onLine
  );
}

/**
 * 计算重试延迟（指数退避）
 */
function calculateDelay(attempt: number, baseDelay: number = 1000): number {
  // 指数退避：1s, 2s, 4s...
  const delay = baseDelay * Math.pow(2, attempt - 1);
  // 添加一些随机性避免同时重试
  const jitter = Math.random() * 0.1 * delay;
  return Math.min(delay + jitter, 10000); // 最大10秒
}

/**
 * fetchWithRetry 配置选项
 */
export interface FetchRetryOptions {
  /** 最大重试次数，默认3 */
  maxRetries?: number;
  /** 基础延迟时间（毫秒），默认1000 */
  baseDelay?: number;
  /** 是否仅在网络错误时重试，默认true */
  retryOnNetworkErrorOnly?: boolean;
  /** 自定义判断是否应该重试的函数 */
  shouldRetry?: (error: Error, attempt: number) => boolean;
  /** 重试前的回调 */
  onRetry?: (attempt: number, error: Error) => void;
  /** 请求超时时间（毫秒），默认30000 */
  timeout?: number;
}

/**
 * fetchWithRetry 结果
 */
export interface FetchRetryResult<T> {
  /** 响应数据 */
  data: T | null;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 重试次数 */
  retryCount: number;
  /** 是否为网络错误 */
  isNetworkError: boolean;
}

/**
 * 带重试机制的 fetch 函数
 * 支持自动重试、指数退避、网络状态检测
 */
export async function fetchWithRetry<T>(
  url: string,
  options?: FetchRetryOptions & RequestInit
): Promise<FetchRetryResult<T>> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    retryOnNetworkErrorOnly = true,
    shouldRetry,
    onRetry,
    timeout = 30000,
    ...fetchOptions
  } = options || {};

  let lastError: Error | null = null;
  let retryCount = 0;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      // 检查网络状态
      if (!navigator.onLine) {
        throw new Error('网络连接已断开，请检查您的网络设置');
      }

      // 创建带超时的请求
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as T;
      return {
        data,
        success: true,
        error: null,
        retryCount: attempt - 1,
        isNetworkError: false,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 判断是否为网络错误
      const networkError = isNetworkError(lastError);

      // 判断是否应该重试
      let shouldRetryNow = attempt <= maxRetries;

      if (retryOnNetworkErrorOnly && !networkError) {
        shouldRetryNow = false;
      }

      if (shouldRetry) {
        shouldRetryNow = shouldRetry(lastError, attempt);
      }

      // 如果不应该重试或已达到最大重试次数，返回结果
      if (!shouldRetryNow || attempt > maxRetries) {
        return {
          data: null,
          success: false,
          error: lastError,
          retryCount: retryCount,
          isNetworkError: networkError,
        };
      }

      // 记录重试
      retryCount++;

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // 等待后重试
      const delay = calculateDelay(attempt, baseDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // 所有重试都失败
  return {
    data: null,
    success: false,
    error: lastError,
    retryCount: retryCount,
    isNetworkError: lastError ? isNetworkError(lastError) : false,
  };
}

/**
 * 简化版的 fetchWithRetry，直接返回数据或抛出错误
 * 适合用于组件中直接调用
 */
export async function fetchJsonWithRetry<T>(
  url: string,
  options?: FetchRetryOptions & RequestInit
): Promise<T> {
  const result = await fetchWithRetry<T>(url, options);

  if (result.success && result.data) {
    return result.data;
  }

  throw result.error || new Error('请求失败');
}