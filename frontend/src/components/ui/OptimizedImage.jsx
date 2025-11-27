/**
 * 🚀 OptimizedImage Component
 * Tối ưu hiệu suất ảnh với:
 * - WebP format với fallback
 * - Lazy loading cho ảnh không trong viewport
 * - Responsive images với srcset + sizes
 * - CDN support
 * - Placeholder và error handling
 */

import React, { useState, useRef, useEffect } from 'react';
import config from '../../config';

const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  width,
  height,
  priority = false, // Ảnh quan trọng (LCP) - không lazy load
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  aspectRatio,
  objectFit = 'cover',
  fallback = '/barbie.jpg',
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Build full URL từ relative path
  const buildFullUrl = (url) => {
    if (!url) return fallback;
    
    // Nếu đã là full URL hoặc base64
    if (url.startsWith('http') || url.startsWith('data:image/')) {
      return url;
    }
    
    // Nếu là đường dẫn tương đối
    if (url.startsWith('/uploads/')) {
      return `${config.API_BASE_URL}${url}`;
    }
    
    // Fallback
    return url.startsWith('/') ? url : `${config.API_BASE_URL}/uploads/${url}`;
  };

  // Kiểm tra browser hỗ trợ WebP (cache kết quả)
  const [webPSupported, setWebPSupported] = useState(null);
  
  useEffect(() => {
    // Kiểm tra WebP support một lần
    if (webPSupported === null) {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const supported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      setWebPSupported(supported);
    }
  }, []);

  // Convert URL sang WebP format
  const getWebPUrl = (url) => {
    if (!url || url.startsWith('data:image/')) {
      return url;
    }
    
    // Nếu browser hỗ trợ WebP và URL là image file
    if (webPSupported && /\.(jpg|jpeg|png)$/i.test(url)) {
      // Thêm query param để backend convert sang WebP (nếu hỗ trợ)
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}format=webp&q=85`; // q=85 là quality
    }
    
    return url;
  };

  // Generate srcset cho responsive images
  const generateSrcSet = (baseUrl, isWebP = false) => {
    if (!baseUrl || baseUrl.startsWith('data:image/')) {
      return undefined;
    }

    // Các breakpoints cho responsive images (widths)
    const widths = [320, 640, 768, 1024, 1280, 1920];
    const separator = baseUrl.includes('?') ? '&' : '?';
    
    // Tạo srcset với các kích thước khác nhau
    // Backend có thể hỗ trợ query param ?w=WIDTH để resize
    const srcset = widths
      .map(w => {
        let url = baseUrl;
        if (isWebP && webPSupported) {
          url = getWebPUrl(baseUrl);
        }
        return `${url}${separator}w=${w}${isWebP && webPSupported ? '&format=webp&q=85' : ''} ${w}w`;
      })
      .join(', ');
    
    return srcset || undefined;
  };

  useEffect(() => {
    const fullUrl = buildFullUrl(src);
    setImageSrc(fullUrl);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    console.warn('❌ Lỗi load ảnh:', imageSrc);
    setHasError(true);
    
    // Fallback về ảnh mặc định
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    }
    
    if (onError) {
      onError(e);
    }
  };

  // Lazy loading: chỉ load khi vào viewport (trừ priority images)
  const loading = priority ? 'eager' : 'lazy';
  const fetchPriority = priority ? 'high' : 'auto';

  // Style cho aspect ratio
  const containerStyle = {
    position: 'relative',
    width: '100%',
    ...(aspectRatio && {
      aspectRatio: aspectRatio,
    }),
    ...(width && { width }),
    ...(height && { height }),
  };

  const imageStyle = {
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
  };

  return (
    <div style={containerStyle} className={className}>
      {/* Placeholder khi đang load */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
          style={{ zIndex: 1 }}
        />
      )}

      {/* Error placeholder */}
      {hasError && imageSrc === fallback && (
        <div
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          style={{ zIndex: 2 }}
        >
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Main image với WebP và srcset */}
      {imageSrc && (
        <picture>
          {/* WebP source với srcset - chỉ hiển thị nếu browser hỗ trợ */}
          {webPSupported && generateSrcSet(imageSrc, true) && (
            <source
              srcSet={generateSrcSet(imageSrc, true)}
              sizes={sizes}
              type="image/webp"
            />
          )}
          {/* Fallback image với srcset */}
          <img
            ref={imgRef}
            src={imageSrc}
            srcSet={generateSrcSet(imageSrc, false)}
            sizes={sizes}
            alt={alt}
            loading={loading}
            decoding="async"
            fetchpriority={fetchPriority}
            style={imageStyle}
            className={`w-full h-full ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </picture>
      )}
    </div>
  );
};

export default OptimizedImage;

