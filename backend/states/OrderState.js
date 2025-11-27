/**
 * 🎯 STATE PATTERN - Quản lý trạng thái đơn hàng
 * 
 * Pattern này giúp:
 * - Quản lý chuyển trạng thái một cách an toàn
 * - Validate logic chuyển trạng thái
 * - Tự động xử lý hành động khi chuyển trạng thái
 * - Dễ dàng mở rộng thêm trạng thái mới
 */

const db = require('../models');

/**
 * 🎯 Base OrderState - Abstract class
 */
class OrderState {
  constructor(orderContext) {
    this.context = orderContext;
    this.order = orderContext.order;
  }

  /**
   * Tên trạng thái
   */
  getName() {
    throw new Error('Method getName() must be implemented');
  }

  /**
   * Danh sách trạng thái có thể chuyển đến
   */
  getAllowedTransitions() {
    throw new Error('Method getAllowedTransitions() must be implemented');
  }

  /**
   * Kiểm tra có thể chuyển sang trạng thái mới không
   */
  canTransitionTo(newState) {
    return this.getAllowedTransitions().includes(newState);
  }

  /**
   * Hành động khi VỪA chuyển VÀO trạng thái này
   */
  async onEnter(previousState, transaction) {
    console.log(`✅ Chuyển từ "${previousState}" → "${this.getName()}"`);
  }

  /**
   * Hành động khi CHUẨN BỊ rời khỏi trạng thái này
   */
  async onExit(nextState, transaction) {
    console.log(`🔄 Chuẩn bị chuyển từ "${this.getName()}" → "${nextState}"`);
  }

  /**
   * Khách hàng có thể hủy đơn không?
   */
  canCustomerCancel() {
    return false;
  }

  /**
   * Admin có thể hủy đơn không?
   */
  canAdminCancel() {
    return false;
  }

  /**
   * Có thể chỉnh sửa đơn hàng không?
   */
  canEdit() {
    return false;
  }
}

/**
 * 1️⃣ Chờ thanh toán
 */
class PendingPaymentState extends OrderState {
  getName() {
    return 'Chờ thanh toán';
  }

  getAllowedTransitions() {
    return ['Chờ xử lý', 'Đã hủy'];
  }

  async onEnter(previousState, transaction) {
    await super.onEnter(previousState, transaction);

    // TODO: Gửi email nhắc nhở thanh toán
    // TODO: Đặt timer tự động hủy sau 15 phút
    console.log('📧 Gửi email nhắc nhở thanh toán');
  }

  canCustomerCancel() {
    return true;
  }

  canAdminCancel() {
    return true;
  }
}

/**
 * 2️⃣ Chờ xử lý
 */
class PendingState extends OrderState {
  getName() {
    return 'Chờ xử lý';
  }

  getAllowedTransitions() {
    return ['Đã xác nhận', 'Đã hủy'];
  }

  async onEnter(previousState, transaction) {
    await super.onEnter(previousState, transaction);

    // Gửi email xác nhận đơn hàng cho khách
    console.log('📧 Gửi email xác nhận đơn hàng');

    // Thông báo cho admin có đơn mới
    console.log('🔔 Thông báo admin: Có đơn hàng mới cần xử lý');
  }

  canCustomerCancel() {
    return true; // Khách vẫn có thể hủy ở giai đoạn này
  }

  canAdminCancel() {
    return true;
  }
}

/**
 * 3️⃣ Đã xác nhận
 */
class ConfirmedState extends OrderState {
  getName() {
    return 'Đã xác nhận';
  }

  getAllowedTransitions() {
    // ✅ SỬA: Sau xác nhận → Tạo đơn GHN và chuyển sang "Đang đóng gói"
    return ['Đang đóng gói', 'Đã hủy'];
  }

  async onEnter(previousState, transaction) {
    await super.onEnter(previousState, transaction);

    console.log('📧 Gửi email: Đơn hàng đã được xác nhận');
    console.log('📋 Admin cần TẠO ĐƠN GHN và lấy mã vận đơn');
  }

  canCustomerCancel() {
    return false;
  }

  canAdminCancel() {
    return true;
  }
}

/**
 * 4️⃣ Đang đóng gói
 * - ĐÃ CÓ MÃ VẬN ĐƠN từ GHN
 * - Đang đóng gói và dán mã lên kiện hàng
 */
class PackingState extends OrderState {
  getName() {
    return 'Đang đóng gói';
  }

  getAllowedTransitions() {
    // ✅ SỬA: Sau đóng gói xong → "Sẵn sàng giao hàng"
    return ['Sẵn sàng giao hàng', 'Đã hủy'];
  }

  async onEnter(previousState, transaction) {
    await super.onEnter(previousState, transaction);

    // ✅ FIX: Kiểm tra mã vận đơn từ order object trước (đã được set từ controller)
    let maVanDon = this.order.MaVanDon;
    
    // ✅ FIX: Nếu không có trong order object, query từ DB (không dùng transaction để tránh lỗi)
    if (!maVanDon) {
      try {
        const ThongTinVanChuyen = db.ThongTinVanChuyen;
        const vanChuyen = await ThongTinVanChuyen.findOne({
          where: { HoaDonID: this.order.ID },
          // ✅ FIX: Không dùng transaction để tránh lỗi "no corresponding BEGIN TRANSACTION"
          // Transaction có thể đã bị rollback hoặc connection bị mất
          ...(transaction && !transaction.finished ? { transaction } : {})
        });

        if (vanChuyen && vanChuyen.MaVanDon) {
          maVanDon = vanChuyen.MaVanDon;
          // ✅ FIX: Set vào order object để dùng sau
          this.order.MaVanDon = maVanDon;
        }
      } catch (queryError) {
        console.warn('⚠️ Không thể query ThongTinVanChuyen trong onEnter:', queryError.message);
        // Không throw để không làm gián đoạn flow
      }
    }

    if (!maVanDon) {
      throw new Error('Phải tạo đơn GHN và có mã vận đơn trước khi chuyển sang "Đang đóng gói"');
    }

    console.log(`📋 Mã vận đơn: ${maVanDon}`);
    console.log('📦 Shop đang đóng gói và dán mã vận đơn lên kiện hàng');
    console.log('📧 Gửi email: Đơn hàng đang được đóng gói');
  }

  canCustomerCancel() {
    return false;
  }

  canAdminCancel() {
    return true;
  }
}

/**
 * 5️⃣ Sẵn sàng giao hàng (TRẠNG THÁI MỚI thay thế "Chờ in vận đơn")
 * - Đã đóng gói xong, đã dán mã vận đơn
 * - Chờ shipper GHN đến lấy hàng
 */
class ReadyToPickState extends OrderState {
  getName() {
    return 'Sẵn sàng giao hàng';
  }

  getAllowedTransitions() {
    return ['Đang giao hàng', 'Đã hủy'];
  }

  async onEnter(previousState, transaction) {
    await super.onEnter(previousState, transaction);

    // Lấy thông tin vận chuyển
    const ThongTinVanChuyen = db.ThongTinVanChuyen;
    const vanChuyen = await ThongTinVanChuyen.findOne({
      where: { HoaDonID: this.order.ID },
      transaction
    });

    if (!vanChuyen || !vanChuyen.MaVanDon) {
      throw new Error('Không có mã vận đơn. Vui lòng tạo đơn GHN trước.');
    }

    // ✅ Cập nhật trạng thái GHN sang "ready_to_pick"
    const formatDateForSQL = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    };

    await db.sequelize.query(
      `UPDATE ThongTinVanChuyen 
       SET TrangThaiGHN = :trangThai,
           NgayGuiHang = :ngayGui
       WHERE HoaDonID = :hoaDonId`,
      {
        replacements: {
          trangThai: 'ready_to_pick',
          ngayGui: formatDateForSQL(new Date()),
          hoaDonId: this.order.ID
        },
        transaction
      }
    );

    console.log(`✅ Đơn hàng sẵn sàng - Mã vận đơn: ${vanChuyen.MaVanDon}`);
    console.log('🚚 Chờ shipper GHN đến lấy hàng');
    console.log('📧 Gửi email: Đơn hàng sẵn sàng giao, shipper sẽ đến lấy');
  }

  canCustomerCancel() {
    return false;
  }

  canAdminCancel() {
    return true;
  }
}

/**
 * 6️⃣ Đang giao hàng
 * - Shipper đã lấy hàng
 * - Trạng thái cập nhật tự động từ webhook GHN
 */
class ShippingState extends OrderState {
  getName() {
    return 'Đang giao hàng';
  }

  getAllowedTransitions() {
    return ['Đã giao hàng', 'Giao hàng thất bại'];
  }

  async onEnter(previousState, transaction) {
    await super.onEnter(previousState, transaction);

    // ✅ Kiểm tra mã vận đơn từ bảng ThongTinVanChuyen
    const ThongTinVanChuyen = db.ThongTinVanChuyen;
    const vanChuyen = await ThongTinVanChuyen.findOne({
      where: { HoaDonID: this.order.ID },
      transaction
    });

    if (!vanChuyen || !vanChuyen.MaVanDon) {
      throw new Error('Không thể chuyển sang "Đang giao hàng" mà không có mã vận đơn');
    }

    console.log(`🚚 Shipper đã lấy hàng - Mã vận đơn: ${vanChuyen.MaVanDon}`);
    console.log('📧 Gửi email: Đơn hàng đang giao');
    console.log('📱 Gửi SMS tracking cho khách hàng');
  }

  canCustomerCancel() {
    return false;
  }

  canAdminCancel() {
    return false;
  }
}

/**
 * 7️⃣ Đã giao hàng
 */
class DeliveredState extends OrderState {
  getName() {
    return 'Đã giao hàng';
  }

  getAllowedTransitions() {
    return ['Hoàn thành', 'Đang hoàn tiền'];
  }

  async onEnter(previousState, transaction) {
    await super.onEnter(previousState, transaction);

    console.log('✅ Đơn hàng đã giao thành công');
    console.log('📧 Gửi email: Cảm ơn và yêu cầu đánh giá sản phẩm');

    // TODO: Đặt timer tự động chuyển sang "Hoàn thành" sau 7 ngày
    console.log('⏰ Tự động hoàn thành sau 7 ngày nếu không có khiếu nại');
  }

  canCustomerCancel() {
    return false; // Có thể yêu cầu đổi/trả hàng
  }

  canAdminCancel() {
    return false;
  }
}

/**
 * 8️⃣ Hoàn thành
 */
class CompletedState extends OrderState {
  getName() {
    return 'Hoàn thành';
  }

  getAllowedTransitions() {
    return []; // Không thể chuyển sang trạng thái nào khác
  }

  async onEnter(previousState, transaction) {
    await super.onEnter(previousState, transaction);

    console.log('🎉 Đơn hàng hoàn tất');
    console.log('💰 Tính doanh thu');
    console.log('🎁 Tích điểm cho khách hàng');

    // TODO: Cập nhật doanh thu
    // TODO: Tích điểm thành viên
  }

  canCustomerCancel() {
    return false;
  }

  canAdminCancel() {
    return false;
  }

  canEdit() {
    return false;
  }
}

/**
 * 9️⃣ Đã hủy
 */
class CancelledState extends OrderState {
  getName() {
    return 'Đã hủy';
  }

  getAllowedTransitions() {
    return []; // Không thể chuyển sang trạng thái nào khác
  }

  async onEnter(previousState, transaction) {
    await super.onEnter(previousState, transaction);

    console.log('❌ Đơn hàng đã bị hủy');

    // Hoàn tồn kho (đã xử lý ở controller)

    // TODO: Xử lý hoàn tiền nếu đã thanh toán
    if (this.order.PhuongThucThanhToanID !== 1) { // Không phải COD
      console.log('💰 Cần xử lý hoàn tiền');
    }

    console.log('📧 Gửi email thông báo hủy đơn');
  }

  canCustomerCancel() {
    return false;
  }

  canAdminCancel() {
    return false;
  }
}

/**
 * 🔟 Giao hàng thất bại
 */
class DeliveryFailedState extends OrderState {
  getName() {
    return 'Giao hàng thất bại';
  }

  getAllowedTransitions() {
    return ['Đang giao hàng', 'Đã hủy'];
  }

  async onEnter(previousState, transaction) {
    await super.onEnter(previousState, transaction);

    console.log('⚠️ Giao hàng thất bại');
    console.log('📞 Cần liên hệ khách hàng để hẹn giao lại');
    console.log('📧 Gửi email: Giao hàng thất bại, vui lòng liên hệ');

    // TODO: Đếm số lần giao thất bại
    // Nếu >= 3 lần → tự động hủy
  }

  canCustomerCancel() {
    return true; // Khách có thể hủy
  }

  canAdminCancel() {
    return true;
  }
}

/**
 * 1️⃣1️⃣ Đang hoàn tiền
 */
class RefundingState extends OrderState {
  getName() {
    return 'Đang hoàn tiền';
  }

  getAllowedTransitions() {
    return ['Đã hoàn tiền'];
  }

  async onEnter(previousState, transaction) {
    await super.onEnter(previousState, transaction);

    console.log('💳 Đang xử lý hoàn tiền');
    console.log('📧 Gửi email: Đang xử lý hoàn tiền');
  }

  canCustomerCancel() {
    return false;
  }

  canAdminCancel() {
    return false;
  }
}

/**
 * 1️⃣2️⃣ Đã hoàn tiền
 */
class RefundedState extends OrderState {
  getName() {
    return 'Đã hoàn tiền';
  }

  getAllowedTransitions() {
    return [];
  }

  async onEnter(previousState, transaction) {
    await super.onEnter(previousState, transaction);

    console.log('✅ Đã hoàn tiền thành công');
    console.log('📧 Gửi email xác nhận hoàn tiền');
  }

  canCustomerCancel() {
    return false;
  }

  canAdminCancel() {
    return false;
  }
}

/**
 * 🎯 OrderStateContext - Quản lý chuyển trạng thái
 */
class OrderStateContext {
  constructor(order) {
    this.order = order;
    this.currentState = this.getStateInstance(order.TrangThai);
  }

  /**
   * Tạo instance của State từ tên trạng thái
   */
  getStateInstance(stateName) {
    const stateMap = {
      'Chờ thanh toán': PendingPaymentState,
      'Chờ xử lý': PendingState,
      'Đã xác nhận': ConfirmedState,
      'Đang đóng gói': PackingState,
      'Sẵn sàng giao hàng': ReadyToPickState, // Thêm trạng thái mới
      'Đang giao hàng': ShippingState,
      'Đã giao hàng': DeliveredState,
      'Hoàn thành': CompletedState,
      'Đã hủy': CancelledState,
      'Giao hàng thất bại': DeliveryFailedState,
      'Đang hoàn tiền': RefundingState,
      'Đã hoàn tiền': RefundedState
    };

    const StateClass = stateMap[stateName];
    if (!StateClass) {
      throw new Error(`Trạng thái không hợp lệ: ${stateName}`);
    }

    return new StateClass(this);
  }

  /**
   * Lấy trạng thái hiện tại
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Chuyển sang trạng thái mới
   */
  async transitionTo(newStateName, transaction, additionalData = {}) {
    const currentStateName = this.currentState.getName();

    // Kiểm tra có thể chuyển trạng thái không
    if (!this.currentState.canTransitionTo(newStateName)) {
      throw new Error(
        `Không thể chuyển từ "${currentStateName}" sang "${newStateName}". ` +
        `Chỉ có thể chuyển sang: ${this.currentState.getAllowedTransitions().join(', ')}`
      );
    }

    const newState = this.getStateInstance(newStateName);

    // Gọi onExit của state hiện tại
    await this.currentState.onExit(newStateName, transaction);

    // Cập nhật trạng thái trong database
    const timestamp = new Date();
    const updateNote = `[${timestamp.toLocaleString('vi-VN')}] ${currentStateName} → ${newStateName}`;
    const newGhiChu = this.order.GhiChu
      ? `${this.order.GhiChu} | ${updateNote}`
      : updateNote;

    // ✅ FIX: Cập nhật trạng thái trong database
    // ⚠️ LƯU Ý: Nếu additionalData có GhiChu, nó sẽ được merge với newGhiChu
    const updateData = {
      TrangThai: newStateName,
      NgayCapNhat: timestamp,
      ...additionalData, // Thêm dữ liệu bổ sung (vd: MaVanDon, GhiChu từ caller)
      // ✅ FIX: Merge GhiChu từ additionalData với newGhiChu (nếu có)
      GhiChu: additionalData.GhiChu || newGhiChu
    };

    try {
      console.log(`🔍 [transitionTo] Updating order ${this.order.ID} with data:`, {
        TrangThai: updateData.TrangThai,
        GhiChu: updateData.GhiChu ? updateData.GhiChu.substring(0, 50) + '...' : null,
        NgayCapNhat: updateData.NgayCapNhat
      });
      console.log(`🔍 [transitionTo] Transaction status before update: finished=${transaction?.finished}, id=${transaction?.id}`);
      
      await this.order.update(updateData, { transaction });
      
      console.log(`🔍 [transitionTo] Update successful. Transaction status after update: finished=${transaction?.finished}, id=${transaction?.id}`);
    } catch (updateError) {
      console.error(`❌ [transitionTo] Lỗi khi update order:`, updateError);
      console.error(`❌ [transitionTo] Update error stack:`, updateError.stack);
      console.error(`❌ [transitionTo] Transaction status on error: finished=${transaction?.finished}, id=${transaction?.id}`);
      throw updateError; // Re-throw để caller có thể rollback
    }

    // ✅ FIX: Cập nhật object trực tiếp thay vì reload (tránh lỗi với MSSQL transaction)
    Object.assign(this.order, updateData);
    console.log(`🔍 [transitionTo] Order object updated. Order.TrangThai=${this.order.TrangThai}`);

    // ✅ REMOVED: Không ghi lịch sử vào LichSuTrangThaiDonHang nữa
    // Timeline sẽ chỉ dựa vào HoaDon.TrangThai hiện tại để suy đoán các bước đã hoàn thành
    console.log(`✅ [transitionTo] Đã cập nhật trạng thái: ${currentStateName} → ${newStateName}`);

    // ✅ THÊM: Cập nhật reference trong newState
    newState.order = this.order;

    // Gọi onEnter của state mới (bây giờ newState.order đã có MaVanDon)
    await newState.onEnter(currentStateName, transaction);

    // Cập nhật state hiện tại
    this.currentState = newState;

    console.log(`✅ Đã chuyển trạng thái: ${currentStateName} → ${newStateName}`);

    return this.order;
  }

  /**
   * Kiểm tra khách hàng có thể hủy không
   */
  canCustomerCancel() {
    return this.currentState.canCustomerCancel();
  }

  /**
   * Kiểm tra admin có thể hủy không
   */
  canAdminCancel() {
    return this.currentState.canAdminCancel();
  }

  /**
   * Lấy danh sách trạng thái có thể chuyển đến
   */
  getAvailableTransitions() {
    return this.currentState.getAllowedTransitions();
  }
}

module.exports = {
  OrderStateContext,
  // Export các state class để test
  PendingPaymentState,
  PendingState,
  ConfirmedState,
  PackingState,
  ReadyToPickState, // Thêm trạng thái mới
  ShippingState,
  DeliveredState,
  CompletedState,
  CancelledState,
  DeliveryFailedState,
  RefundingState,
  RefundedState
};
