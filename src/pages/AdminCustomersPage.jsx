import React, { useEffect, useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthContext';

// Hàm tiện ích: Bóc tách dấu tiếng Việt để tìm kiếm
const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

// Hàm tiện ích: Quét tên người dùng
const getCustomerName = (customer) => {
  if (!customer) return '';
  return customer.name || customer.fullName || [customer.lastName, customer.firstName].filter(Boolean).join(' ') || customer.username || '';
};

function AdminCustomersPage() {
  usePageTitle('Quản lý Khách hàng');

  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '', username: '', name: '', email: '', phone: '', role: 'USER', status: 'Hoạt động'
  });

  // 1. TẢI DỮ LIỆU
  async function fetchUsers() {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Lỗi tải danh sách');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  // Mở modal xem chi tiết
  const handleOpenDetails = (customer) => {
    const isActive = customer.enabled !== false && customer.active !== false && customer.status !== 'LOCKED';
    setFormData({
      id: customer.id,
      username: customer.username || '', 
      name: getCustomerName(customer), 
      email: customer.email || '',
      phone: customer.phoneNumber || customer.phone || '',
      role: customer.role || 'USER', 
      status: isActive ? 'Hoạt động' : 'Khóa'
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // 2. LƯU THÔNG TIN (CHỈ LƯU ROLE VÌ ADMIN KHÔNG THAY ĐỔI ĐƯỢC INFO KHÁCH)
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      // CHÚ Ý: Đã đổi Endpoint thành gọi API cập nhật Role riêng biệt
      const response = await fetch(`${API_URL}/api/admin/users/${formData.id}/role`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: formData.role }) // Backend map vào UpdateRoleRequest
      });

      if (!response.ok) throw new Error('Lỗi gọi API sửa Role');

      setUsers(prev => prev.map(user => user.id === formData.id ? { ...user, role: formData.role } : user));
      setIsEditing(false);
      setIsModalOpen(false);
      alert('Cập nhật Vai Trò (Role) thành công! (Tên và Số điện thoại chỉ có tài khoản khách mới tự đổi được)');
    } catch (error) {
      console.error(error);
      alert('Sửa thất bại! Hãy chắc chắn Backend của bạn có cấu hình Endpoint: PUT /api/admin/users/{id}/role');
    } finally {
      setIsSaving(false);
    }
  };

  // 3. KHÓA / MỞ KHÓA TÀI KHOẢN
  const handleToggleLock = async (id) => {
    const userToToggle = users.find(u => u.id === id);
    if (!userToToggle) return;

    const isCurrentlyActive = userToToggle.enabled !== false && userToToggle.active !== false && userToToggle.status !== 'LOCKED';
    const newStatusActive = !isCurrentlyActive;

    if (!window.confirm(`Bạn có chắc chắn muốn ${newStatusActive ? "MỞ KHÓA" : "KHÓA"} tài khoản này không?`)) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      // CHÚ Ý: Đã đổi Endpoint gọi riêng để Set Enable/Status
      const response = await fetch(`${API_URL}/api/admin/users/${id}/enable?enabled=${newStatusActive}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Lỗi API Khóa tài khoản');

      setUsers(prevUsers => prevUsers.map(customer => {
        if (customer.id === id) {
          return { ...customer, status: newStatusActive ? 'ACTIVE' : 'LOCKED', enabled: newStatusActive, active: newStatusActive };
        }
        return customer;
      }));
    } catch (error) {
      console.error(error);
      alert('Khóa/Mở khóa thất bại! Hãy kiểm tra xem Backend có Endpoint: PUT /api/admin/users/{id}/enable không nhé.');
    }
  };

  // 4. XÓA TÀI KHOẢN (KÈM CẢNH BÁO KHÓA NGOẠI)
  async function handleDeleteUser(id) {
    if (!window.confirm('CẢNH BÁO SQL: Nếu user này từng MUA HÀNG hoặc ĐÁNH GIÁ, xóa sẽ gây lỗi Khóa Ngoại ở Backend (Không xóa được). Lời khuyên là hãy dùng nút KHÓA thay vì XÓA. Bạn vẫn muốn thử xóa?')) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        if (formData.id === id) setIsModalOpen(false);
      } else {
        alert('Lỗi! Trực trặc do Khóa Ngoại (Foreign Key Constraint) trong Database. Xin hãy dùng tính năng KHÓA tài khoản thay thế!');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const filteredUsers = users.filter(customer => {
    let matchStatus = true;
    const isActive = customer.enabled !== false && customer.active !== false && customer.status !== 'LOCKED';
    
    if (statusFilter === 'Hoạt động') matchStatus = isActive === true;
    if (statusFilter === 'Khóa') matchStatus = isActive === false;

    const query = removeVietnameseTones(searchQuery).toLowerCase().trim();
    const matchSearch =
      removeVietnameseTones(getCustomerName(customer)).toLowerCase().includes(query) ||
      removeVietnameseTones(customer.email || '').toLowerCase().includes(query) ||
      String(customer.phoneNumber || customer.phone || '').includes(query);

    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-serif">Quản lý Khách hàng</h1>
        <p className="text-gray-500 mt-1">Danh sách tài khoản khách hàng, lịch sử mua hàng và quản lý trạng thái</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
          </div>
          <input
            type="text"
            placeholder="Tên, email hoặc sđt..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-80 text-sm outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-sm cursor-pointer outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="Tất cả trạng thái">Tất cả trạng thái</option>
          <option value="Hoạt động">Hoạt động</option>
          <option value="Khóa">Bị khóa</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Khách Hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số Điện Thoại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai Trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((customer) => {
                const isActive = customer.enabled !== false && customer.active !== false && customer.status !== 'LOCKED';
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getCustomerName(customer) || 'Người dùng'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phoneNumber || customer.phone || 'Chưa cập nhật'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-0.5 text-xs rounded font-mono ${customer.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 font-bold' : 'bg-gray-100 text-gray-700'}`}>
                        {customer.role || 'USER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isActive ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Hoạt động</span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Khóa</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-4">
                      <button onClick={() => handleOpenDetails(customer)} className="text-blue-600 hover:text-blue-900 transition" title="Xem chi tiết">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button onClick={() => handleToggleLock(customer.id)} className="transition focus:outline-none" title={isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                        {isActive ? (
                          <span className="material-symbols-outlined text-[20px] text-amber-500 hover:text-amber-700">lock_open</span>
                        ) : (
                          <span className="material-symbols-outlined text-[20px] text-red-600 hover:text-red-800 animate-pulse">lock</span>
                        )}
                      </button>
                      <button onClick={() => handleDeleteUser(customer.id)} className="text-gray-400 hover:text-red-600 transition" title="Xóa vĩnh viễn">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-400 text-sm">
                  Không tìm thấy khách hàng nào khớp với điều kiện tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl transform transition-all border border-gray-100 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">person</span>
                <h3 className="text-lg font-bold"> Chi Tiết Tài Khoản </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveChanges} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tên đăng nhập</label>
                  {/* LUÔN DISABLED vì Admin không nên đổi Username */}
                  <input type="text" disabled={true} className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-400 rounded-md text-sm cursor-not-allowed" value={formData.username} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Họ và tên</label>
                  {/* LUÔN DISABLED vì Admin không nên đổi Info cá nhân */}
                  <input type="text" disabled={true} className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-400 rounded-md text-sm cursor-not-allowed" value={formData.name} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Email</label>
                  <input type="email" disabled={true} className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-400 rounded-md text-sm cursor-not-allowed" value={formData.email} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Số điện thoại</label>
                  <input type="text" disabled={true} className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-400 rounded-md text-sm cursor-not-allowed" value={formData.phone} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Vai trò tài khoản (Role)</label>
                  {/* CHỈ CÓ ROLE LÀ CHO PHÉP SỬA */}
                  <select disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md text-sm outline-none ${isEditing ? 'border-blue-500 bg-white cursor-pointer' : 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'}`} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    <option value="USER">USER (Người dùng / Khách hàng)</option>
                    <option value="ADMIN">ADMIN (Quản trị viên)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                {!isEditing ? (
                  <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow transition">
                    <span className="material-symbols-outlined text-[18px]">edit</span> Phân quyền Role
                  </button>
                ) : (
                  <>
                    <button type="button" disabled={isSaving} onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition">Hủy</button>
                    <button type="submit" disabled={isSaving} className={`flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-md shadow transition ${isSaving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                      <span className="material-symbols-outlined text-[18px]">{isSaving ? 'sync' : 'save'}</span> 
                      {isSaving ? 'Đang lưu...' : 'Lưu quyền (Role)'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomersPage;