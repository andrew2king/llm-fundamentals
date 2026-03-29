import type { DailyData } from '@/types/daily';
import { dailyData as embeddedDailyData } from '@/data/daily';

/**
 * 获取最新日报数据
 * 优先从 public/daily-YYYY-MM-DD.json 读取，失败时使用嵌入的数据
 */
export async function getLatestDaily(): Promise<DailyData | null> {
  try {
    // 获取今天的日期作为默认
    const today = new Date().toISOString().split('T')[0];
    
    // 尝试获取今天的日报（使用扁平化路径）
    const response = await fetch(`/daily-${today}.json`);
    if (response.ok) {
      return await response.json();
    }
    
    // 如果今天没有，尝试获取最近几天的
    // 尝试昨天、前天等
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      try {
        const resp = await fetch(`/daily-${dateStr}.json`);
        if (resp.ok) {
          return await resp.json();
        }
      } catch {
        // 继续尝试下一天
      }
    }
    
    // 如果都失败了，使用嵌入的数据
    console.log('Using embedded daily data');
    return embeddedDailyData;
  } catch (error) {
    console.error('Failed to load daily news:', error);
    // 出错时也使用嵌入的数据
    return embeddedDailyData;
  }
}

/**
 * 获取指定日期的日报
 */
export async function getDailyByDate(date: string): Promise<DailyData | null> {
  try {
    const response = await fetch(`/data/daily/${date}.json`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error(`Failed to load daily news for ${date}:`, error);
    return null;
  }
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
