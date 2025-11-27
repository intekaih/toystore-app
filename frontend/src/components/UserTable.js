// src/components/UserTable.js
import React from 'react';
import '../styles/UserTable.css';
import { RoleChecker } from '../constants/roles';
import { Edit, Trash2, Lock, Unlock, CheckCircle, XCircle, Inbox } from 'lucide-react';

const UserTable = ({ users, onEdit, onDelete, onToggleStatus, loading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const displayInfo = RoleChecker.getDisplayInfo(role);
    return (
      <span className={`badge badge-${displayInfo.color}`}>
        {displayInfo.icon} {displayInfo.label}
      </span>
    );
  };

  const getStatusBadge = (enable) => {
    if (enable) {
      return (
        <span className="badge badge-active" style={{display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center'}}>
          <CheckCircle size={14} /> Hoạt động
        </span>
      );
    }
    return (
      <span className="badge badge-inactive" style={{display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center'}}>
        <Lock size={14} /> Bị khóa
      </span>
    );
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
        <div className="empty-icon">
          <Inbox size={48} className="text-gray-400" />
        </div>
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
              <td>{getRoleBadge(user.vaiTro || user.role)}</td>
              <td>{getStatusBadge(user.enable)}</td>
              <td>{formatDate(user.ngayTao)}</td>
              <td>
                <div className="flex items-center gap-2 justify-center">
                  <button
                    onClick={() => onToggleStatus(user)}
                    className={`p-2 rounded-lg transition-all ${
                      user.enable
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    title={user.enable ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                  >
                    {user.enable ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                  <button
                    onClick={() => onEdit(user)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                    title="Xóa"
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

export default UserTable;
