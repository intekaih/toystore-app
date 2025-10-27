// src/components/ProductTable.jsx
import React from 'react';
import '../styles/ProductTable.css';

const ProductTable = ({ products, categories, onEdit, onDelete }) => {
  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Lấy tên loại sản phẩm - Ưu tiên từ product.loaiSP, nếu không có thì tìm trong categories
  const getCategoryName = (product) => {
    // Nếu API trả về loaiSP object, dùng luôn
    if (product.loaiSP && product.loaiSP.ten) {
      return product.loaiSP.ten;
    }
    
    // Nếu không, tìm trong mảng categories bằng loaiID
    const loaiID = product.loaiID; // Sửa từ loaiId thành loaiID
    const category = categories.find(cat => cat.id === loaiID);
    return category ? category.ten : 'Không xác định';
  };

  // Lấy URL ảnh đầy đủ - Sửa từ hinhAnh thành hinhAnhURL
  const getImageUrl = (product) => {
    const hinhAnhURL = product.hinhAnhURL; // Sửa từ hinhAnh thành hinhAnhURL
    if (!hinhAnhURL) return '/barbie.jpg'; // Ảnh mặc định
    if (hinhAnhURL.startsWith('http')) return hinhAnhURL;
    return `http://localhost:5000${hinhAnhURL}`;
  };

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
          {products.map((product) => (
            <tr key={product.id} className={!product.enable ? 'disabled-row' : ''}>
              <td className="id-col">#{product.id}</td>
              
              <td className="image-col">
                <img
                  src={getImageUrl(product)}
                  alt={product.ten}
                  className="product-thumbnail"
                  onError={(e) => {
                    e.target.src = '/barbie.jpg';
                  }}
                />
              </td>
              
              <td className="name-col">
                <div className="product-name">{product.ten}</div>
                {product.moTa && (
                  <div className="product-desc" title={product.moTa}>
                    {product.moTa.length > 50
                      ? product.moTa.substring(0, 50) + '...'
                      : product.moTa}
                  </div>
                )}
              </td>
              
              <td className="category-col">
                <span className="category-badge">
                  {getCategoryName(product)}
                </span>
              </td>
              
              <td className="price-col">
                <span className="price">{formatPrice(product.giaBan)}</span>
              </td>
              
              <td className="stock-col">
                <span className={`stock-badge ${product.ton === 0 ? 'out-of-stock' : product.ton < 10 ? 'low-stock' : 'in-stock'}`}>
                  {product.ton} {product.ton === 0 ? '(Hết hàng)' : product.ton < 10 ? '(Sắp hết)' : ''}
                </span>
              </td>
              
              <td className="status-col">
                <span className={`status-badge ${product.enable ? 'active' : 'inactive'}`}>
                  {product.enable ? '✅ Đang bán' : '❌ Đã ẩn'}
                </span>
              </td>
              
              <td className="date-col">
                {formatDate(product.createdAt)}
              </td>
              
              <td className="actions-col">
                <div className="action-buttons">
                  <button
                    className="btn-edit"
                    onClick={() => onEdit(product)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(product.id)}
                    title="Xóa"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
