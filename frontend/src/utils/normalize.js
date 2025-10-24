/**
 * Normalize Utilities
 * Functions to normalize data from backend (handle both lowercase and uppercase)
 */

/**
 * Normalize product data từ backend
 * @param {Object} data - Raw data từ API
 * @returns {Object} - Normalized product object
 */
export const normalizeProduct = (data) => {
  if (!data) return null;
  
  return {
    id: data.id || data.ID,
    ten: data.ten || data.Ten,
    giaBan: data.giaBan || data.GiaBan,
    ton: data.ton || data.Ton,
    moTa: data.moTa || data.MoTa,
    hinhAnhURL: data.hinhAnhURL || data.HinhAnhURL,
    ngayTao: data.ngayTao || data.NgayTao,
    enable: data.enable || data.Enable,
    loaiSP: data.loaiSP ? {
      id: data.loaiSP.id || data.loaiSP.ID,
      ten: data.loaiSP.ten || data.loaiSP.Ten
    } : null
  };
};

/**
 * Normalize user data
 * @param {Object} data - Raw user data
 * @returns {Object} - Normalized user object
 */
export const normalizeUser = (data) => {
  if (!data) return null;
  
  return {
    id: data.id || data.ID,
    tenDangNhap: data.tenDangNhap || data.TenDangNhap,
    hoTen: data.hoTen || data.HoTen,
    email: data.email || data.Email,
    dienThoai: data.dienThoai || data.DienThoai,
    vaiTro: data.vaiTro || data.VaiTro,
    ngayTao: data.ngayTao || data.NgayTao,
    enable: data.enable || data.Enable
  };
};

/**
 * Normalize cart item data
 * @param {Object} data - Raw cart item
 * @returns {Object} - Normalized cart item
 */
export const normalizeCartItem = (data) => {
  if (!data) return null;
  
  return {
    id: data.id || data.ID,
    gioHangId: data.gioHangId || data.GioHangID,
    sanPhamId: data.sanPhamId || data.SanPhamID,
    soLuong: data.soLuong || data.SoLuong,
    // ✅ Tính donGia từ sanPham.GiaBan, fallback về thanhTien/soLuong
    donGia: data.sanPham?.giaBan || data.sanPham?.GiaBan || 
            (data.thanhTien ? data.thanhTien / data.soLuong : 0),
    thanhTien: data.thanhTien || data.ThanhTien || 
               ((data.sanPham?.giaBan || data.sanPham?.GiaBan || 0) * (data.soLuong || data.SoLuong || 0)),
    ngayThem: data.ngayThem || data.NgayThem,
    sanPham: data.sanPham ? normalizeProduct(data.sanPham) : null
  };
};

/**
 * Normalize order data
 * @param {Object} data - Raw order data
 * @returns {Object} - Normalized order
 */
export const normalizeOrder = (data) => {
  if (!data) return null;
  
  return {
    id: data.id || data.ID,
    maHD: data.maHD || data.MaHD,
    ngayLap: data.ngayLap || data.NgayLap,
    tongTien: data.tongTien || data.TongTien,
    trangThai: data.trangThai || data.TrangThai,
    ghiChu: data.ghiChu || data.GhiChu,
    phuongThucThanhToan: data.phuongThucThanhToan ? {
      id: data.phuongThucThanhToan.id || data.phuongThucThanhToan.ID,
      ten: data.phuongThucThanhToan.ten || data.phuongThucThanhToan.Ten
    } : null,
    chiTiet: data.chiTiet?.map(item => ({
      sanPhamId: item.sanPhamId || item.SanPhamID,
      tenSanPham: item.tenSanPham || item.sanPham?.Ten || item.sanPham?.ten,
      soLuong: item.soLuong || item.SoLuong,
      giaBan: item.giaBan || item.GiaBan,
      thanhTien: item.thanhTien || item.ThanhTien
    })) || []
  };
};

export default {
  normalizeProduct,
  normalizeUser,
  normalizeCartItem,
  normalizeOrder
};