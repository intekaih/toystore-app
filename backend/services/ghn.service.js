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
      timeout: ghnConfig.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'token': this.token,  // ✅ Sửa: 'token' thay vì 'Token'
        // 'ShopId': this.shopId  // ❌ Bỏ ShopId - không cần trong header
      }
    });

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
      const response = await this.client.get(ghnConfig.ENDPOINTS.GET_PROVINCES);

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data.map(p => ({
            provinceId: p.ProvinceID,
            provinceName: p.ProvinceName,
            code: p.Code
          }))
        };
      }

      throw new Error('Không thể lấy danh sách tỉnh/thành');
    } catch (error) {
      console.error('❌ Lỗi lấy tỉnh/thành:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * 🗺️ LẤY DANH SÁCH QUẬN/HUYỆN
   * 
   * @param {number} provinceId - ID tỉnh/thành
   */
  async getDistricts(provinceId) {
    try {
      const response = await this.client.post(
        ghnConfig.ENDPOINTS.GET_DISTRICTS,
        { province_id: provinceId }
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data.map(d => ({
            districtId: d.DistrictID,
            districtName: d.DistrictName,
            code: d.Code
          }))
        };
      }

      throw new Error('Không thể lấy danh sách quận/huyện');
    } catch (error) {
      console.error('❌ Lỗi lấy quận/huyện:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * 🗺️ LẤY DANH SÁCH PHƯỜNG/XÃ
   * 
   * @param {number} districtId - ID quận/huyện
   */
  async getWards(districtId) {
    try {
      const response = await this.client.post(
        ghnConfig.ENDPOINTS.GET_WARDS,
        { district_id: districtId }
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data.map(w => ({
            wardCode: w.WardCode,
            wardName: w.WardName
          }))
        };
      }

      throw new Error('Không thể lấy danh sách phường/xã');
    } catch (error) {
      console.error('❌ Lỗi lấy phường/xã:', error.message);
      return { success: false, message: error.message };
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
