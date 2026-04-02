/**
 * Share Button Component
 *
 * Provides social sharing functionality with analytics tracking.
 * Supports: WeChat, Weibo, Twitter, LinkedIn, Copy Link
 */

import { useState, useCallback } from 'react';
import { Share2, Link, Check, MessageCircle, Twitter, Linkedin } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ShareButtonProps {
  contentType: 'course' | 'lesson' | 'certificate' | 'achievement';
  contentId: string;
  contentName: string;
  contentUrl?: string;
  contentDescription?: string;
  contentImage?: string;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

interface ShareMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  shareUrl: (url: string, title: string, description: string) => string;
}

const shareMethods: ShareMethod[] = [
  {
    id: 'wechat',
    name: '微信',
    icon: <MessageCircle className="w-5 h-5" />,
    color: '#07C160',
    shareUrl: (url, title) => `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    id: 'weibo',
    name: '微博',
    icon: <span className="text-lg font-bold">微</span>,
    color: '#E6162D',
    shareUrl: (url, title, desc) => `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}`,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: <Twitter className="w-5 h-5" />,
    color: '#1DA1F2',
    shareUrl: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Linkedin className="w-5 h-5" />,
    color: '#0A66C2',
    shareUrl: (url, title) => {
      void title; // LinkedIn share API doesn't use title
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    },
  },
];

export function ShareButton({
  contentType,
  contentId,
  contentName,
  contentUrl,
  variant = 'default',
  className = '',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { trackShare } = useAnalytics();

  const url = contentUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const title = contentName;

  const handleShare = useCallback(
    (method: ShareMethod) => {
      // Track the share event (method.id is guaranteed to be a valid shareMethod)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      trackShare(contentType, contentId, method.id as any, {
        contentName,
        shareUrl: url,
      });

      // Open share dialog
      const shareUrl = method.shareUrl(url, title, '');
      const width = 600;
      const height = 400;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      window.open(
        shareUrl,
        'share',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      setIsOpen(false);
    },
    [contentType, contentId, contentName, url, title, trackShare]
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);

      // Track the copy link event
      trackShare(contentType, contentId, 'copy_link', {
        contentName,
        shareUrl: url,
      });

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [contentType, contentId, contentName, url, trackShare]);

  const handleWeChatShare = useCallback(() => {
    // Track the share event
    trackShare(contentType, contentId, 'wechat', {
      contentName,
      shareUrl: url,
    });

    // For WeChat, we show a QR code or copy link option
    // In a real app, you'd use WeChat JS-SDK
    handleCopyLink();
  }, [contentType, contentId, contentName, url, trackShare, handleCopyLink]);

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors active:scale-95"
          aria-label="分享"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 py-2 w-40 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50">
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link className="w-4 h-4" />}
              {copied ? '已复制' : '复制链接'}
            </button>
            {shareMethods.slice(1).map((method) => (
              <button
                key={method.id}
                onClick={() => handleShare(method)}
                className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
              >
                {method.icon}
                {method.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors active:scale-95 flex items-center gap-1 text-sm"
          title="复制链接"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? '已复制' : '复制'}</span>
        </button>
        {shareMethods.slice(1).map((method) => (
          <button
            key={method.id}
            onClick={() => handleShare(method)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors active:scale-95"
            title={method.name}
            style={{ color: method.color }}
          >
            {method.icon}
          </button>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/20 transition-colors active:scale-95"
      >
        <Share2 className="w-4 h-4" />
        <span>分享</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 py-2 w-48 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50">
            <div className="px-4 py-2 text-xs text-white/40 uppercase tracking-wide">
              分享到
            </div>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link className="w-4 h-4" />}
              </div>
              <span>{copied ? '链接已复制!' : '复制链接'}</span>
            </button>

            {/* WeChat - special handling */}
            <button
              onClick={handleWeChatShare}
              className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: '#07C160' }}
              >
                <MessageCircle className="w-4 h-4" />
              </div>
              <span>微信好友</span>
            </button>

            {/* Other share methods */}
            {shareMethods.slice(1).map((method) => (
              <button
                key={method.id}
                onClick={() => handleShare(method)}
                className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-3"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: method.color }}
                >
                  {method.icon}
                </div>
                <span>{method.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Share Modal for more prominent sharing
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ShareButtonProps['contentType'];
  contentId: string;
  contentName: string;
  contentDescription?: string;
  contentImage?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentName,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { trackShare } = useAnalytics();

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${contentName} - LLM基础`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      trackShare(contentType, contentId, 'copy_link', { contentName });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [contentType, contentId, contentName, url, trackShare]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-xl font-bold mb-2">分享内容</h3>
        <p className="text-white/60 text-sm mb-6">
          {contentName}
        </p>

        {/* Share Buttons Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              {copied ? (
                <Check className="w-6 h-6 text-green-500" />
              ) : (
                <Link className="w-6 h-6" />
              )}
            </div>
            <span className="text-xs text-white/60">
              {copied ? '已复制' : '复制链接'}
            </span>
          </button>

          {/* WeChat */}
          <button
            onClick={() => {
              trackShare(contentType, contentId, 'wechat', { contentName });
              handleCopyLink();
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: '#07C160' }}
            >
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs text-white/60">微信</span>
          </button>

          {/* Weibo */}
          <button
            onClick={() => {
              trackShare(contentType, contentId, 'weibo', { contentName });
              window.open(
                `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(shareText)}`,
                'share',
                'width=600,height=400'
              );
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: '#E6162D' }}
            >
              微
            </div>
            <span className="text-xs text-white/60">微博</span>
          </button>

          {/* Twitter */}
          <button
            onClick={() => {
              trackShare(contentType, contentId, 'twitter', { contentName });
              window.open(
                `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
                'share',
                'width=600,height=400'
              );
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: '#1DA1F2' }}
            >
              <Twitter className="w-6 h-6" />
            </div>
            <span className="text-xs text-white/60">Twitter</span>
          </button>
        </div>

        {/* Link Preview */}
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-white/40 truncate">{url}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default ShareButton;