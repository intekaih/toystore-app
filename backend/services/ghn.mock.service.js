/**
 * 🎭 GHN MOCK SERVICE
 * 
 * Service này giả lập GHN API cho môi trường development/testing
 * Quản lý trạng thái đơn hàng và timeline
 */

class GHNMockService {
  constructor() {
    // Lưu trữ trạng thái các đơn hàng mock
    // Key: ghnOrderCode, Value: { status, timeline, ... }
    this.mockOrders = new Map();
    
    // Trạng thái theo thứ tự từ đầu đến cuối
    this.statusFlow = [
      'ready_to_pick',      // Chờ lấy hàng
      'picking',            // Đang lấy hàng
      'picked',             // Đã lấy hàng
      'storing',            // Nhập kho
      'transporting',       // Đang luân chuyển
      'sorting',            // Đang phân loại
      'delivering',         // Đang giao hàng
      'delivered'           // Đã giao hàng
    ];
    
    console.log('🎭 GHN Mock Service initialized');
  }

  /**
   * Tạo đơn hàng mock mới
   * @param {string} ghnOrderCode - Mã vận đơn GHN
   * @param {Object} orderData - Thông tin đơn hàng
   */
  createMockOrder(ghnOrderCode, orderData = {}) {
    const now = new Date();
    const expectedDelivery = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 ngày
    
    const mockOrder = {
      orderCode: ghnOrderCode,
      status: 'ready_to_pick', // Bắt đầu từ trạng thái đầu tiên
      statusIndex: 0,
      expectedDeliveryTime: expectedDelivery,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: 'ready_to_pick',
          statusText: 'Chờ lấy hàng',
          time: now.toISOString(),
          location: 'Kho hàng',
          note: 'Đơn hàng đã được tạo và chờ shipper đến lấy'
        }
      ],
      ...orderData
    };
    
    this.mockOrders.set(ghnOrderCode, mockOrder);
    console.log(`🎭 Created mock order: ${ghnOrderCode} with status: ready_to_pick`);
    
    return mockOrder;
  }

  /**
   * Lấy thông tin đơn hàng mock
   * @param {string} ghnOrderCode - Mã vận đơn GHN
   */
  getMockOrder(ghnOrderCode) {
    return this.mockOrders.get(ghnOrderCode) || null;
  }

  /**
   * Chuyển đổi trạng thái đơn hàng sang trạng thái tiếp theo
   * @param {string} ghnOrderCode - Mã vận đơn GHN
   * @returns {Object} Thông tin đơn hàng sau khi chuyển trạng thái
   */
  advanceStatus(ghnOrderCode) {
    const order = this.mockOrders.get(ghnOrderCode);
    
    if (!order) {
      throw new Error(`Không tìm thấy đơn hàng mock: ${ghnOrderCode}`);
    }
    
    // Nếu đã ở trạng thái cuối cùng, không chuyển nữa
    if (order.statusIndex >= this.statusFlow.length - 1) {
      console.log(`🎭 Order ${ghnOrderCode} đã ở trạng thái cuối cùng: ${order.status}`);
      return order;
    }
    
    // Chuyển sang trạng thái tiếp theo
    order.statusIndex += 1;
    order.status = this.statusFlow[order.statusIndex];
    order.updatedAt = new Date();
    
    // Thêm vào timeline
    const statusText = this.getStatusText(order.status);
    const timelineEntry = {
      status: order.status,
      statusText: statusText,
      time: order.updatedAt.toISOString(),
      location: this.getLocationForStatus(order.status),
      note: this.getNoteForStatus(order.status)
    };
    
    order.timeline.push(timelineEntry);
    
    console.log(`🎭 Advanced order ${ghnOrderCode} to status: ${order.status} (${statusText})`);
    
    return order;
  }

  /**
   * Đặt trạng thái cụ thể cho đơn hàng
   * @param {string} ghnOrderCode - Mã vận đơn GHN
   * @param {string} status - Trạng thái muốn đặt
   */
  setStatus(ghnOrderCode, status) {
    const order = this.mockOrders.get(ghnOrderCode);
    
    if (!order) {
      throw new Error(`Không tìm thấy đơn hàng mock: ${ghnOrderCode}`);
    }
    
    const statusIndex = this.statusFlow.indexOf(status);
    if (statusIndex === -1) {
      throw new Error(`Trạng thái không hợp lệ: ${status}`);
    }
    
    order.status = status;
    order.statusIndex = statusIndex;
    order.updatedAt = new Date();
    
    // Thêm vào timeline nếu chưa có
    const hasStatusInTimeline = order.timeline.some(log => log.status === status);
    if (!hasStatusInTimeline) {
      const timelineEntry = {
        status: status,
        statusText: this.getStatusText(status),
        time: order.updatedAt.toISOString(),
        location: this.getLocationForStatus(status),
        note: this.getNoteForStatus(status)
      };
      order.timeline.push(timelineEntry);
    }
    
    console.log(`🎭 Set order ${ghnOrderCode} to status: ${status}`);
    
    return order;
  }

  /**
   * Lấy địa điểm tương ứng với trạng thái
   */
  getLocationForStatus(status) {
    const locationMap = {
      'ready_to_pick': 'Kho hàng',
      'picking': 'Kho hàng',
      'picked': 'Kho hàng',
      'storing': 'Kho trung chuyển',
      'transporting': 'Trên đường vận chuyển',
      'sorting': 'Trung tâm phân loại',
      'delivering': 'Đang giao hàng',
      'delivered': 'Đã giao hàng'
    };
    
    return locationMap[status] || 'Đang xử lý';
  }

  /**
   * Lấy ghi chú tương ứng với trạng thái
   */
  getNoteForStatus(status) {
    const noteMap = {
      'ready_to_pick': 'Đơn hàng đã được tạo và chờ shipper đến lấy',
      'picking': 'Shipper đang đến kho để lấy hàng',
      'picked': 'Shipper đã lấy hàng thành công',
      'storing': 'Hàng đã được nhập vào kho trung chuyển',
      'transporting': 'Hàng đang được vận chuyển đến khu vực giao hàng',
      'sorting': 'Hàng đang được phân loại tại trung tâm',
      'delivering': 'Shipper đang giao hàng đến địa chỉ người nhận',
      'delivered': 'Đã giao hàng thành công cho người nhận'
    };
    
    return noteMap[status] || '';
  }

  /**
   * Chuyển đổi trạng thái sang text tiếng Việt
   */
  getStatusText(status) {
    const statusMap = {
      'ready_to_pick': 'Chờ lấy hàng',
      'picking': 'Đang lấy hàng',
      'picked': 'Đã lấy hàng',
      'storing': 'Nhập kho',
      'transporting': 'Đang luân chuyển',
      'sorting': 'Đang phân loại',
      'delivering': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'delivery_fail': 'Giao hàng thất bại',
      'cancel': 'Đã hủy'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Lấy tất cả đơn hàng mock
   */
  getAllMockOrders() {
    return Array.from(this.mockOrders.values());
  }

  /**
   * Xóa đơn hàng mock (dùng cho testing)
   */
  deleteMockOrder(ghnOrderCode) {
    return this.mockOrders.delete(ghnOrderCode);
  }

  /**
   * Xóa tất cả đơn hàng mock
   */
  clearAll() {
    this.mockOrders.clear();
    console.log('🎭 Cleared all mock orders');
  }

  /**
   * Lấy danh sách trạng thái theo thứ tự
   */
  getStatusFlow() {
    return this.statusFlow;
  }
}

// Export singleton instance
module.exports = new GHNMockService();

