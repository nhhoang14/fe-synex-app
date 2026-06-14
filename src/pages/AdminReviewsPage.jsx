import React, { useEffect, useMemo, useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthContext';

function AdminContactsPage() {
  usePageTitle('Quản lý Phản hồi Liên hệ - Synex');
  
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Gọi API lấy danh sách liên hệ
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/admin/contact-messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Không thể tải danh sách liên hệ');
      
      const data = await response.json();
      // Xử lý trường hợp backend trả về Pageable hoặc Array
      setMessages(Array.isArray(data) ? data : (data.content || []));
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMessages();
  }, [token]);

  // Hàm mapping chủ đề từ value sang text hiển thị (Dựa trên ContactPage.jsx)
  const getTopicName = (topicValue) => {
    switch (topicValue) {
      case 'bao-gia': return 'Báo giá doanh nghiệp';
      case 'bao-hanh': return 'Bảo hành - kỹ thuật';
      case 'don-hang': return 'Đơn hàng - vận chuyển';
      default: return topicValue || 'Chủ đề khác';
    }
  };

  const handleMarkAsProcessed = async (id) => {
    if (!window.confirm('Đánh dấu liên hệ này là "Đã xử lý"?')) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/admin/contact-messages/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'RESOLVED' })
      });

      if (!response.ok) throw new Error('Cập nhật thất bại');
      
      alert('Đã cập nhật trạng thái thành công!');
      fetchMessages();
    } catch (error) {
      alert(error.message);
    }
  };

  // Hàm xóa liên hệ
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa liên hệ này? Hành động này không thể hoàn tác.')) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/admin/contact-messages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Xóa thất bại');
      
      alert('Đã xóa phản hồi liên hệ');
      fetchMessages();
    } catch (error) {
      alert(error.message);
    }
  };

  // Tính toán thống kê
  const totalMessages = messages.length;
  const pendingMessages = messages.filter(m => m.status === 'NEW').length;
  const processedMessages = totalMessages - pendingMessages;

  // Logic lọc danh sách theo trạng thái
  const filteredMessages = useMemo(() => {
    if (filterStatus === 'ALL') return messages;
    return messages.filter(msg => {
      const isMsgPending = msg.status === 'NEW';
      // Nếu filter là NEW thì lấy tin chưa xử lý, ngược lại lấy tin đã xử lý
      return filterStatus === 'NEW' ? isMsgPending : !isMsgPending;
    });
  }, [messages, filterStatus]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý Phản hồi Liên hệ</h1>
        <p className="mt-2 text-gray-600">Theo dõi, phản hồi và quản lý các yêu cầu từ trang Liên hệ của khách hàng</p>
      </div>

      {/* Thống kê (Stats) */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-600">Tổng Phản Hồi</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? '...' : totalMessages}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-600">Chưa Xử Lý</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{loading ? '...' : pendingMessages}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-600">Đã Phản Hồi</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{loading ? '...' : processedMessages}</p>
        </div>
      </div>

      {/* Danh sách Liên hệ */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-slate-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-semibold text-gray-900">Danh sách yêu cầu mới nhất</h2>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none bg-white font-medium cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="NEW">Mới (Chưa xử lý)</option>
            <option value="RESOLVED">Đã xử lý</option>
          </select>
        </div>
        
        <div className="divide-y divide-gray-100">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Đang tải dữ liệu...</p>
          ) : filteredMessages.length === 0 ? (
            <p className="p-6 text-center text-gray-500">
              {filterStatus === 'ALL' 
                ? 'Chưa có phản hồi liên hệ nào.' 
                : `Không tìm thấy phản hồi nào ở trạng thái "${filterStatus === 'NEW' ? 'Mới' : 'Đã xử lý'}".`}
            </p>
          ) : (
            filteredMessages.map((msg) => {
              // Nút tích sẽ hiện nếu status là NEW
              const isPending = msg.status === 'NEW';
              
              // Xử lý đường dẫn ảnh đính kèm (Logic tương tự AdminCategoriesPage)
              const imagePath = msg.imageUrl || msg.image || msg.imagePath;
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
              let fullImageUrl = null;
              if (imagePath && typeof imagePath === 'string' && imagePath !== 'null') {
                if (imagePath.startsWith('http')) {
                  fullImageUrl = imagePath;
                } else {
                  let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
                  if (!cleanPath.startsWith('uploads/')) cleanPath = `uploads/${cleanPath}`;
                  fullImageUrl = `${API_URL}/${cleanPath}`;
                }
              }
              
              return (
                <div key={msg.id} className="p-6 transition hover:bg-slate-50 flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-bold text-gray-900 text-lg">{msg.fullName || msg.name}</h4>
                      <span className="text-sm font-medium text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full">
                        {getTopicName(msg.topic)}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">mail</span> {msg.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">call</span> {msg.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span> 
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString('vi-VN') : 'Không rõ thời gian'}
                      </span>
                    </div>

                    <div className="mt-4 bg-white border border-gray-100 rounded-xl p-4 text-gray-700 text-sm leading-relaxed shadow-sm">
                      <p className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-2">Nội dung tin nhắn</p>
                      {msg.message}
                    </div>

                    {/* HIỂN THỊ ẢNH ĐÍNH KÈM NẾU CÓ */}
                    {fullImageUrl && (
                      <div className="mt-4">
                        <p className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-2">Hình ảnh đính kèm</p>
                        <a href={fullImageUrl} target="_blank" rel="noreferrer" className="inline-block group relative">
                          <img 
                            src={fullImageUrl} 
                            alt="Attachment" 
                            className="max-h-64 rounded-xl border border-gray-200 object-contain shadow-sm transition hover:brightness-90 bg-white" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/10 rounded-xl">
                            <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                          </div>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 md:items-end justify-start min-w-[140px]">
                    <span
                      className={[
                        'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap border',
                        isPending
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      ].join(' ')}
                    >
                      {isPending ? 'Mới' : 'Đã xử lý'}
                    </span>
                    
                    <div className="flex gap-2 mt-2">
                      {isPending && (
                        <button 
                          onClick={() => handleMarkAsProcessed(msg.id)}
                          className="flex items-center justify-center h-9 w-9 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 transition" 
                          title="Đánh dấu đã xử lý"
                        >
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(msg.id)}
                        className="flex items-center justify-center h-9 w-9 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition" 
                        title="Xóa liên hệ"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminContactsPage;