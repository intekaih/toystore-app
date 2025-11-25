/**
 * 🚚 GIAO HÀNG NHANH (GHN) API CONFIGURATION
 * 
 * Tài liệu API: https://api.ghn.vn/home/docs/detail
 * 
 * CÁCH LẤY API KEY:
 * 1. Đăng ký tài khoản tại: https://saleronline.ghn.vn/
 * 2. Vào Cài đặt → Thiết lập Token
 * 3. Copy Token và Shop ID
 */

module.exports = {
  // ⚠️ LƯU Ý: Thay YOUR_TOKEN và YOUR_SHOP_ID bằng thông tin thật
  API_TOKEN: process.env.GHN_API_TOKEN || 'YOUR_GHN_API_TOKEN',
  SHOP_ID: process.env.GHN_SHOP_ID || 'YOUR_GHN_SHOP_ID',
  
  // ✅ ĐANG DÙNG: Sandbox/Dev để test
  BASE_URL: 'https://dev-online-gateway.ghn.vn/shiip/public-api',
  
  // 🚀 Production - Dùng khi lên thật (Đổi sau)
  // BASE_URL: 'https://online-gateway.ghn.vn/shiip/public-api',
  
  // Các endpoint cụ thể
  ENDPOINTS: {
    // Tính phí vận chuyển
    CALCULATE_FEE: '/v2/shipping-order/fee',
    
    // Tạo đơn vận chuyển
    CREATE_ORDER: '/v2/shipping-order/create',
    
    // Lấy thông tin đơn hàng
    GET_ORDER_INFO: '/v2/shipping-order/detail',
    
    // Tracking đơn hàng
    GET_ORDER_STATUS: '/v2/shipping-order/detail',
    
    // In phiếu giao hàng
    PRINT_ORDER: '/v2/a5/gen-token',
    
    // Hủy đơn
    CANCEL_ORDER: '/v2/shipping-order/cancel',
    
    // Lấy danh sách tỉnh/thành
    GET_PROVINCES: '/master-data/province',
    
    // Lấy danh sách quận/huyện
    GET_DISTRICTS: '/master-data/district',
    
    // Lấy danh sách phường/xã
    GET_WARDS: '/master-data/ward',
    
    // Lấy dịch vụ có sẵn
    GET_SERVICES: '/v2/shipping-order/available-services',
    
    // Tính thời gian giao hàng dự kiến
    GET_LEAD_TIME: '/v2/shipping-order/leadtime'
  },
  
  // Thông tin kho/địa chỉ lấy hàng mặc định
  DEFAULT_FROM_ADDRESS: {
    provinceId: 202, // Hà Nội
    districtId: 1482, // Quận Hoàn Kiếm
    wardCode: '10203', // Phường Hàng Bạc
    address: 'Số 1, Phường Hàng Bạc, Quận Hoàn Kiếm, Hà Nội' // ✅ ĐÃ SỬA CHO ĐỒNG NHẤT
  },
  
  // Thông tin shop
  SHOP_INFO: {
    name: 'ToyStore Shop',
    phone: '0987654321', // ✅ SĐT shop thật
    address: 'Số 1, Phường Hàng Bạc, Quận Hoàn Kiếm, Hà Nội'
  },
  
  // Các service ID của GHN
  SERVICES: {
    EXPRESS: 53320, // Hỏa tốc
    STANDARD: 53321 // Tiêu chuẩn
  },
  
  // Cấu hình mặc định
  DEFAULT_OPTIONS: {
    serviceTypeId: 2, // 2: Giao hàng tiêu chuẩn, 5: Giao hàng nhanh
    paymentTypeId: 1, // 1: Shop trả ship, 2: Người nhận trả
    requiredNote: 'KHONGCHOXEMHANG', // CHOXEMHANGKHONGTHU, CHOTHUHANG, KHONGCHOXEMHANG
    coupon: null, // Mã giảm giá (nếu có)
    insuranceValue: 0, // Giá trị bảo hiểm
    weight: 500, // Trọng lượng mặc định (gram)
    length: 20, // Chiều dài (cm)
    width: 15, // Chiều rộng (cm)
    height: 10 // Chiều cao (cm)
  },
  
  // Timeout cho API calls (ms)
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    maxRetries: 3,
    retryDelay: 1000 // ms
  },
  
  // Webhook URL (GHN sẽ gọi khi có cập nhật trạng thái)
  WEBHOOK_URL: process.env.GHN_WEBHOOK_URL || 'https://yourdomain.com/api/webhooks/ghn'
};
