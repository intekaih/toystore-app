const db = require('../models');
const GioHang = db.GioHang;
const GioHangChiTiet = db.GioHangChiTiet;
const SanPham = db.SanPham;

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const { sanPhamId, soLuong = 1 } = req.body;
    const taiKhoanId = req.user.id; // Lấy từ JWT token

    // Validate input
    if (!sanPhamId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID sản phẩm'
      });
    }

    if (soLuong < 1) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng phải lớn hơn 0'
      });
    }

    // Kiểm tra sản phẩm có tồn tại và còn hàng không
    const sanPham = await SanPham.findOne({
      where: {
        ID: sanPhamId,
        Enable: true
      }
    });

    if (!sanPham) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh'
      });
    }

    if (sanPham.Ton < soLuong) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm chỉ còn ${sanPham.Ton} sản phẩm trong kho`
      });
    }

    // Tìm hoặc tạo giỏ hàng cho user
    let gioHang = await GioHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    if (!gioHang) {
      // Tạo giỏ hàng mới nếu chưa có
      gioHang = await GioHang.create({
        TaiKhoanID: taiKhoanId
      });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItem = await GioHangChiTiet.findOne({
      where: {
        GioHangID: gioHang.ID,
        SanPhamID: sanPhamId
      }
    });

    let cartItem;

    if (existingItem) {
      // Nếu đã có thì tăng số lượng
      const newSoLuong = existingItem.SoLuong + soLuong;

      // Kiểm tra số lượng mới có vượt quá tồn kho không
      if (newSoLuong > sanPham.Ton) {
        return res.status(400).json({
          success: false,
          message: `Không thể thêm. Tổng số lượng sẽ vượt quá số lượng tồn kho (${sanPham.Ton})`
        });
      }

      existingItem.SoLuong = newSoLuong;
      await existingItem.save();

      cartItem = existingItem;
    } else {
      // Nếu chưa có thì thêm mới
      cartItem = await GioHangChiTiet.create({
        GioHangID: gioHang.ID,
        SanPhamID: sanPhamId,
        SoLuong: soLuong,
        DonGia: sanPham.GiaBan
      });
    }

    // Lấy thông tin chi tiết của item vừa thêm/cập nhật
    const result = await GioHangChiTiet.findOne({
      where: { ID: cartItem.ID },
      include: [{
        model: SanPham,
        as: 'sanPham',
        attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'Ton']
      }]
    });

    return res.status(200).json({
      success: true,
      message: existingItem ? 'Cập nhật số lượng thành công' : 'Thêm vào giỏ hàng thành công',
      data: result
    });

  } catch (error) {
    console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

// Lấy giỏ hàng của user
exports.getCart = async (req, res) => {
  try {
    const taiKhoanId = req.user.id;

    // Tìm giỏ hàng của user
    const gioHang = await GioHang.findOne({
      where: { TaiKhoanID: taiKhoanId },
      include: [{
        model: GioHangChiTiet,
        as: 'chiTiet',
        include: [{
          model: SanPham,
          as: 'sanPham',
          attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'Ton', 'Enable']
        }]
      }]
    });

    if (!gioHang) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          totalItems: 0,
          totalAmount: 0
        }
      });
    }

    // Tính tổng tiền
    let totalAmount = 0;
    const items = gioHang.chiTiet.map(item => {
      const itemTotal = parseFloat(item.DonGia) * item.SoLuong;
      totalAmount += itemTotal;
      return {
        ...item.toJSON(),
        thanhTien: itemTotal
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        items: items,
        totalItems: items.length,
        totalAmount: totalAmount
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi lấy giỏ hàng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ
exports.updateCartItem = async (req, res) => {
  try {
    const { sanPhamId, soLuong } = req.body;
    const taiKhoanId = req.user.id;

    if (!sanPhamId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID sản phẩm'
      });
    }

    if (!soLuong || soLuong < 1) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng phải lớn hơn 0'
      });
    }

    // Tìm giỏ hàng của user
    const gioHang = await GioHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    if (!gioHang) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    // Tìm item trong giỏ hàng
    const cartItem = await GioHangChiTiet.findOne({
      where: {
        GioHangID: gioHang.ID,
        SanPhamID: sanPhamId
      },
      include: [{
        model: SanPham,
        as: 'sanPham'
      }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    // Kiểm tra sản phẩm còn tồn tại và còn kinh doanh không
    if (!cartItem.sanPham || !cartItem.sanPham.Enable) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm không còn tồn tại hoặc đã ngừng kinh doanh'
      });
    }

    // Kiểm tra tồn kho
    if (soLuong > cartItem.sanPham.Ton) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm chỉ còn ${cartItem.sanPham.Ton} sản phẩm trong kho`
      });
    }

    // Cập nhật số lượng
    cartItem.SoLuong = soLuong;
    await cartItem.save();

    // Lấy lại thông tin đầy đủ
    const updatedItem = await GioHangChiTiet.findOne({
      where: { ID: cartItem.ID },
      include: [{
        model: SanPham,
        as: 'sanPham',
        attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'Ton']
      }]
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật số lượng thành công',
      data: updatedItem
    });

  } catch (error) {
    console.error('❌ Lỗi khi cập nhật giỏ hàng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

// Xóa sản phẩm khỏi giỏ hàng (theo productId)
exports.removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const taiKhoanId = req.user.id;

    // Tìm giỏ hàng của user
    const gioHang = await GioHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    if (!gioHang) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    // Kiểm tra sản phẩm có tồn tại trong giỏ hàng không
    const cartItem = await GioHangChiTiet.findOne({
      where: {
        GioHangID: gioHang.ID,
        SanPhamID: productId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    // Xóa sản phẩm khỏi giỏ hàng
    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công'
    });

  } catch (error) {
    console.error('❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

// Xóa sản phẩm khỏi giỏ hàng (deprecated - giữ lại để tương thích)
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params; // ID của GioHangChiTiet
    const taiKhoanId = req.user.id;

    // Tìm giỏ hàng của user
    const gioHang = await GioHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    if (!gioHang) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    // Tìm và xóa item
    const deleted = await GioHangChiTiet.destroy({
      where: {
        ID: id,
        GioHangID: gioHang.ID
      }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công'
    });

  } catch (error) {
    console.error('❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

// Xóa toàn bộ giỏ hàng
exports.clearCart = async (req, res) => {
  try {
    const taiKhoanId = req.user.id;

    // Tìm giỏ hàng của user
    const gioHang = await GioHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    if (!gioHang) {
      return res.status(200).json({
        success: true,
        message: 'Giỏ hàng đã trống'
      });
    }

    // Xóa tất cả items trong giỏ hàng
    await GioHangChiTiet.destroy({
      where: { GioHangID: gioHang.ID }
    });

    return res.status(200).json({
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng'
    });

  } catch (error) {
    console.error('❌ Lỗi khi xóa giỏ hàng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

// Tăng 1 đơn vị sản phẩm trong giỏ hàng
exports.incrementCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const taiKhoanId = req.user.id;

    console.log('➕ Tăng số lượng sản phẩm:', productId);

    // Validate productId
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    // Tìm giỏ hàng của user
    const gioHang = await GioHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    if (!gioHang) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    // Tìm item trong giỏ hàng
    const cartItem = await GioHangChiTiet.findOne({
      where: {
        GioHangID: gioHang.ID,
        SanPhamID: productId
      },
      include: [{
        model: SanPham,
        as: 'sanPham',
        attributes: ['ID', 'Ten', 'GiaBan', 'Ton', 'Enable', 'HinhAnhURL']
      }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    // Kiểm tra sản phẩm còn tồn tại và còn kinh doanh không
    if (!cartItem.sanPham || !cartItem.sanPham.Enable) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm không còn tồn tại hoặc đã ngừng kinh doanh'
      });
    }

    // Kiểm tra tồn kho trước khi tăng
    const newSoLuong = cartItem.SoLuong + 1;
    
    if (newSoLuong > cartItem.sanPham.Ton) {
      return res.status(400).json({
        success: false,
        message: `Không thể tăng. Sản phẩm chỉ còn ${cartItem.sanPham.Ton} trong kho`,
        data: {
          currentQuantity: cartItem.SoLuong,
          stockAvailable: cartItem.sanPham.Ton
        }
      });
    }

    // Tăng số lượng
    cartItem.SoLuong = newSoLuong;
    await cartItem.save();

    console.log(`✅ Tăng số lượng thành công: ${cartItem.SoLuong - 1} → ${cartItem.SoLuong}`);

    // Lấy lại thông tin đầy đủ
    const updatedItem = await GioHangChiTiet.findOne({
      where: { ID: cartItem.ID },
      include: [{
        model: SanPham,
        as: 'sanPham',
        attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'Ton', 'Enable']
      }]
    });

    return res.status(200).json({
      success: true,
      message: 'Tăng số lượng thành công',
      data: {
        ...updatedItem.toJSON(),
        thanhTien: parseFloat(updatedItem.DonGia) * updatedItem.SoLuong
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi tăng số lượng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

// Giảm 1 đơn vị sản phẩm trong giỏ hàng
exports.decrementCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const taiKhoanId = req.user.id;

    console.log('➖ Giảm số lượng sản phẩm:', productId);

    // Validate productId
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    // Tìm giỏ hàng của user
    const gioHang = await GioHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    if (!gioHang) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    // Tìm item trong giỏ hàng
    const cartItem = await GioHangChiTiet.findOne({
      where: {
        GioHangID: gioHang.ID,
        SanPhamID: productId
      },
      include: [{
        model: SanPham,
        as: 'sanPham',
        attributes: ['ID', 'Ten', 'GiaBan', 'Ton', 'Enable', 'HinhAnhURL']
      }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    // Nếu số lượng = 1, xóa sản phẩm khỏi giỏ hàng
    if (cartItem.SoLuong <= 1) {
      await cartItem.destroy();
      
      console.log('🗑️ Số lượng = 1, đã xóa sản phẩm khỏi giỏ hàng');

      return res.status(200).json({
        success: true,
        message: 'Đã xóa sản phẩm khỏi giỏ hàng',
        data: {
          removed: true,
          productId: productId
        }
      });
    }

    // Giảm số lượng
    const newSoLuong = cartItem.SoLuong - 1;
    cartItem.SoLuong = newSoLuong;
    await cartItem.save();

    console.log(`✅ Giảm số lượng thành công: ${cartItem.SoLuong + 1} → ${cartItem.SoLuong}`);

    // Lấy lại thông tin đầy đủ
    const updatedItem = await GioHangChiTiet.findOne({
      where: { ID: cartItem.ID },
      include: [{
        model: SanPham,
        as: 'sanPham',
        attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'Ton', 'Enable']
      }]
    });

    return res.status(200).json({
      success: true,
      message: 'Giảm số lượng thành công',
      data: {
        ...updatedItem.toJSON(),
        thanhTien: parseFloat(updatedItem.DonGia) * updatedItem.SoLuong
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi giảm số lượng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};
