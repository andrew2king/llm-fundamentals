/**
 * Optimized Image Component
 *
 * Features:
 * - WebP format with fallback
 * - Lazy loading for non-critical images
 * - Placeholder/blur effect during loading
 * - Width/height attributes to prevent CLS
 * - Priority loading for critical images
 */

import { useState, useRef } from 'react';

// Image dimensions configuration - prevents CLS by specifying sizes upfront
export const IMAGE_DIMENSIONS = {
  'hero-bg': { width: 1920, height: 1080 },
  'hero-float': { width: 400, height: 400 },
  'llm-concept': { width: 600, height: 400 },
  'training-data': { width: 1920, height: 1080 },
  'transformer-arch': { width: 800, height: 600 },
  'applications': { width: 1920, height: 1080 },
} as const;

// Image optimization configuration
export const IMAGE_CONFIG = {
  // Critical images that should preload (LCP candidates)
  criticalImages: ['hero-bg'],
  // Images that should use lazy loading
  lazyImages: ['hero-float', 'llm-concept', 'training-data', 'transformer-arch', 'applications'],
  // Background images (low opacity, can be lazy loaded)
  backgroundImages: ['training-data', 'applications'],
} as const;

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  placeholder?: boolean;
  fadeIn?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  'aria-hidden'?: boolean;
}

/**
 * Get WebP version path for an image
 * Assumes WebP versions exist alongside original images
 */
function getWebPPath(originalPath: string): string {
  // Replace extension with .webp
  return originalPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

/**
 * Extract image name from path for dimension lookup
 */
function getImageName(path: string): string {
  const filename = path.split('/').pop() || '';
  return filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
}

/**
 * Optimized Image Component with WebP support, lazy loading, and placeholder
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  placeholder = true,
  fadeIn = true,
  style,
  onLoad,
  onError,
  'aria-hidden': ariaHidden,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useWebP, setUseWebP] = useState(true); // WebP is widely supported
  const imgRef = useRef<HTMLImageElement>(null);

  // Get dimensions from config if not provided
  const imageName = getImageName(src);
  const configDimensions = IMAGE_DIMENSIONS[imageName as keyof typeof IMAGE_DIMENSIONS];
  const finalWidth = width || configDimensions?.width;
  const finalHeight = height || configDimensions?.height;

  // Determine loading strategy
  const effectiveLoading = priority ? 'eager' : loading;

  // Handle successful load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle error - fallback to original format
  const handleError = () => {
    if (useWebP) {
      // WebP failed, try original format
      setUseWebP(false);
    } else {
      setHasError(true);
      onError?.();
    }
  };

  // Get the actual source to use
  const actualSrc = useWebP ? getWebPPath(src) : src;

  // Placeholder styles
  const placeholderStyle: React.CSSProperties = placeholder && !isLoaded ? {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    filter: 'blur(10px)',
    transition: 'filter 0.3s ease-out, opacity 0.3s ease-out',
  } : {};

  // Fade in animation
  const fadeInStyle: React.CSSProperties = fadeIn ? {
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.5s ease-out',
  } : {};

  // Combined styles
  const combinedStyle: React.CSSProperties = {
    ...placeholderStyle,
    ...fadeInStyle,
    ...style,
  };

  return (
    <img
      ref={imgRef}
      src={hasError ? src : actualSrc}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      loading={effectiveLoading}
      decoding="async"
      className={className}
      style={combinedStyle}
      onLoad={handleLoad}
      onError={handleError}
      aria-hidden={ariaHidden}
      // Fallback src for browsers that don't support picture element
      {...(useWebP && !hasError && {
        onErrorCapture: handleError,
      })}
    />
  );
}

/**
 * Picture element with WebP source and fallback
 * More robust WebP support using the picture element
 */
export function PictureImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  placeholder = true,
  fadeIn = true,
  style,
  onLoad,
  onError,
  'aria-hidden': ariaHidden,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imageName = getImageName(src);
  const configDimensions = IMAGE_DIMENSIONS[imageName as keyof typeof IMAGE_DIMENSIONS];
  const finalWidth = width || configDimensions?.width;
  const finalHeight = height || configDimensions?.height;
  const effectiveLoading = priority ? 'eager' : loading;

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const placeholderStyle: React.CSSProperties = placeholder && !isLoaded ? {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    filter: 'blur(10px)',
  } : {};

  const fadeInStyle: React.CSSProperties = fadeIn ? {
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.5s ease-out',
  } : {};

  const combinedStyle: React.CSSProperties = {
    ...placeholderStyle,
    ...fadeInStyle,
    ...style,
  };

  const webpSrc = getWebPPath(src);

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <source srcSet={src} type={`image/${src.endsWith('.png') ? 'png' : 'jpeg'}`} />
      <img
        src={src}
        alt={alt}
        width={finalWidth}
        height={finalHeight}
        loading={effectiveLoading}
        decoding="async"
        className={className}
        style={combinedStyle}
        onLoad={handleLoad}
        onError={onError}
        aria-hidden={ariaHidden}
      />
    </picture>
  );
}

/**
 * Background Image Component
 * For images used as backgrounds with overlay effects
 */
export function BackgroundImage({
  src,
  alt = '',
  opacity = 0.2,
  gradientOverlay = 'from-black via-black/95 to-black',
  className = '',
  priority = false,
  children,
}: {
  src: string;
  alt?: string;
  opacity?: number;
  gradientOverlay?: string;
  className?: string;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  const imageName = getImageName(src);
  const configDimensions = IMAGE_DIMENSIONS[imageName as keyof typeof IMAGE_DIMENSIONS];

  return (
    <div className={`absolute inset-0 ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={configDimensions?.width}
        height={configDimensions?.height}
        className="w-full h-full object-cover"
        style={{ opacity }}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        placeholder={false}
        fadeIn={false}
        aria-hidden
      />
      <div className={`absolute inset-0 bg-gradient-to-b ${gradientOverlay}`} />
      {children}
    </div>
  );
}