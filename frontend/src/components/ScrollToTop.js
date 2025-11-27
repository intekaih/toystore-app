import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Tự động scroll về đầu trang khi route hoặc query params thay đổi
 * Giải quyết vấn đề khi navigate từ cuối trang này sang trang khác
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll về đầu trang ngay lập tức khi pathname hoặc search params thay đổi
    // Điều này đảm bảo khi click link từ bất kỳ vị trí nào, trang mới sẽ hiển thị từ đầu
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Sử dụng 'instant' để scroll ngay lập tức, không có animation
    });
  }, [pathname, search]); // Kích hoạt khi pathname hoặc search params thay đổi

  return null; // Component này không render gì
};

export default ScrollToTop;

