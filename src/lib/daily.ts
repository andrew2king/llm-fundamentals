import type { DailyData } from '@/types/daily';
import { dailyData as embeddedDailyData } from '@/data/daily';
import { fetchWithRetry, type FetchRetryOptions } from '@/lib/fetchWithRetry';

/**
 * 获取本地时区的日期字符串 YYYY-MM-DD
 */
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取最新日报数据（带重试机制）
 * 优先从 public/data/daily/YYYY-MM-DD.json 读取，失败时使用嵌入的数据
 */
export async function getLatestDaily(options?: FetchRetryOptions): Promise<DailyData | null> {
  try {
    // 获取今天的日期作为默认（使用本地时区）
    const today = getLocalDateString();

    // 尝试获取今天的日报（带重试）
    const todayResult = await fetchWithRetry<DailyData>(
      `/data/daily/${today}.json`,
      { ...options, cache: 'no-store' }
    );

    if (todayResult.success && todayResult.data) {
      return todayResult.data;
    }

    // 如果今天没有，尝试获取最近几天的
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getLocalDateString(date);

      const result = await fetchWithRetry<DailyData>(
        `/data/daily/${dateStr}.json`,
        { maxRetries: 1, cache: 'no-store' }
      );

      if (result.success && result.data) {
        return result.data;
      }
    }

    // 如果都失败了，使用嵌入的数据
    console.log('Using embedded daily data as fallback');
    return embeddedDailyData;
  } catch (error) {
    console.error('Failed to load daily news:', error);
    // 出错时也使用嵌入的数据
    return embeddedDailyData;
  }
}

/**
 * 获取指定日期的日报（带重试机制）
 */
export async function getDailyByDate(
  date: string,
  options?: FetchRetryOptions
): Promise<DailyData | null> {
  const result = await fetchWithRetry<DailyData>(
    `/data/daily/${date}.json`,
    { ...options, maxRetries: 2, cache: 'no-store' }
  );

  if (result.success && result.data) {
    return result.data;
  }

  console.error(`Failed to load daily news for ${date}:`, result.error);
  return null;
}

/**
 * 格式化日期显示
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

/**
 * 获取相对时间描述
 */
export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(dateStr);
}
