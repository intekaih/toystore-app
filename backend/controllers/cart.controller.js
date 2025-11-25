const db = require('../models');
const Decimal = require('decimal.js'); // ✅ Thêm Decimal.js cho tính toán chính xác
const GioHang = db.GioHang;
const GioHangChiTiet = db.GioHangChiTiet;
const SanPham = db.SanPham;
const DTOMapper = require('../utils/DTOMapper');

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
        TrangThai: true
      }
    });

    if (!sanPham) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh'
      });
    }

    if (sanPham.SoLuongTon < soLuong) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm chỉ còn ${sanPham.SoLuongTon} sản phẩm trong kho`
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
      if (newSoLuong > sanPham.SoLuongTon) {
        return res.status(400).json({
          success: false,
          message: `Không thể thêm. Tổng số lượng sẽ vượt quá số lượng tồn kho (${sanPham.SoLuongTon})`
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
        attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'SoLuongTon']
      }]
    });

    // ✅ SỬ DỤNG DTOMapper
    const resultDTO = DTOMapper.toCamelCase(result.toJSON());

    return res.status(200).json({
      success: true,
      message: existingItem ? 'Cập nhật số lượng thành công' : 'Thêm vào giỏ hàng thành công',
      data: resultDTO
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
          attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'SoLuongTon', 'TrangThai']
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

    // ✅ Tính tổng tiền và sử dụng DTOMapper
    let totalAmount = new Decimal(0);
    const items = gioHang.chiTiet.map(item => {
      const itemTotal = new Decimal(item.DonGia).times(item.SoLuong);
      totalAmount = totalAmount.plus(itemTotal);
      
      const itemData = DTOMapper.toCamelCase(item.toJSON());
      return {
        ...itemData,
        thanhTien: parseFloat(itemTotal.toFixed(2))
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        items: items,
        totalItems: items.length,
        totalAmount: parseFloat(totalAmount.toFixed(2))
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
        as: 'sanPham',
        attributes: ['ID', 'Ten', 'GiaBan', 'SoLuongTon', 'TrangThai', 'HinhAnhURL']
      }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    // Kiểm tra sản phẩm còn tồn tại và còn kinh doanh không
    if (!cartItem.sanPham || !cartItem.sanPham.TrangThai) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm không còn tồn tại hoặc đã ngừng kinh doanh'
      });
    }

    // Kiểm tra tồn kho
    if (soLuong > cartItem.sanPham.SoLuongTon) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm chỉ còn ${cartItem.sanPham.SoLuongTon} sản phẩm trong kho`
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
        attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'SoLuongTon']
      }]
    });

    // ✅ SỬ DỤNG DTOMapper
    const updatedItemDTO = DTOMapper.toCamelCase(updatedItem.toJSON());

    return res.status(200).json({
      success: true,
      message: 'Cập nhật số lượng thành công',
      data: updatedItemDTO
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
        attributes: ['ID', 'Ten', 'GiaBan', 'SoLuongTon', 'TrangThai', 'HinhAnhURL']
      }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    // Kiểm tra sản phẩm còn tồn tại và còn kinh doanh không
    if (!cartItem.sanPham || !cartItem.sanPham.TrangThai) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm không còn tồn tại hoặc đã ngừng kinh doanh'
      });
    }

    // Kiểm tra tồn kho trước khi tăng
    const newSoLuong = cartItem.SoLuong + 1;
    
    if (newSoLuong > cartItem.sanPham.SoLuongTon) {
      return res.status(400).json({
        success: false,
        message: `Không thể tăng. Sản phẩm chỉ còn ${cartItem.sanPham.SoLuongTon} trong kho`,
        data: {
          currentQuantity: cartItem.SoLuong,
          stockAvailable: cartItem.sanPham.SoLuongTon
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
        attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'SoLuongTon', 'TrangThai']
      }]
    });

    // ✅ SỬ DỤNG DTOMapper
    const updatedItemDTO = DTOMapper.toCamelCase(updatedItem.toJSON());
    const itemTotal = new Decimal(updatedItem.DonGia).times(updatedItem.SoLuong);

    return res.status(200).json({
      success: true,
      message: 'Tăng số lượng thành công',
      data: {
        ...updatedItemDTO,
        thanhTien: parseFloat(itemTotal.toFixed(2))
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
        attributes: ['ID', 'Ten', 'GiaBan', 'SoLuongTon', 'TrangThai', 'HinhAnhURL']
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
        attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'SoLuongTon', 'TrangThai']
      }]
    });

    // ✅ SỬ DỤNG DTOMapper
    const updatedItemDTO = DTOMapper.toCamelCase(updatedItem.toJSON());
    const itemTotal = new Decimal(updatedItem.DonGia).times(updatedItem.SoLuong);

    return res.status(200).json({
      success: true,
      message: 'Giảm số lượng thành công',
      data: {
        ...updatedItemDTO,
        thanhTien: parseFloat(itemTotal.toFixed(2))
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

// =======================================
// GUEST CART OPERATIONS (Giỏ hàng khách vãng lai)
// =======================================

const GioHangKhachVangLai = db.GioHangKhachVangLai;

/**
 * Lấy giỏ hàng của khách vãng lai
 * Không cần authentication
 */
exports.getGuestCart = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId || sessionId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Session ID không được để trống'
      });
    }

    console.log('🛒 Lấy giỏ hàng guest - Session:', sessionId);

    // Lấy giỏ hàng từ DB
    const cartItems = await GioHangKhachVangLai.getCartBySession(sessionId, db);

    // ✅ SỬA: Phải gọi .toJSON() trước khi dùng DTOMapper
    let totalAmount = new Decimal(0);
    const items = cartItems.map(item => {
      const itemTotal = new Decimal(item.DonGia).times(item.SoLuong);
      totalAmount = totalAmount.plus(itemTotal);
      
      // ✅ QUAN TRỌNG: Gọi .toJSON() để convert Sequelize instance thành plain object
      const itemData = DTOMapper.toCamelCase(item.toJSON());
      return {
        ...itemData,
        thanhTien: parseFloat(itemTotal.toFixed(2))
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Lấy giỏ hàng thành công',
      data: {
        sessionId: sessionId,
        items: items,
        totalItems: items.length,
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi lấy giỏ hàng guest:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

/**
 * Thêm sản phẩm vào giỏ hàng khách vãng lai
 * Không cần authentication
 */
exports.addToGuestCart = async (req, res) => {
  try {
    const { sessionId, sanPhamId, soLuong = 1 } = req.body;

    // Validate input
    if (!sessionId || sessionId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Session ID không được để trống'
      });
    }

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

    console.log('➕ Thêm vào giỏ hàng guest - Session:', sessionId, '- Sản phẩm:', sanPhamId);

    // Kiểm tra sản phẩm có tồn tại và còn hàng không
    const sanPham = await SanPham.findOne({
      where: {
        ID: sanPhamId,
        TrangThai: true
      }
    });

    if (!sanPham) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh'
      });
    }

    // Kiểm tra tồn kho
    // ✅ SỬA: Sử dụng MaPhien thay vì SessionID
    const existingItem = await GioHangKhachVangLai.findOne({
      where: {
        MaPhien: sessionId,
        SanPhamID: sanPhamId
      }
    });

    // Tính tổng số lượng
    const totalQuantity = existingItem 
      ? existingItem.SoLuong + soLuong 
      : soLuong;

    if (totalQuantity > sanPham.SoLuongTon) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm chỉ còn ${sanPham.SoLuongTon} trong kho`
      });
    }

    // Thêm hoặc cập nhật giỏ hàng
    const cartItem = await GioHangKhachVangLai.addToCart(
      sessionId,
      sanPhamId,
      soLuong,
      sanPham.GiaBan
    );

    // Lấy lại thông tin đầy đủ
    const result = await GioHangKhachVangLai.findOne({
      where: { ID: cartItem.ID },
      include: [{
        model: SanPham,
        as: 'sanPham',
        attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'SoLuongTon']
      }]
    });

    console.log('✅ Thêm vào giỏ hàng guest thành công');

    // ✅ SỬ DỤNG DTOMapper
    const resultDTO = DTOMapper.toCamelCase(result.toJSON());

    return res.status(200).json({
      success: true,
      message: 'Thêm vào giỏ hàng thành công',
      data: resultDTO
    });

  } catch (error) {
    console.error('❌ Lỗi khi thêm vào giỏ hàng guest:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng guest
 */
exports.updateGuestCartItem = async (req, res) => {
  try {
    const { sessionId, sanPhamId, soLuong } = req.body;

    if (!sessionId || !sanPhamId || !soLuong || soLuong < 1) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ'
      });
    }

    // Kiểm tra tồn kho
    const sanPham = await SanPham.findByPk(sanPhamId);
    if (!sanPham || !sanPham.TrangThai) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    if (soLuong > sanPham.SoLuongTon) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm chỉ còn ${sanPham.SoLuongTon} trong kho`
      });
    }

    // Cập nhật số lượng
    const updated = await GioHangKhachVangLai.updateQuantity(sessionId, sanPhamId, soLuong);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật số lượng thành công'
    });

  } catch (error) {
    console.error('❌ Lỗi khi cập nhật giỏ hàng guest:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng guest
 */
exports.removeGuestCartItem = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const { productId } = req.params;

    if (!sessionId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ'
      });
    }

    const removed = await GioHangKhachVangLai.removeFromCart(sessionId, productId);

    if (!removed) {
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
    console.error('❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng guest:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

/**
 * Xóa toàn bộ giỏ hàng guest
 */
exports.clearGuestCart = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID không được để trống'
      });
    }

    await GioHangKhachVangLai.clearCart(sessionId);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng'
    });

  } catch (error) {
    console.error('❌ Lỗi khi xóa giỏ hàng guest:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

/**
 * Tăng 1 đơn vị sản phẩm trong giỏ hàng guest
 */
exports.incrementGuestCartItem = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const { productId } = req.params;

    if (!sessionId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ'
      });
    }

    // ✅ SỬA: Bỏ Enable vì không có trong database
    // Tìm item trong giỏ hàng
    const cartItem = await GioHangKhachVangLai.findOne({
      where: {
        MaPhien: sessionId,
        SanPhamID: productId
      },
      include: [{
        model: SanPham,
        as: 'sanPham',
        attributes: ['ID', 'Ten', 'GiaBan', 'SoLuongTon', 'TrangThai']
      }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    if (!cartItem.sanPham || !cartItem.sanPham.TrangThai) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm không còn tồn tại hoặc đã ngừng kinh doanh'
      });
    }

    const newSoLuong = cartItem.SoLuong + 1;

    if (newSoLuong > cartItem.sanPham.SoLuongTon) {
      return res.status(400).json({
        success: false,
        message: `Không thể tăng. Sản phẩm chỉ còn ${cartItem.sanPham.SoLuongTon} trong kho`
      });
    }

    // Tăng số lượng
    cartItem.SoLuong = newSoLuong;
    await cartItem.save();

    // ✅ SỬ DỤNG DTOMapper
    const itemTotal = new Decimal(cartItem.DonGia).times(cartItem.SoLuong);
    const itemData = DTOMapper.toCamelCase({
      soLuong: cartItem.SoLuong,
      thanhTien: parseFloat(itemTotal.toFixed(2))
    });

    return res.status(200).json({
      success: true,
      message: 'Tăng số lượng thành công',
      data: itemData
    });

  } catch (error) {
    console.error('❌ Lỗi khi tăng số lượng guest cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

/**
 * Giảm 1 đơn vị sản phẩm trong giỏ hàng guest
 */
exports.decrementGuestCartItem = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const { productId } = req.params;

    if (!sessionId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ'
      });
    }

    // ✅ SỬA: Bỏ Enable vì không có trong database
    // Tìm item trong giỏ hàng
    const cartItem = await GioHangKhachVangLai.findOne({
      where: {
        MaPhien: sessionId,
        SanPhamID: productId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    // Nếu số lượng = 1, xóa sản phẩm
    if (cartItem.SoLuong <= 1) {
      await cartItem.destroy();
      
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
    cartItem.SoLuong = cartItem.SoLuong - 1;
    await cartItem.save();

    // ✅ SỬ DỤNG DTOMapper
    const itemTotal = new Decimal(cartItem.DonGia).times(cartItem.SoLuong);
    const itemData = DTOMapper.toCamelCase({
      soLuong: cartItem.SoLuong,
      thanhTien: parseFloat(itemTotal.toFixed(2))
    });

    return res.status(200).json({
      success: true,
      message: 'Giảm số lượng thành công',
      data: itemData
    });

  } catch (error) {
    console.error('❌ Lỗi khi giảm số lượng guest cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

/**
 * Khôi phục giỏ hàng guest sau khi thanh toán thất bại
 * POST /api/cart/guest/restore
 */
exports.restoreGuestCart = async (req, res) => {
  try {
    const { sessionId, cartItems } = req.body;

    console.log('🔄 Khôi phục giỏ hàng guest - Session:', sessionId);
    console.log('📦 Số lượng sản phẩm:', cartItems?.length);

    // Validate input
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID không được để trống'
      });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách sản phẩm không hợp lệ'
      });
    }

    const restoredItems = [];
    const errors = [];

    // ✅ Khôi phục từng sản phẩm vào giỏ hàng
    for (const item of cartItems) {
      try {
        const { id, quantity, price } = item;

        // Validate item data
        if (!id || !quantity || quantity <= 0) {
          errors.push({ productId: id, message: 'Dữ liệu sản phẩm không hợp lệ' });
          continue;
        }

        // Kiểm tra sản phẩm có tồn tại và còn kinh doanh
        const sanPham = await db.SanPham.findOne({
          where: { ID: id, TrangThai: true }
        });

        if (!sanPham) {
          errors.push({ productId: id, message: 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh' });
          continue;
        }

        // Kiểm tra tồn kho
        if (sanPham.SoLuongTon < quantity) {
          errors.push({ 
            productId: id, 
            message: `Sản phẩm "${sanPham.Ten}" chỉ còn ${sanPham.SoLuongTon} trong kho` 
          });
          continue;
        }

        // ✅ Thêm/Cập nhật sản phẩm vào giỏ hàng guest
        const cartItem = await db.GioHangKhachVangLai.restoreToCart(
          sessionId,
          id,
          quantity,
          price || sanPham.GiaBan
        );

        restoredItems.push({
          id: cartItem.ID,
          sanPhamId: cartItem.SanPhamID,
          soLuong: cartItem.SoLuong,
          donGia: cartItem.DonGia
        });

        console.log(`✅ Khôi phục sản phẩm: ${sanPham.Ten} x ${quantity}`);
      } catch (itemError) {
        console.error(`❌ Lỗi khôi phục sản phẩm ${item.id}:`, itemError);
        errors.push({ productId: item.id, message: itemError.message });
      }
    }

    // Trả về kết quả
    res.status(200).json({
      success: true,
      message: `Đã khôi phục ${restoredItems.length}/${cartItems.length} sản phẩm vào giỏ hàng`,
      data: {
        restored: restoredItems,
        errors: errors,
        totalRestored: restoredItems.length,
        totalErrors: errors.length
      }
    });

    console.log(`✅ Khôi phục giỏ hàng thành công: ${restoredItems.length} sản phẩm`);
    if (errors.length > 0) {
      console.log(`⚠️ Có ${errors.length} lỗi khi khôi phục`);
    }

  } catch (error) {
    console.error('❌ Lỗi khôi phục giỏ hàng guest:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// =======================================
// ✅ MỚI: CHỨC NĂNG CHỌN SẢN PHẨM TRONG GIỎ HÀNG (DaChon)
// =======================================

/**
 * Cập nhật trạng thái chọn sản phẩm trong giỏ hàng (USER)
 * PUT /api/cart/select/:productId
 * Body: { selected: true/false }
 */
exports.toggleSelectItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { selected } = req.body;
    const taiKhoanId = req.user.id;

    console.log('☑️ Toggle chọn sản phẩm:', productId, '- Selected:', selected);

    // Validate
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    if (typeof selected !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái chọn phải là true hoặc false'
      });
    }

    // ✅ SỬA: Bỏ Enable vì không có trong database
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

    // Tìm và cập nhật item
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

    // Cập nhật trạng thái chọn
    await cartItem.update({
      DaChon: selected
    });

    console.log(`✅ Đã cập nhật trạng thái chọn: ${selected}`);

    return res.status(200).json({
      success: true,
      message: `Đã ${selected ? 'chọn' : 'bỏ chọn'} sản phẩm`,
      data: {
        productId: parseInt(productId),
        selected: selected
      }
    });

  } catch (error) {
    console.error('❌ Lỗi toggle chọn sản phẩm:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

/**
 * Cập nhật trạng thái chọn sản phẩm trong giỏ hàng (GUEST)
 * PUT /api/cart/guest/select/:productId
 * Body: { sessionId, selected: true/false }
 */
exports.toggleSelectGuestItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sessionId, selected } = req.body;

    console.log('☑️ Toggle chọn sản phẩm guest:', productId, '- Selected:', selected);

    // Validate
    if (!sessionId || sessionId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Session ID không được để trống'
      });
    }

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    if (typeof selected !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái chọn phải là true hoặc false'
      });
    }

    // ✅ SỬA: Bỏ Enable vì không có trong database
    // Tìm và cập nhật item
    const cartItem = await GioHangKhachVangLai.findOne({
      where: {
        MaPhien: sessionId,
        SanPhamID: productId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    // Cập nhật trạng thái chọn
    await cartItem.update({
      DaChon: selected
    });

    console.log(`✅ Đã cập nhật trạng thái chọn guest: ${selected}`);

    return res.status(200).json({
      success: true,
      message: `Đã ${selected ? 'chọn' : 'bỏ chọn'} sản phẩm`,
      data: {
        productId: parseInt(productId),
        selected: selected
      }
    });

  } catch (error) {
    console.error('❌ Lỗi toggle chọn sản phẩm guest:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

/**
 * Chọn tất cả sản phẩm trong giỏ hàng (USER)
 * PUT /api/cart/select-all
 * Body: { selected: true/false }
 */
exports.toggleSelectAll = async (req, res) => {
  try {
    const { selected } = req.body;
    const taiKhoanId = req.user.id;

    console.log('☑️ Toggle chọn tất cả:', selected);

    // Validate
    if (typeof selected !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái chọn phải là true hoặc false'
      });
    }

    // ✅ SỬA: Bỏ Enable vì không có trong database
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

    // Cập nhật tất cả items
    const [updatedCount] = await GioHangChiTiet.update(
      { 
        DaChon: selected
      },
      {
        where: {
          GioHangID: gioHang.ID
        }
      }
    );

    console.log(`✅ Đã cập nhật ${updatedCount} sản phẩm`);

    return res.status(200).json({
      success: true,
      message: `Đã ${selected ? 'chọn' : 'bỏ chọn'} tất cả sản phẩm`,
      data: {
        updatedCount: updatedCount,
        selected: selected
      }
    });

  } catch (error) {
    console.error('❌ Lỗi toggle chọn tất cả:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

/**
 * Chọn tất cả sản phẩm trong giỏ hàng (GUEST)
 * PUT /api/cart/guest/select-all
 * Body: { sessionId, selected: true/false }
 */
exports.toggleSelectAllGuest = async (req, res) => {
  try {
    const { sessionId, selected } = req.body;

    console.log('☑️ Toggle chọn tất cả guest:', selected);

    // Validate
    if (!sessionId || sessionId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Session ID không được để trống'
      });
    }

    if (typeof selected !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái chọn phải là true hoặc false'
      });
    }

    // ✅ SỬA: Bỏ Enable vì không có trong database
    // Cập nhật tất cả items
    const [updatedCount] = await GioHangKhachVangLai.update(
      { 
        DaChon: selected
      },
      {
        where: {
          MaPhien: sessionId
        }
      }
    );

    console.log(`✅ Đã cập nhật ${updatedCount} sản phẩm guest`);

    return res.status(200).json({
      success: true,
      message: `Đã ${selected ? 'chọn' : 'bỏ chọn'} tất cả sản phẩm`,
      data: {
        updatedCount: updatedCount,
        selected: selected
      }
    });

  } catch (error) {
    console.error('❌ Lỗi toggle chọn tất cả guest:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách sản phẩm đã chọn (USER)
 * GET /api/cart/selected
 */
exports.getSelectedItems = async (req, res) => {
  try {
    const taiKhoanId = req.user.id;

    console.log('📦 Lấy danh sách sản phẩm đã chọn - User:', taiKhoanId);

    // ✅ SỬA: Bỏ Enable vì không có trong database
    // Tìm giỏ hàng của user
    const gioHang = await GioHang.findOne({
      where: { TaiKhoanID: taiKhoanId },
      include: [{
        model: GioHangChiTiet,
        as: 'chiTiet',
        where: { 
          DaChon: true // ✅ CHỈ LẤY SẢN PHẨM ĐÃ CHỌN
        },
        required: false,
        include: [{
          model: SanPham,
          as: 'sanPham',
          where: { TrangThai: true },
          required: true,
          attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'SoLuongTon', 'TrangThai']
        }]
      }]
    });

    if (!gioHang || !gioHang.chiTiet || gioHang.chiTiet.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Chưa có sản phẩm nào được chọn',
        data: {
          items: [],
          totalItems: 0,
          totalAmount: 0
        }
      });
    }

    // Tính tổng tiền và sử dụng DTOMapper
    let totalAmount = new Decimal(0);
    const items = gioHang.chiTiet.map(item => {
      const itemTotal = new Decimal(item.DonGia).times(item.SoLuong);
      totalAmount = totalAmount.plus(itemTotal);
      
      const itemData = DTOMapper.toCamelCase(item.toJSON());
      return {
        ...itemData,
        thanhTien: parseFloat(itemTotal.toFixed(2))
      };
    });

    console.log(`✅ Tìm thấy ${items.length} sản phẩm đã chọn`);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách sản phẩm đã chọn thành công',
      data: {
        items: items,
        totalItems: items.length,
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy sản phẩm đã chọn:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách sản phẩm đã chọn (GUEST)
 * GET /api/cart/guest/selected?sessionId=xxx
 */
exports.getSelectedGuestItems = async (req, res) => {
  try {
    const { sessionId } = req.query;

    console.log('📦 Lấy danh sách sản phẩm đã chọn - Guest:', sessionId);

    // Validate
    if (!sessionId || sessionId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Session ID không được để trống'
      });
    }

    // ✅ SỬA: Bỏ Enable vì không có trong database
    // Lấy sản phẩm đã chọn
    const cartItems = await GioHangKhachVangLai.findAll({
      where: {
        MaPhien: sessionId,
        DaChon: true // ✅ CHỈ LẤY SẢN PHẨM ĐÃ CHỌN
      },
      include: [{
        model: SanPham,
        as: 'sanPham',
        where: { TrangThai: true },
        required: true,
        attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'SoLuongTon']
      }]
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Chưa có sản phẩm nào được chọn',
        data: {
          items: [],
          totalItems: 0,
          totalAmount: 0
        }
      });
    }

    // ✅ Tính tổng tiền và sử dụng DTOMapper
    let totalAmount = new Decimal(0);
    const items = cartItems.map(item => {
      const itemTotal = new Decimal(item.DonGia).times(item.SoLuong);
      totalAmount = totalAmount.plus(itemTotal);
      
      const itemData = DTOMapper.toCamelCase(item.toJSON());
      return {
        ...itemData,
        thanhTien: parseFloat(itemTotal.toFixed(2))
      };
    });

    console.log(`✅ Tìm thấy ${items.length} sản phẩm đã chọn (guest)`);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách sản phẩm đã chọn thành công',
      data: {
        sessionId: sessionId,
        items: items,
        totalItems: items.length,
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy sản phẩm đã chọn guest:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};
