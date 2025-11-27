/**
 * ADMIN SETTINGS CONTROLLER
 * Quản lý các cài đặt hệ thống (phí ship, v.v.)
 */

// Lưu phí ship trong memory (có thể migrate sang database sau)
let defaultShippingFee = 30000; // Giá trị mặc định

/**
 * GET /api/admin/settings/shipping-fee
 * Lấy phí ship cố định hiện tại
 */
exports.getShippingFee = async (req, res) => {
  try {
    console.log('📋 Admin - Lấy phí ship cố định');

    res.status(200).json({
      success: true,
      message: 'Lấy phí ship thành công',
      data: {
        shippingFee: defaultShippingFee
      }
    });
  } catch (error) {
    console.error('❌ Lỗi lấy phí ship:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * PUT /api/admin/settings/shipping-fee
 * Cập nhật phí ship cố định
 */
exports.updateShippingFee = async (req, res) => {
  try {
    const { shippingFee } = req.body;

    console.log('✏️ Admin - Cập nhật phí ship:', shippingFee);

    // Validate
    if (shippingFee === undefined || shippingFee === null) {
      return res.status(400).json({
        success: false,
        message: 'Phí ship là bắt buộc'
      });
    }

    const fee = parseFloat(shippingFee);

    if (isNaN(fee) || fee < 0) {
      return res.status(400).json({
        success: false,
        message: 'Phí ship phải là số không âm'
      });
    }

    if (fee > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Phí ship không được vượt quá 1,000,000 VNĐ'
      });
    }

    // Cập nhật giá trị
    defaultShippingFee = fee;

    console.log('✅ Cập nhật phí ship thành công:', defaultShippingFee);

    res.status(200).json({
      success: true,
      message: 'Cập nhật phí ship thành công',
      data: {
        shippingFee: defaultShippingFee
      }
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật phí ship:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

