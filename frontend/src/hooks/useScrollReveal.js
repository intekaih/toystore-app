import { useEffect, useRef, useState } from 'react';

/**
 * Hook để tạo hiệu ứng scroll reveal
 * Khi phần tử vào viewport, sẽ thêm class để trigger animation
 * 
 * @param {Object} options - Tùy chọn
 * @param {number} options.threshold - Ngưỡng để trigger (0-1, default: 0.1)
 * @param {string} options.rootMargin - Margin của root (default: '0px')
 * @param {boolean} options.once - Chỉ trigger một lần (default: true)
 * @returns {Array} [ref, isVisible] - Ref để attach vào element và state isVisible
 */
const useScrollReveal = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = true,
  } = options;

  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Nếu đã animate và once = true, không cần observe nữa
    if (hasAnimated && once) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              setHasAnimated(true);
              observer.unobserve(element);
            }
          } else {
            if (!once) {
              setIsVisible(false);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, once, hasAnimated]);

  return [elementRef, isVisible];
};

export default useScrollReveal;

