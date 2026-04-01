import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface SectionErrorBoundaryProps {
  children: ReactNode;
  /** Section 名称，用于显示友好的错误信息 */
  sectionName?: string;
  /** 自定义错误回退组件 */
  fallback?: ReactNode;
  /** 重试回调 */
  onRetry?: () => void;
  /** 是否显示紧凑模式 */
  compact?: boolean;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Section 错误边界组件
 * 专为 section 级别错误隔离设计，防止单个 section 错误导致整页崩溃
 */
class SectionErrorBoundary extends Component<SectionErrorBoundaryProps, SectionErrorBoundaryState> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    // 记录错误日志
    console.error(`[${this.props.sectionName || 'Section'}] Error caught:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isCompact = this.props.compact;

      return (
        <section className={`relative ${isCompact ? 'py-16' : 'py-32'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className={`flex flex-col items-center justify-center text-center ${isCompact ? 'p-6' : 'p-8'} rounded-2xl bg-red-500/5 border border-red-500/20`}>
              <AlertTriangle className={` ${isCompact ? 'w-10 h-10' : 'w-16 h-16'} text-red-400 mb-4`} />
              <h2 className={` ${isCompact ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>
                {this.props.sectionName ? `${this.props.sectionName} 加载失败` : '内容加载失败'}
              </h2>
              <p className="text-white/60 mb-6 max-w-md">
                这个部分遇到了问题，但您仍可以继续浏览其他内容。
              </p>
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                重试加载
              </button>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;