const db = require('../models');
const GioHang = db.GioHang;
const GioHangChiTiet = db.GioHangChiTiet;
const SanPham = db.SanPham;

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const { sanPhamId, soLuong = 1 } = req.body;
    const taiKhoanId = req.user.id;

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
        message: `Chỉ còn ${sanPham.Ton} sản phẩm trong kho`
      });
    }

    // Tìm hoặc tạo giỏ hàng cho user
    let gioHang = await GioHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    if (!gioHang) {
      gioHang = await GioHang.create({
        TaiKhoanID: taiKhoanId
      });
    }

    // ✅ Kiểm tra sản phẩm đã có trong giỏ hàng chưa - KHÔNG LẤY DonGia
    const existingItem = await GioHangChiTiet.findOne({
      where: {
        GioHangID: gioHang.ID,
        SanPhamID: sanPhamId
      },
      attributes: ['ID', 'GioHangID', 'SanPhamID', 'SoLuong', 'NgayThem']
    });

    let cartItem;

    if (existingItem) {
      // Cập nhật số lượng
      const newQuantity = existingItem.SoLuong + soLuong;
      
      if (newQuantity > sanPham.Ton) {
        return res.status(400).json({
          success: false,
          message: `Số lượng vượt quá tồn kho. Chỉ còn ${sanPham.Ton} sản phẩm`
        });
      }

      existingItem.SoLuong = newQuantity;
      await existingItem.save();
      cartItem = existingItem;
    } else {
      // Thêm mới vào giỏ hàng - KHÔNG GỬI NgayThem
      cartItem = await GioHangChiTiet.create({
        GioHangID: gioHang.ID,
        SanPhamID: sanPhamId,
        SoLuong: soLuong
        // ✅ KHÔNG GỬI NgayThem, để SQL Server tự tạo
      });
    }

    // ✅ Lấy thông tin chi tiết - Tính ThanhTien từ GiaBan
    const result = await GioHangChiTiet.findOne({
      where: { ID: cartItem.ID },
      attributes: ['ID', 'GioHangID', 'SanPhamID', 'SoLuong', 'NgayThem'],
      include: [{
        model: SanPham,
        as: 'sanPham',
        attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL', 'Ton']
      }]
    });

    // ✅ Thêm thông tin ThanhTien vào response
    const response = {
      ...result.toJSON(),
      thanhTien: result.SoLuong * result.sanPham.GiaBan
    };

    return res.status(200).json({
      success: true,
      message: existingItem ? 'Cập nhật số lượng thành công' : 'Thêm vào giỏ hàng thành công',
      data: response
    });

  } catch (error) {
    console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        attributes: ['ID', 'GioHangID', 'SanPhamID', 'SoLuong', 'NgayThem'],
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

    // ✅ Tính tổng tiền từ GiaBan
    let totalAmount = 0;
    const items = gioHang.chiTiet.map(item => {
      const thanhTien = item.SoLuong * (item.sanPham?.GiaBan || 0);
      totalAmount += thanhTien;
      
      return {
        ...item.toJSON(),
        thanhTien
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        attributes: ['ID', 'Ten', 'GiaBan', 'Ton', 'Enable']
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
    const newQuantity = cartItem.SoLuong + 1;
    if (newQuantity > cartItem.sanPham.Ton) {
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${cartItem.sanPham.Ton} sản phẩm trong kho`
      });
    }

    // Tăng số lượng
    cartItem.SoLuong = newQuantity;
    await cartItem.save();

    console.log('✅ Đã tăng số lượng:', { 
      productId, 
      oldQty: newQuantity - 1, 
      newQty: newQuantity 
    });

    // Trả về item đã cập nhật với thông tin sản phẩm
    const updatedItem = {
      ...cartItem.toJSON(),
      thanhTien: cartItem.SoLuong * cartItem.sanPham.GiaBan
    };

    return res.status(200).json({
      success: true,
      message: 'Đã tăng số lượng sản phẩm',
      data: updatedItem
    });

  } catch (error) {
    console.error('❌ Lỗi khi tăng số lượng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        attributes: ['ID', 'Ten', 'GiaBan', 'Ton', 'Enable']
      }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    // Nếu số lượng là 1, xóa sản phẩm khỏi giỏ hàng
    if (cartItem.SoLuong <= 1) {
      await cartItem.destroy();
      
      console.log('🗑️ Đã xóa sản phẩm (số lượng = 1):', productId);
      
      return res.status(200).json({
        success: true,
        message: 'Đã xóa sản phẩm khỏi giỏ hàng',
        data: {
          removed: true,
          productId: parseInt(productId)
        }
      });
    }

    // Giảm số lượng
    cartItem.SoLuong -= 1;
    await cartItem.save();

    console.log('✅ Đã giảm số lượng:', { 
      productId, 
      oldQty: cartItem.SoLuong + 1, 
      newQty: cartItem.SoLuong 
    });

    // Trả về item đã cập nhật
    const updatedItem = {
      ...cartItem.toJSON(),
      thanhTien: cartItem.SoLuong * cartItem.sanPham.GiaBan
    };

    return res.status(200).json({
      success: true,
      message: 'Đã giảm số lượng sản phẩm',
      data: {
        ...updatedItem,
        removed: false
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi giảm số lượng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
