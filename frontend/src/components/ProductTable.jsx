// src/components/ProductTable.jsx
import React from 'react';
import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import '../styles/ProductTable.css';
import config from '../config';

const ProductTable = ({ products, categories, onEdit, onDelete, isStaffView = false }) => {
  // Format giá tiền với error handling
  const formatPrice = (price) => {
    try {
      if (!price && price !== 0) return '0₫';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
    } catch (error) {
      console.error('Error formatting price:', error, price);
      return '0₫';
    }
  };

  // Format ngày tháng với error handling
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'N/A';
    }
  };

  // Lấy tên loại sản phẩm với error handling
  const getCategoryName = (product) => {
    try {
      // ✅ Backend đã convert sang camelCase, kiểm tra cả camelCase và PascalCase
      if (product.loaiSP) {
        // Kiểm tra camelCase (sau DTOMapper)
        if (product.loaiSP.ten) {
          return product.loaiSP.ten;
        }
        // Kiểm tra PascalCase (nếu chưa convert)
        if (product.loaiSP.Ten) {
          return product.loaiSP.Ten;
        }
      }
      
      // Nếu không có loaiSP, tìm trong mảng categories bằng loaiID
      const loaiID = product.loaiID || product.IDLoai || product.idLoai;
      if (loaiID && categories && categories.length > 0) {
        const category = categories.find(cat => cat.id === loaiID || cat.ID === loaiID);
        if (category) {
          return category.ten || category.Ten || category.TenLoai;
        }
      }
      
      return 'Chưa phân loại';
    } catch (error) {
      console.error('Error getting category name:', error);
      return 'Chưa phân loại';
    }
  };

  // Lấy URL ảnh đầy đủ với error handling
  const getImageUrl = (product) => {
    try {
      // Thử lấy từ hinhAnhURL trực tiếp
      if (product.hinhAnhURL) {
        // Nếu đã là full URL thì return luôn
        if (product.hinhAnhURL.startsWith('http')) {
          return product.hinhAnhURL;
        }
        // Nếu không thì dùng config để build URL
        return config.getImageUrl(product.hinhAnhURL);
      }
      
      // Thử lấy từ mảng hinhAnhs (nếu có)
      if (product.hinhAnhs && Array.isArray(product.hinhAnhs) && product.hinhAnhs.length > 0) {
        const firstImage = product.hinhAnhs[0].duongDanHinhAnh;
        if (firstImage.startsWith('http')) {
          return firstImage;
        }
        return config.getImageUrl(firstImage);
      }
      
      // Fallback về ảnh mặc định
      return '/barbie.jpg';
    } catch (error) {
      console.error('Error getting image URL:', error, product);
      return '/barbie.jpg';
    }
  };

  // ✅ Kiểm tra products có hợp lệ không
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="product-table-container">
        <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
          Không có sản phẩm nào
        </div>
      </div>
    );
  }

  console.log('🔍 ProductTable rendering with', products.length, 'products');

  return (
    <div className="product-table-container">
      <table className="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Loại</th>
            <th>Giá bán</th>
            <th>Tồn kho</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            try {
              // ✅ Normalize dữ liệu từ PascalCase (backend) sang camelCase (frontend)
              const normalizedProduct = {
                id: product.ID || product.id,
                ten: product.Ten || product.ten,
                moTa: product.MoTa || product.moTa,
                giaBan: product.GiaBan || product.giaBan || 0,
                soLuongTon: product.SoLuongTon !== undefined ? product.SoLuongTon : (product.soLuongTon !== undefined ? product.soLuongTon : 0),
                trangThai: product.TrangThai !== undefined ? product.TrangThai : (product.trangThai !== undefined ? product.trangThai : 1),
                enable: product.Enable !== undefined ? product.Enable : (product.enable !== undefined ? product.enable : 1),
                ngayTao: product.NgayTao || product.ngayTao,
                hinhAnhURL: product.HinhAnhURL || product.hinhAnhURL,
                loaiSP: product.loaiSP || product.LoaiSP,
                loaiID: product.IDLoai || product.idLoai || product.loaiID,
                ...product // Giữ lại các field khác
              };
              
              // ✅ Hỗ trợ nhiều format tên biến từ backend
              const productStock = normalizedProduct.soLuongTon;
              
              // ✅ Hỗ trợ cả enable và trangThai (1 = active, 0 = inactive)
              const isEnabled = normalizedProduct.trangThai === 1 || normalizedProduct.enable === 1 || normalizedProduct.trangThai === true || normalizedProduct.enable === true;
              
              console.log(`🔍 Rendering product #${index}:`, normalizedProduct.id, normalizedProduct.ten);
              
              return (
                <tr key={normalizedProduct.id || index} className={!isEnabled ? 'disabled-row' : ''} style={{minHeight: '60px'}}>
                  <td className="id-col" style={{color: '#667eea', fontWeight: '600'}}>
                    #{normalizedProduct.id || 'N/A'}
                  </td>
                
                  <td className="image-col">
                    <img
                      src={getImageUrl(normalizedProduct)}
                      alt={normalizedProduct.ten || 'Product'}
                      className="product-thumbnail"
                      onError={(e) => {
                        e.target.src = '/barbie.jpg';
                      }}
                    />
                  </td>
                
                  <td className="name-col">
                    <div className="product-name" style={{color: '#333', fontWeight: '600'}}>
                      {normalizedProduct.ten || 'Không có tên'}
                    </div>
                    {normalizedProduct.moTa && (
                      <div className="product-desc" style={{color: '#888', fontSize: '12px'}} title={normalizedProduct.moTa}>
                        {normalizedProduct.moTa.length > 50
                          ? normalizedProduct.moTa.substring(0, 50) + '...'
                          : normalizedProduct.moTa}
                      </div>
                    )}
                  </td>
                
                  <td className="category-col">
                    <span className="category-badge" style={{background: '#e3f2fd', color: '#1976d2', padding: '4px 12px', borderRadius: '20px', display: 'inline-block'}}>
                      {getCategoryName(normalizedProduct)}
                    </span>
                  </td>
                
                  <td className="price-col">
                    <span className="price" style={{color: '#e91e63', fontWeight: '600', fontSize: '15px'}}>
                      {formatPrice(normalizedProduct.giaBan)}
                    </span>
                  </td>
                
                  <td className="stock-col">
                    <span className={`stock-badge ${productStock === 0 ? 'out-of-stock' : productStock < 10 ? 'low-stock' : 'in-stock'}`}>
                      {productStock} {productStock === 0 ? '(Hết hàng)' : productStock < 10 ? '(Sắp hết)' : ''}
                    </span>
                  </td>
                
                  <td className="status-col">
                    <span className={`status-badge ${isEnabled ? 'active' : 'inactive'}`} style={{display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center'}}>
                      {isEnabled ? (
                        <>
                          <CheckCircle size={14} />
                          Đang bán
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          Đã ẩn
                        </>
                      )}
                    </span>
                  </td>
                
                  <td className="date-col" style={{color: '#666', fontSize: '13px'}}>
                    {formatDate(normalizedProduct.ngayTao)}
                  </td>
                
                  <td className="actions-col">
                    {/* Chỉ hiển thị nút Edit/Delete khi có quyền (không phải Staff hoặc có onEdit/onDelete) */}
                    {!isStaffView && (onEdit || onDelete) && (
                      <div className="action-buttons" style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                        {onEdit && (
                          <button
                            className="btn-edit"
                            onClick={() => onEdit(product)}
                            title="Chỉnh sửa"
                            style={{padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', background: '#e3f2fd', color: '#1976d2', display: 'flex', alignItems: 'center', gap: '4px'}}
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="btn-delete"
                            onClick={() => onDelete(product.id)}
                            title="Xóa"
                            style={{padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', background: '#ffebee', color: '#c62828', display: 'flex', alignItems: 'center', gap: '4px'}}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                    {isStaffView && (
                      <span style={{color: '#999', fontSize: '12px'}}>Chỉ xem</span>
                    )}
                  </td>
                </tr>
              );
            } catch (error) {
              console.error('❌ Error rendering product row:', error, product);
              return (
                <tr key={product.id || index}>
                  <td colSpan="9" style={{padding: '12px', color: 'red', textAlign: 'center'}}>
                    Lỗi hiển thị sản phẩm #{product.id || index}
                  </td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
