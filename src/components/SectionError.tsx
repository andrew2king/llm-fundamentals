import { AlertTriangle, RefreshCcw, WifiOff, Clock, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionErrorProps {
  /** 错误类型 */
  type?: 'network' | 'timeout' | 'server' | 'unknown' | 'empty';
  /** Section 名称 */
  sectionName?: string;
  /** 自定义错误消息 */
  message?: string;
  /** 是否显示紧凑模式 */
  compact?: boolean;
  /** 重试回调 */
  onRetry?: () => void;
  /** 是否正在重试 */
  isRetrying?: boolean;
  /** 重试次数 */
  retryCount?: number;
  /** 额外类名 */
  className?: string;
}

/**
 * Section 错误显示组件
 * 提供友好的错误提示界面
 */
export default function SectionError({
  type = 'unknown',
  sectionName,
  message,
  compact = false,
  onRetry,
  isRetrying = false,
  retryCount = 0,
  className,
}: SectionErrorProps) {
  // 根据错误类型选择图标和标题
  const errorConfig = {
    network: {
      icon: WifiOff,
      title: '网络连接失败',
      defaultMessage: '无法连接到服务器，请检查您的网络连接后重试。',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/5',
      borderColor: 'border-orange-500/20',
    },
    timeout: {
      icon: Clock,
      title: '请求超时',
      defaultMessage: '服务器响应时间过长，请稍后重试。',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/5',
      borderColor: 'border-yellow-500/20',
    },
    server: {
      icon: AlertTriangle,
      title: '服务器错误',
      defaultMessage: '服务器暂时出现问题，我们正在努力修复。',
      color: 'text-red-400',
      bgColor: 'bg-red-500/5',
      borderColor: 'border-red-500/20',
    },
    unknown: {
      icon: AlertTriangle,
      title: '加载失败',
      defaultMessage: '内容加载时遇到了问题，请尝试刷新或继续浏览其他内容。',
      color: 'text-red-400',
      bgColor: 'bg-red-500/5',
      borderColor: 'border-red-500/20',
    },
    empty: {
      icon: Inbox,
      title: '暂无内容',
      defaultMessage: '该部分暂时没有数据，请稍后再来查看。',
      color: 'text-white/40',
      bgColor: 'bg-white/5',
      borderColor: 'border-white/10',
    },
  };

  const config = errorConfig[type];
  const IconComponent = config.icon;

  return (
    <section className={cn('relative', compact ? 'py-16' : 'py-32', className)}>
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={cn(
            'flex flex-col items-center justify-center text-center rounded-2xl border',
            compact ? 'p-6' : 'p-8',
            config.bgColor,
            config.borderColor
          )}
        >
          {/* Icon */}
          <IconComponent
            className={cn(
              compact ? 'w-10 h-10' : 'w-16 h-16',
              config.color,
              'mb-4'
            )}
          />

          {/* Title */}
          <h2
            className={cn(
              compact ? 'text-xl' : 'text-2xl',
              'font-bold mb-2 text-white'
            )}
          >
            {sectionName ? `${sectionName} - ${config.title}` : config.title}
          </h2>

          {/* Message */}
          <p className="text-white/60 mb-2 max-w-md">
            {message || config.defaultMessage}
          </p>

          {/* Retry info */}
          {retryCount > 0 && !isRetrying && (
            <p className="text-white/40 text-sm mb-4">
              已尝试重试 {retryCount} 次
            </p>
          )}

          {/* Retry button */}
          {onRetry && type !== 'empty' && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl',
                'bg-white/10 text-white font-medium',
                'hover:bg-white/20 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isRetrying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  正在重试...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4" />
                  重新加载
                </>
              )}
            </button>
          )}

          {/* Network status hint */}
          {type === 'network' && (
            <p className="text-white/40 text-xs mt-4">
              提示：请检查网络连接后点击重试按钮
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * 网络错误组件 - 便捷使用
 */
export function NetworkError(props: Omit<SectionErrorProps, 'type'>) {
  return <SectionError type="network" {...props} />;
}

/**
 * 空状态组件 - 便捷使用
 */
export function EmptyState(props: Omit<SectionErrorProps, 'type'>) {
  return <SectionError type="empty" {...props} />;
}

/**
 * 从错误判断类型
 */
export function getErrorType(error: Error): SectionErrorProps['type'] {
  const message = error.message.toLowerCase();

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    !navigator.onLine
  ) {
    return 'network';
  }

  if (message.includes('timeout') || message.includes('timed out')) {
    return 'timeout';
  }

  if (message.includes('500') || message.includes('server')) {
    return 'server';
  }

  return 'unknown';
}