import { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthContext';

function AdminPromotionsPage() {
  usePageTitle('Quản lý Khuyến mãi');

  // --- 1. KHAI BÁO STATE ---
  const { token } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho Modal (Popup) Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = Thêm mới, có ID = Chỉnh sửa
  
  // Dữ liệu mặc định của Form
  const initialFormState = {
    code: '',
    description: '',
    discountType: 'FIXED', // 'FIXED' hoặc 'PERCENT'
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    startAt: '',
    endAt: '',
    active: true
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 2. GỌI API LẤY DANH SÁCH ---
  const fetchVouchers = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/admin/vouchers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Không thể tải dữ liệu Khuyến mãi từ máy chủ.');

      const data = await response.json();
      setVouchers(data.content || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchVouchers();
  }, [token]);

  // --- 3. LOGIC MỞ ĐÓNG MODAL ---
  // Mở popup (truyền voucher vào nếu là edit, không truyền = add mới)
  const handleOpenModal = (voucher = null) => {
    if (voucher) {
      setEditingId(voucher.id);
      setFormData({
        code: voucher.code || '',
        description: voucher.description || '',
        discountType: voucher.discountType || 'FIXED',
        discountValue: voucher.discountValue || '',
        minOrderAmount: voucher.minOrderAmount || '',
        maxDiscountAmount: voucher.maxDiscountAmount || '',
        usageLimit: voucher.usageLimit || '',
        startAt: voucher.startAt ? voucher.startAt.substring(0, 16) : '',
        endAt: voucher.endAt ? voucher.endAt.substring(0, 16) : '',
        active: voucher.active !== false
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  // --- 4. LOGIC LƯU DỮ LIỆU (THÊM / SỬA) ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const url = editingId 
        ? `${API_URL}/api/admin/vouchers/${editingId}` 
        : `${API_URL}/api/admin/vouchers`;
      const method = editingId ? 'PUT' : 'POST';

      // Sao chép dữ liệu từ form ra payload
      const payload = { ...formData };
      
      // Ép chuẩn kiểu số cho các trường số học khác
      payload.discountValue = Number(payload.discountValue);
      payload.minOrderAmount = payload.minOrderAmount ? Number(payload.minOrderAmount) : 0;
      payload.maxDiscountAmount = payload.maxDiscountAmount ? Number(payload.maxDiscountAmount) : null;
      payload.usageLimit = payload.usageLimit ? Number(payload.usageLimit) : null;
      
      // Định dạng ngày tháng cho LocalDateTime Spring Boot
      if (payload.startAt) {
        payload.startAt = payload.startAt.replace('T', ' ') + ':00';
      } else {
        payload.startAt = null;
      }
      
      if (payload.endAt) {
        payload.endAt = payload.endAt.replace('T', ' ') + ':00';
      } else {
        payload.endAt = null;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Có lỗi xảy ra khi lưu Voucher!');
      }

      alert(editingId ? 'Cập nhật mã giảm giá thành công!' : 'Thêm mã giảm giá thành công!');
      handleCloseModal();
      fetchVouchers(); // Tải lại danh sách mới nhất từ Database

    } catch (err) {
      console.error('Lỗi lưu voucher:', err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 5. LOGIC BẬT/TẮT NHANH (Sử dụng PATCH API mới) ---
  const handleToggleActive = async (id, currentStatus) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/admin/vouchers/${id}/active?active=${!currentStatus}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setVouchers(vouchers.map((v) => (v.id === id ? { ...v, active: !currentStatus } : v)));
      } else {
        alert('Không thể cập nhật trạng thái Voucher');
      }
    } catch (err) {
      console.error('Lỗi chuyển trạng thái:', err);
    }
  };

  // --- 5. LOGIC XÓA VOUCHER ---
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này không?')) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/admin/vouchers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setVouchers(vouchers.filter((v) => v.id !== id));
      } else {
        alert('Có lỗi xảy ra khi xóa Voucher!');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  // --- CÁC HÀM HELPER HIỂN THỊ UI ---
  const formatDiscountValue = (voucher) => {
    if (voucher.discountType === 'PERCENT') return `${voucher.discountValue}%`;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.discountValue || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không giới hạn';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusUI = (voucher) => {
    if (voucher.active === false) return <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-red-100 text-red-800">Đã khóa</span>;
    if (voucher.endAt && new Date(voucher.endAt) < new Date()) return <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800">Hết hạn</span>;
    return <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800">Hoạt động</span>;
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý Khuyến mãi</h1>
          <p className="mt-2 text-gray-600">Quản lý mã giảm giá, chương trình sale, flash sale và banner quảng cáo</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo khuyến mãi
        </button>
      </div>

      {/* Content Area */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : error ? (
          <div className="p-10 text-center text-red-500"><p>{error}</p><button onClick={fetchVouchers} className="mt-4 text-blue-600 hover:underline">Thử lại</button></div>
        ) : vouchers.length === 0 ? (
          <div className="p-10 text-center text-gray-500">Chưa có mã giảm giá nào trong hệ thống.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Code</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Loại & Giá trị</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian áp dụng</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Đã dùng</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap"><span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">{voucher.code}</span></td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{formatDiscountValue(voucher)}</div>
                      <div className="text-xs text-gray-500">Đơn tối thiểu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.minOrderAmount || 0)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>Từ: {formatDate(voucher.startAt)}</div>
                      <div>Đến: {formatDate(voucher.endAt)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{voucher.usedCount || 0} / {voucher.usageLimit ? voucher.usageLimit : '∞'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleToggleActive(voucher.id, voucher.active)}
                        title="Nhấn để thay đổi trạng thái"
                        className="transition-opacity hover:opacity-80"
                      >
                        {getStatusUI(voucher)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleOpenModal(voucher)} className="text-blue-600 hover:text-blue-800 transition" title="Chỉnh sửa">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(voucher.id)} className="text-red-600 hover:text-red-800 transition" title="Xóa">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- POPUP (MODAL) FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Chỉnh sửa Mã Giảm Giá' : 'Thêm mới Mã Giảm Giá'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="voucherForm" onSubmit={handleSubmit} className="space-y-4">
                {/* Dòng 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã Code *</label>
                    <input type="text" name="code" value={formData.code} onChange={handleChange} required placeholder="VD: SUMMER2024" className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn số lần dùng</label>
                    <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} min="1" placeholder="Để trống = Không giới hạn" className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chương trình</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="VD: Giảm giá mùa hè cho tất cả đơn hàng..." className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"/>
                </div>

                {/* Dòng 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
                    <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-sm">
                      <option value="FIXED">Giảm cố định (VND)</option>
                      <option value="PERCENT">Giảm theo Phần trăm (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá trị giảm *
                    </label>
                    <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} required min="1" placeholder={formData.discountType === 'FIXED' ? 'VD: 50000' : 'VD: 10'} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
                  </div>
                </div>

                {/* Dòng 3 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu (VND)</label>
                    <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} min="0" placeholder="VD: 200000" className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa (VND)</label>
                    <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} min="0" placeholder="Để trống = Không giới hạn" disabled={formData.discountType === 'FIXED'} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"/>
                  </div>
                </div>

                {/* Dòng 4 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                    <input type="datetime-local" name="startAt" value={formData.startAt} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                    <input type="datetime-local" name="endAt" value={formData.endAt} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
                  </div>
                </div>

                {/* Dòng 5 (Trạng thái) */}
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                  <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">Kích hoạt mã giảm giá ngay lập tức</label>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Hủy bỏ
              </button>
              <button type="submit" form="voucherForm" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                {isSubmitting ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo mã mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPromotionsPage;