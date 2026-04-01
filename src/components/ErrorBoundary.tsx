import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  /** 错误级别：page 为页面级，section 为区块级 */
  level?: 'page' | 'section';
  /** 区块名称，用于显示更友好的错误信息 */
  sectionName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，防止整个页面崩溃
 *
 * 使用建议：
 * - 页面级：在 App.tsx 中包裹整个应用
 * - 区块级：在各个 Section 中使用 SectionErrorBoundary 或 ErrorBoundary level="section"
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const level = this.props.level || 'page';
    const sectionName = this.props.sectionName || '未知区块';

    if (level === 'page') {
      console.error('App ErrorBoundary caught a critical error:', error, errorInfo);
    } else {
      console.error(`[${sectionName}] Section ErrorBoundary caught an error:`, error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const level = this.props.level || 'page';
      const sectionName = this.props.sectionName;

      if (level === 'page') {
        // 页面级错误 - 更严重的显示
        return (
          <div className="fixed inset-0 bg-black flex items-center justify-center p-6">
            <div className="max-w-md text-center p-8 rounded-2xl bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-20 h-20 text-red-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">页面发生错误</h1>
              <p className="text-white/60 mb-6">
                应用遇到了一个严重问题。请尝试刷新页面，如果问题持续存在，请联系支持。
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  重试
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-spacex-orange text-white font-medium hover:bg-spacex-orange/80 transition-colors"
                >
                  刷新页面
                </button>
              </div>
            </div>
          </div>
        );
      }

      // 区块级错误 - 更温和的显示
      return (
        <section className="relative py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-red-500/5 border border-red-500/20">
              <AlertTriangle className="w-16 h-16 text-red-400 mb-6" />
              <h2 className="text-2xl font-bold mb-2">
                {sectionName ? `${sectionName} 加载失败` : '出错了'}
              </h2>
              <p className="text-white/60 mb-6 max-w-md">
                这个部分加载时遇到了问题。请尝试重试，或者继续浏览其他内容。
              </p>
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                重试
              </button>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;