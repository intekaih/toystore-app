// src/components/CategoryTable.js
import React from 'react';
import '../styles/CategoryTable.css';

const CategoryTable = ({ categories, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>Chưa có danh mục nào</h3>
        <p>Hãy tạo danh mục đầu tiên cho cửa hàng của bạn</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="category-table">
        <thead>
          <tr>
            <th>Mã loại</th>
            <th>Tên loại</th>
            <th>Mô tả</th>
            <th>Số lượng SP</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.ID}>
              <td className="category-id">#{category.ID}</td>
              <td className="category-name">{category.Ten}</td>
              <td className="category-description">
                {category.MoTa || <span className="no-description">Chưa có mô tả</span>}
              </td>
              <td className="product-count">
                <span className="badge badge-count">{category.SoLuongSanPham || 0} sản phẩm</span>
              </td>
              <td>
                {category.Enable ? (
                  <span className="badge badge-active">✅ Hoạt động</span>
                ) : (
                  <span className="badge badge-inactive">🔒 Vô hiệu</span>
                )}
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-action btn-edit"
                    onClick={() => onEdit(category)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => onDelete(category)}
                    title="Xóa"
                    disabled={category.SoLuongSanPham > 0}
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

export default CategoryTable;
