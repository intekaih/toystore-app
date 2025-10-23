/**
 * useDebounce Hook
 * Custom hook for debouncing values (useful for search inputs)
 */

import { useState, useEffect } from 'react';
import { TIMEOUTS } from '../utils/constants';

/**
 * Hook để debounce value
 * @param {any} value - Giá trị cần debounce
 * @param {number} delay - Độ trễ (ms)
 * @returns {any} - Giá trị đã debounce
 */
export const useDebounce = (value, delay = TIMEOUTS.DEBOUNCE_DELAY) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout để update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: Clear timeout nếu value thay đổi trước khi delay hết
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
