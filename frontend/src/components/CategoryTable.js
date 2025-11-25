// src/components/CategoryTable.js
import React from 'react';
import { Edit, Trash2, CheckCircle, Lock, FolderOpen } from 'lucide-react';
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
        <div className="empty-icon">
          <FolderOpen size={48} className="text-gray-400" />
        </div>
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
            <th>Số lượng SP</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id || category.ID}>
              <td className="category-id">#{category.id || category.ID}</td>
              <td className="category-name">{category.ten || category.Ten}</td>
              <td className="product-count">
                <span className="badge badge-count">
                  {category.soLuongSanPham || category.SoLuongSanPham || 0} sản phẩm
                </span>
              </td>
              <td>
                {(category.trangThai ?? category.TrangThai) ? (
                  <span className="badge badge-active" style={{display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center'}}>
                    <CheckCircle size={14} /> Hoạt động
                  </span>
                ) : (
                  <span className="badge badge-inactive" style={{display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center'}}>
                    <Lock size={14} /> Vô hiệu
                  </span>
                )}
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-action btn-edit"
                    onClick={() => onEdit(category)}
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => onDelete(category)}
                    title="Xóa"
                    disabled={(category.soLuongSanPham || category.SoLuongSanPham || 0) > 0}
                  >
                    <Trash2 size={16} />
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
