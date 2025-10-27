// src/components/UserTable.js
import React from 'react';
import '../styles/UserTable.css';

const UserTable = ({ users, onEdit, onDelete, onToggleStatus, loading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="badge badge-admin">👑 Admin</span>;
    }
    return <span className="badge badge-user">👤 User</span>;
  };

  const getStatusBadge = (enable) => {
    if (enable) {
      return <span className="badge badge-active">✅ Hoạt động</span>;
    }
    return <span className="badge badge-inactive">🔒 Bị khóa</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>Không tìm thấy người dùng nào</h3>
        <p>Hãy thử điều chỉnh bộ lọc hoặc thêm người dùng mới</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên đăng nhập</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td className="username">{user.tenDangNhap}</td>
              <td>{user.hoTen}</td>
              <td>{user.email || 'N/A'}</td>
              <td>{user.dienThoai || 'N/A'}</td>
              <td>{getRoleBadge(user.vaiTro)}</td>
              <td>{getStatusBadge(user.enable)}</td>
              <td>{formatDate(user.ngayTao)}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-action btn-edit"
                    onClick={() => onEdit(user)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                  <button
                    className={`btn-action ${user.enable ? 'btn-lock' : 'btn-unlock'}`}
                    onClick={() => onToggleStatus(user)}
                    title={user.enable ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                  >
                    {user.enable ? '🔒' : '🔓'}
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => onDelete(user)}
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

export default UserTable;
