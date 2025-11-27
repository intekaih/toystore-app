/**
 * 🔄 GHN Status Sync Helper
 * 
 * Helper functions để đồng bộ trạng thái GHN với trạng thái đơn hàng
 * Logic thực tế như các ứng dụng thương mại điện tử
 */

const db = require('../models');
const { OrderStateContext } = require('../states/OrderState');

/**
 * Mapping trạng thái GHN sang trạng thái đơn hàng
 * Logic thực tế:
 * - ready_to_pick, picking: Không đổi trạng thái đơn hàng (vẫn đang đóng gói/chờ lấy)
 * - picked: Shipper đã lấy hàng → chuyển sang "Đang giao hàng"
 * - delivering: Đang giao → giữ "Đang giao hàng"
 * - delivered: Đã giao → chuyển sang "Đã giao hàng"
 * - delivery_fail: Giao thất bại → "Giao hàng thất bại"
 */
const GHN_TO_ORDER_STATUS_MAP = {
  'ready_to_pick': null,        // Không đổi (vẫn đang đóng gói)
  'picking': null,              // Không đổi (vẫn đang đóng gói)
  'picked': 'Đang giao hàng',   // ✅ Shipper đã lấy hàng → bắt đầu giao
  'storing': null,              // Không đổi (trung gian)
  'transporting': null,         // Không đổi (trung gian)
  'sorting': null,              // Không đổi (trung gian)
  'delivering': null,           // Không đổi (đã ở "Đang giao hàng")
  'delivered': 'Đã giao hàng',  // ✅ Giao thành công
  'delivery_fail': 'Giao hàng thất bại', // ❌ Giao thất bại
  'return': 'Giao hàng thất bại', // ❌ Hoàn trả
  'returned': 'Đã hủy',         // ❌ Đã hoàn về shop
  'cancel': 'Đã hủy'            // ❌ Đơn bị hủy
};

/**
 * Kiểm tra có cần chuyển trạng thái đơn hàng không
 * @param {string} ghnStatus - Trạng thái GHN
 * @returns {string|null} Trạng thái đơn hàng mới hoặc null nếu không cần đổi
 */
function getOrderStatusFromGHN(ghnStatus) {
  return GHN_TO_ORDER_STATUS_MAP[ghnStatus] || null;
}

/**
 * Kiểm tra có thể chuyển trạng thái đơn hàng từ trạng thái hiện tại không
 * @param {string} currentOrderStatus - Trạng thái đơn hàng hiện tại
 * @param {string} targetOrderStatus - Trạng thái đơn hàng muốn chuyển đến
 * @returns {boolean}
 */
function canTransitionOrderStatus(currentOrderStatus, targetOrderStatus) {
  // Logic đặc biệt cho picked → Đang giao hàng
  if (targetOrderStatus === 'Đang giao hàng') {
    // Có thể chuyển từ "Đang đóng gói" hoặc "Sẵn sàng giao hàng"
    return ['Đang đóng gói', 'Sẵn sàng giao hàng'].includes(currentOrderStatus);
  }
  
  // Logic đặc biệt cho delivered → Đã giao hàng
  if (targetOrderStatus === 'Đã giao hàng') {
    // Chỉ có thể chuyển từ "Đang giao hàng"
    return currentOrderStatus === 'Đang giao hàng';
  }
  
  // Logic đặc biệt cho delivery_fail → Giao hàng thất bại
  if (targetOrderStatus === 'Giao hàng thất bại') {
    // Có thể chuyển từ "Đang giao hàng"
    return currentOrderStatus === 'Đang giao hàng';
  }
  
  return false;
}

/**
 * Đồng bộ trạng thái GHN với trạng thái đơn hàng
 * @param {Object} hoaDon - Đơn hàng
 * @param {string} ghnStatus - Trạng thái GHN mới
 * @param {Object} transaction - Database transaction
 * @param {string} reason - Lý do thay đổi (optional)
 * @returns {Promise<Object>} { updated: boolean, orderStatus: string|null, message: string }
 */
async function syncGHNStatusToOrder(hoaDon, ghnStatus, transaction = null, reason = null) {
  try {
    const targetOrderStatus = getOrderStatusFromGHN(ghnStatus);
    
    // Nếu không cần chuyển trạng thái đơn hàng
    if (!targetOrderStatus) {
      return {
        updated: false,
        orderStatus: hoaDon.TrangThai,
        message: `Trạng thái GHN "${ghnStatus}" không yêu cầu thay đổi trạng thái đơn hàng`
      };
    }
    
    // Kiểm tra có thể chuyển không
    if (!canTransitionOrderStatus(hoaDon.TrangThai, targetOrderStatus)) {
      return {
        updated: false,
        orderStatus: hoaDon.TrangThai,
        message: `Không thể chuyển từ "${hoaDon.TrangThai}" sang "${targetOrderStatus}"`
      };
    }
    
    // Nếu đã ở trạng thái đúng rồi
    if (hoaDon.TrangThai === targetOrderStatus) {
      return {
        updated: false,
        orderStatus: hoaDon.TrangThai,
        message: `Đơn hàng đã ở trạng thái "${targetOrderStatus}"`
      };
    }
    
    // Reload hoaDon để có dữ liệu mới nhất
    await hoaDon.reload({ transaction });
    
    // Chuyển trạng thái đơn hàng
    const orderState = new OrderStateContext(hoaDon);
    
    const additionalData = {
      GhiChu: hoaDon.GhiChu 
        ? `${hoaDon.GhiChu} | [GHN Sync] Trạng thái GHN: ${ghnStatus}${reason ? ` - ${reason}` : ''}` 
        : `[GHN Sync] Trạng thái GHN: ${ghnStatus}${reason ? ` - ${reason}` : ''}`
    };
    
    // Nếu giao thành công, cập nhật NgayGiaoThanhCong
    if (targetOrderStatus === 'Đã giao hàng') {
      additionalData.NgayGiaoThanhCong = new Date();
    }
    
    const oldOrderStatus = hoaDon.TrangThai;
    
    // Thêm thông tin vào additionalData để OrderStateContext ghi lịch sử
    additionalData.NguoiThayDoi = 'Hệ thống';
    additionalData.LyDo = reason || `Đồng bộ từ trạng thái GHN: ${ghnStatus}`;
    
    // Chuyển trạng thái (chỉ cập nhật HoaDon.TrangThai)
    await orderState.transitionTo(targetOrderStatus, transaction, additionalData);
    
    return {
      updated: true,
      orderStatus: targetOrderStatus,
      message: `Đã chuyển trạng thái đơn hàng: ${hoaDon.TrangThai} → ${targetOrderStatus}`
    };
    
  } catch (error) {
    console.error('❌ Lỗi đồng bộ trạng thái GHN với đơn hàng:', error);
    return {
      updated: false,
      orderStatus: hoaDon.TrangThai,
      message: `Lỗi: ${error.message}`
    };
  }
}

/**
 * ✅ REMOVED: Không dùng LichSuTrangThaiDonHang nữa, chỉ dùng HoaDon.TrangThai
 * Function này không làm gì nữa, chỉ để tương thích với code cũ
 */
async function updateOrderStatusHistory(hoaDonId, oldStatus, newStatus, nguoiThayDoi = 'Hệ thống', lyDo = null, transaction = null) {
  // ✅ REMOVED: Không ghi lịch sử nữa
  console.log(`ℹ️ [updateOrderStatusHistory] Đã bỏ qua ghi lịch sử (chỉ dùng HoaDon.TrangThai): ${oldStatus} → ${newStatus}`);
  return;
}

module.exports = {
  getOrderStatusFromGHN,
  canTransitionOrderStatus,
  syncGHNStatusToOrder,
  updateOrderStatusHistory,
  GHN_TO_ORDER_STATUS_MAP
};

