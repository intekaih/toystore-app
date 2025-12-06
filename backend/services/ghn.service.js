/**
 * 🚚 GIAO HÀNG NHANH (GHN) SERVICE
 * 
 * Service này cung cấp các method để tương tác với API của GHN:
 * - Tính phí ship tự động
 * - Tạo đơn vận chuyển
 * - Tracking đơn hàng
 * - In phiếu giao hàng
 * - Hủy đơn
 */

const axios = require('axios');
const https = require('https');
const ghnConfig = require('../config/ghn.config');
const ghnMockService = require('./ghn.mock.service');

class GHNService {
  constructor() {
    this.baseURL = ghnConfig.BASE_URL;
    this.token = ghnConfig.API_TOKEN;
    this.shopId = ghnConfig.SHOP_ID;

    // ✅ THÊM: Mock mode cho testing (chỉ bật trong development)
    this.mockMode = process.env.GHN_MOCK_MODE === 'true' || false;

    // Tạo axios instance với config mặc định
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: ghnConfig.TIMEOUT || 60000, // ✅ Đồng bộ với config mới
      headers: {
        'Content-Type': 'application/json',
        'token': this.token,  // ✅ Sửa: 'token' thay vì 'Token'
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
        // 'ShopId': this.shopId  // ❌ Bỏ ShopId - không cần trong header
      },
      // ✅ THÊM: Cấu hình HTTPS agent để tránh ECONNRESET
      httpsAgent: new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 50,
        maxFreeSockets: 10,
        timeout: ghnConfig.TIMEOUT || 60000, // ✅ Đồng bộ với config mới
        rejectUnauthorized: true
      })
    });

    // ✅ THÊM: Request interceptor để retry khi gặp lỗi ECONNRESET
    this.client.interceptors.request.use(
      (config) => {
        // Đảm bảo User-Agent luôn có
        if (!config.headers['User-Agent']) {
          config.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // ✅ THÊM: Response interceptor để retry khi gặp lỗi network
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        
        // Nếu đã retry quá số lần cho phép, bỏ qua
        if (!config || config.__retryCount >= (ghnConfig.RETRY?.maxRetries || 3)) {
          return Promise.reject(error);
        }

        // Chỉ retry với các lỗi network (ECONNRESET, ETIMEDOUT, ECONNREFUSED)
        const isNetworkError = 
          error.code === 'ECONNRESET' ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ENOTFOUND' ||
          error.message?.includes('ECONNRESET') ||
          error.message?.includes('timeout');

        if (isNetworkError) {
          config.__retryCount = config.__retryCount || 0;
          config.__retryCount += 1;

          // Exponential backoff: delay tăng dần
          const delay = (ghnConfig.RETRY?.retryDelay || 2000) * Math.pow(2, config.__retryCount - 1);
          
          console.log(`🔄 Retry request (${config.__retryCount}/${ghnConfig.RETRY?.maxRetries || 3}) sau ${delay}ms...`, error.code || error.message);

          // Đợi trước khi retry
          await new Promise(resolve => setTimeout(resolve, delay));

          // Retry request
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );

    console.log('🔧 GHN Service initialized:');
    console.log('   Base URL:', this.baseURL);
    console.log('   Token:', this.token ? `${this.token.substring(0, 10)}...` : 'MISSING');
    console.log('   Shop ID:', this.shopId);
    console.log('   Mock Mode:', this.mockMode ? '✅ ENABLED (Testing)' : '❌ DISABLED (Production)');
  }

  /**
   * 💰 TÍNH PHÍ VẬN CHUYỂN
   * 
   * @param {Object} params
   * @param {number} params.toDistrictId - ID quận/huyện đích
   * @param {string} params.toWardCode - Mã phường/xã đích
   * @param {number} params.weight - Trọng lượng (gram)
   * @param {number} params.insuranceValue - Giá trị bảo hiểm
   * @returns {Promise<Object>} { total, service_fee, insurance_fee, etc. }
   */
  async calculateShippingFee(params) {
    try {
      const {
        toDistrictId,
        toWardCode,
        weight = ghnConfig.DEFAULT_OPTIONS.weight,
        insuranceValue = 0,
        serviceTypeId = ghnConfig.DEFAULT_OPTIONS.serviceTypeId
      } = params;

      const payload = {
        service_type_id: serviceTypeId,
        insurance_value: insuranceValue,
        coupon: null,
        from_district_id: ghnConfig.DEFAULT_FROM_ADDRESS.districtId,
        to_district_id: toDistrictId,
        to_ward_code: toWardCode,
        weight: weight,
        length: ghnConfig.DEFAULT_OPTIONS.length,
        width: ghnConfig.DEFAULT_OPTIONS.width,
        height: ghnConfig.DEFAULT_OPTIONS.height
      };

      console.log('📊 Tính phí ship GHN:', payload);

      const response = await this.client.post(
        ghnConfig.ENDPOINTS.CALCULATE_FEE,
        payload
      );

      if (response.data.code === 200) {
        console.log('✅ Phí ship:', response.data.data.total);
        return {
          success: true,
          data: {
            total: response.data.data.total,
            serviceFee: response.data.data.service_fee,
            insuranceFee: response.data.data.insurance_fee,
            pickStationFee: response.data.data.pick_station_fee,
            couponValue: response.data.data.coupon_value,
            r2sFee: response.data.data.r2s_fee
          }
        };
      }

      throw new Error(response.data.message || 'Không thể tính phí ship');

    } catch (error) {
      console.error('❌ Lỗi tính phí ship GHN:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error.response?.data
      };
    }
  }

  /**
   * 📦 TẠO ĐƠN VẬN CHUYỂN TRÊN GHN
   * 
   * @param {Object} orderData
   * @param {number} orderData.orderId - ID đơn hàng trong DB
   * @param {string} orderData.orderCode - Mã đơn hàng (HD20251115001)
   * @param {Object} orderData.customer - Thông tin khách hàng
   * @param {Array} orderData.items - Danh sách sản phẩm
   * @param {number} orderData.totalAmount - Tổng tiền đơn hàng
   * @returns {Promise<Object>} { order_code, expected_delivery_time, etc. }
   */
  async createShippingOrder(orderData) {
    try {
      // ✅ MOCK MODE: Trả về dữ liệu giả cho testing
      if (this.mockMode) {
        console.log('🎭 MOCK MODE: Giả lập tạo đơn GHN thành công');

        // ✅ SỬA: Trả về Date object thay vì ISO string
        const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const ghnOrderCode = `MOCK${Date.now()}`;

        // Tạo mock order trong mock service
        ghnMockService.createMockOrder(ghnOrderCode, {
          expectedDeliveryTime: deliveryDate
        });

        return {
          success: true,
          data: {
            ghnOrderCode: ghnOrderCode, // Mã vận đơn giả
            expectedDeliveryTime: deliveryDate, // ✅ Trả về Date object
            sortCode: 'MOCK-SORT',
            transType: 'truck',
            totalFee: 30000,
            feeDetails: {
              main_service: 25000,
              insurance: 5000
            }
          }
        };
      }

      const {
        orderId,
        orderCode,
        customer,
        items,
        totalAmount,
        codAmount = 0, // Số tiền thu hộ (COD)
        note = '',
        weight = ghnConfig.DEFAULT_OPTIONS.weight
      } = orderData;

      // Validate dữ liệu
      if (!customer.districtId || !customer.wardCode) {
        throw new Error('Thiếu thông tin địa chỉ giao hàng (districtId, wardCode)');
      }

      // Chuẩn bị payload
      const payload = {
        payment_type_id: codAmount > 0 ? 2 : 1, // 1: Shop trả, 2: Người nhận trả
        note: note || `Đơn hàng ${orderCode}`,
        required_note: ghnConfig.DEFAULT_OPTIONS.requiredNote,
        return_phone: ghnConfig.SHOP_INFO.phone,
        return_address: ghnConfig.SHOP_INFO.address,
        return_district_id: ghnConfig.DEFAULT_FROM_ADDRESS.districtId,
        return_ward_code: ghnConfig.DEFAULT_FROM_ADDRESS.wardCode,
        client_order_code: orderCode, // Mã đơn hàng của shop
        to_name: customer.name,
        to_phone: customer.phone,
        to_address: customer.address,
        to_ward_code: customer.wardCode,
        to_district_id: customer.districtId,
        cod_amount: codAmount, // Số tiền thu hộ
        content: `Đơn hàng ${orderCode} - ToyStore`,
        weight: weight,
        length: ghnConfig.DEFAULT_OPTIONS.length,
        width: ghnConfig.DEFAULT_OPTIONS.width,
        height: ghnConfig.DEFAULT_OPTIONS.height,
        insurance_value: Math.min(totalAmount, 5000000), // Tối đa 5 triệu
        service_type_id: ghnConfig.DEFAULT_OPTIONS.serviceTypeId,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      console.log('📦 Tạo đơn GHN:', payload);

      const response = await this.client.post(
        ghnConfig.ENDPOINTS.CREATE_ORDER,
        payload
      );

      if (response.data.code === 200) {
        console.log('✅ Tạo đơn GHN thành công:', response.data.data.order_code);
        return {
          success: true,
          data: {
            ghnOrderCode: response.data.data.order_code, // Mã vận đơn GHN
            expectedDeliveryTime: response.data.data.expected_delivery_time,
            sortCode: response.data.data.sort_code,
            transType: response.data.data.trans_type,
            totalFee: response.data.data.total_fee,
            feeDetails: response.data.data.fee
          }
        };
      }

      throw new Error(response.data.message || 'Không thể tạo đơn GHN');

    } catch (error) {
      console.error('❌ Lỗi tạo đơn GHN:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error.response?.data
      };
    }
  }

  /**
   * 🔍 LẤY THÔNG TIN ĐơN HÀNG (TRACKING)
   * 
   * @param {string} orderCode - Mã vận đơn GHN
   * @returns {Promise<Object>} Thông tin chi tiết đơn hàng
   */
  async getOrderInfo(orderCode) {
    try {
      // ✅ MOCK MODE: Lấy từ mock service
      if (this.mockMode) {
        console.log('🎭 MOCK MODE: Lấy thông tin đơn hàng:', orderCode);

        let mockOrder = ghnMockService.getMockOrder(orderCode);

        // Nếu chưa có trong mock service, tạo mới (có thể đơn hàng được tạo từ trước)
        if (!mockOrder) {
          console.log('🎭 Tạo mock order mới cho:', orderCode);
          mockOrder = ghnMockService.createMockOrder(orderCode);
        }

        return {
          success: true,
          data: {
            orderCode: mockOrder.orderCode,
            status: mockOrder.status,
            statusText: ghnMockService.getStatusText(mockOrder.status),
            expectedDeliveryTime: mockOrder.expectedDeliveryTime,
            leadTime: null,
            sortCode: null,
            logs: mockOrder.timeline || [] // Lịch sử trạng thái
          }
        };
      }

      // Production mode: Gọi API thật
      const response = await this.client.post(
        ghnConfig.ENDPOINTS.GET_ORDER_INFO,
        { order_code: orderCode }
      );

      if (response.data.code === 200) {
        const order = response.data.data;
        return {
          success: true,
          data: {
            orderCode: order.order_code,
            status: order.status, // ready_to_pick, picking, delivering, delivered, return, etc.
            statusText: this.getStatusText(order.status),
            expectedDeliveryTime: order.expected_delivery_time,
            leadTime: order.leadtime,
            sortCode: order.sort_code,
            logs: order.log || [] // Lịch sử trạng thái
          }
        };
      }

      throw new Error(response.data.message || 'Không tìm thấy đơn hàng');

    } catch (error) {
      console.error('❌ Lỗi lấy thông tin đơn GHN:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * 🖨️ LẤY TOKEN IN PHIẾU GIAO HÀNG
   * 
   * @param {Array<string>} orderCodes - Danh sách mã vận đơn
   * @returns {Promise<Object>} Token để in phiếu
   */
  async getPrintToken(orderCodes) {
    try {
      const response = await this.client.post(
        ghnConfig.ENDPOINTS.PRINT_ORDER,
        { order_codes: orderCodes }
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: {
            token: response.data.data.token,
            printUrl: `https://online-gateway.ghn.vn/a5/public-api/printA5?token=${response.data.data.token}`
          }
        };
      }

      throw new Error(response.data.message || 'Không thể lấy token in');

    } catch (error) {
      console.error('❌ Lỗi lấy token in:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * ❌ HỦY ĐƠN HÀNG
   * 
   * @param {Array<string>} orderCodes - Danh sách mã vận đơn cần hủy
   * @returns {Promise<Object>}
   */
  async cancelOrder(orderCodes) {
    try {
      const response = await this.client.post(
        ghnConfig.ENDPOINTS.CANCEL_ORDER,
        { order_codes: orderCodes }
      );

      if (response.data.code === 200) {
        console.log('✅ Đã hủy đơn GHN:', orderCodes);
        return {
          success: true,
          message: 'Đã hủy đơn thành công'
        };
      }

      throw new Error(response.data.message || 'Không thể hủy đơn');

    } catch (error) {
      console.error('❌ Lỗi hủy đơn GHN:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * 🗺️ LẤY DANH SÁCH TỈNH/THÀNH PHỐ
   */
  async getProvinces() {
    try {
      // ✅ THÊM: Log để debug
      console.log('📡 Đang gọi GHN API để lấy danh sách tỉnh/thành...');
      
      const response = await this.client.get(ghnConfig.ENDPOINTS.GET_PROVINCES, {
        timeout: ghnConfig.TIMEOUT || 60000, // ✅ Đồng bộ với config mới
        // ✅ THÊM: Validate status để tránh lỗi ẩn
        validateStatus: (status) => status < 500
      });

      // ✅ CẢI THIỆN: Kiểm tra response data
      if (response.data && response.data.code === 200 && response.data.data) {
        console.log(`✅ Lấy thành công ${response.data.data.length} tỉnh/thành`);
        return {
          success: true,
          data: response.data.data.map(p => ({
            provinceId: p.ProvinceID,
            provinceName: p.ProvinceName,
            code: p.Code
          }))
        };
      }

      // ✅ CẢI THIỆN: Xử lý lỗi từ API
      const errorMessage = response.data?.message || response.data?.msg || 'Không thể lấy danh sách tỉnh/thành';
      console.error('❌ GHN API trả về lỗi:', response.data);
      throw new Error(errorMessage);
      
    } catch (error) {
      // ✅ CẢI THIỆN: Log chi tiết hơn
      if (error.code === 'ECONNRESET') {
        console.error('❌ Lỗi lấy tỉnh/thành: Kết nối bị reset (ECONNRESET)');
        console.error('   Đã thử retry tự động. Nếu vẫn lỗi, vui lòng kiểm tra:');
        console.error('   1. Kết nối internet');
        console.error('   2. GHN API có đang hoạt động không');
        console.error('   3. Token API có hợp lệ không');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('❌ Lỗi lấy tỉnh/thành: Timeout - API không phản hồi');
      } else if (error.response) {
        console.error('❌ Lỗi lấy tỉnh/thành: API trả về lỗi', error.response.status, error.response.data);
      } else {
        console.error('❌ Lỗi lấy tỉnh/thành:', error.message || error);
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Lỗi không xác định khi lấy danh sách tỉnh/thành',
        error: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * 🗺️ LẤY DANH SÁCH QUẬN/HUYỆN
   * 
   * @param {number} provinceId - ID tỉnh/thành
   */
  async getDistricts(provinceId) {
    try {
      console.log(`📡 Đang gọi GHN API để lấy danh sách quận/huyện (provinceId: ${provinceId})...`);
      
      const response = await this.client.post(
        ghnConfig.ENDPOINTS.GET_DISTRICTS,
        { province_id: provinceId },
        {
          timeout: ghnConfig.TIMEOUT || 60000, // ✅ Đồng bộ với config mới
          validateStatus: (status) => status < 500
        }
      );

      if (response.data && response.data.code === 200 && response.data.data) {
        console.log(`✅ Lấy thành công ${response.data.data.length} quận/huyện`);
        return {
          success: true,
          data: response.data.data.map(d => ({
            districtId: d.DistrictID,
            districtName: d.DistrictName,
            code: d.Code
          }))
        };
      }

      const errorMessage = response.data?.message || response.data?.msg || 'Không thể lấy danh sách quận/huyện';
      throw new Error(errorMessage);
      
    } catch (error) {
      if (error.code === 'ECONNRESET') {
        console.error('❌ Lỗi lấy quận/huyện: Kết nối bị reset (ECONNRESET)');
      } else if (error.response) {
        console.error('❌ Lỗi lấy quận/huyện: API trả về lỗi', error.response.status, error.response.data);
      } else {
        console.error('❌ Lỗi lấy quận/huyện:', error.message || error);
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Lỗi không xác định khi lấy danh sách quận/huyện',
        error: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * 🗺️ LẤY DANH SÁCH PHƯỜNG/XÃ
   * 
   * @param {number} districtId - ID quận/huyện
   */
  async getWards(districtId) {
    try {
      console.log(`📡 Đang gọi GHN API để lấy danh sách phường/xã (districtId: ${districtId})...`);
      
      const response = await this.client.post(
        ghnConfig.ENDPOINTS.GET_WARDS,
        { district_id: districtId },
        {
          timeout: ghnConfig.TIMEOUT || 60000, // ✅ Đồng bộ với config mới
          validateStatus: (status) => status < 500
        }
      );

      if (response.data && response.data.code === 200 && response.data.data) {
        console.log(`✅ Lấy thành công ${response.data.data.length} phường/xã`);
        return {
          success: true,
          data: response.data.data.map(w => ({
            wardCode: w.WardCode,
            wardName: w.WardName
          }))
        };
      }

      const errorMessage = response.data?.message || response.data?.msg || 'Không thể lấy danh sách phường/xã';
      throw new Error(errorMessage);
      
    } catch (error) {
      if (error.code === 'ECONNRESET') {
        console.error('❌ Lỗi lấy phường/xã: Kết nối bị reset (ECONNRESET)');
      } else if (error.response) {
        console.error('❌ Lỗi lấy phường/xã: API trả về lỗi', error.response.status, error.response.data);
      } else {
        console.error('❌ Lỗi lấy phường/xã:', error.message || error);
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Lỗi không xác định khi lấy danh sách phường/xã',
        error: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * 📊 CHUYỂN ĐỔI TRẠNG THÁI GHN SANG TEXT
   */
  getStatusText(status) {
    const statusMap = {
      'ready_to_pick': 'Chờ lấy hàng',
      'picking': 'Đang lấy hàng',
      'cancel': 'Đã hủy',
      'money_collect_picking': 'Đang thu tiền người gửi',
      'picked': 'Đã lấy hàng',
      'storing': 'Nhập kho',
      'transporting': 'Đang luân chuyển',
      'sorting': 'Đang phân loại',
      'delivering': 'Đang giao hàng',
      'money_collect_delivering': 'Đang thu tiền người nhận',
      'delivered': 'Đã giao hàng',
      'delivery_fail': 'Giao hàng thất bại',
      'waiting_to_return': 'Chờ trả hàng',
      'return': 'Trả hàng',
      'return_transporting': 'Đang luân chuyển hàng trả',
      'return_sorting': 'Đang phân loại hàng trả',
      'returning': 'Đang trả hàng',
      'return_fail': 'Trả hàng thất bại',
      'returned': 'Đã trả hàng',
      'exception': 'Đơn hàng ngoại lệ',
      'damage': 'Hàng bị hư hỏng',
      'lost': 'Thất lạc'
    };

    return statusMap[status] || status;
  }
}

// Export singleton instance
module.exports = new GHNService();
