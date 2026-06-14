import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

function AdminOrdersPage() {
  usePageTitle('Quản lý đơn hàng - Synex')

  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Các State mới cho tính năng Modal & Cập nhật
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [orderDetail, setOrderDetail] = useState(null)
  const [isLoadingOrder, setIsLoadingOrder] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  // State quản lý bộ lọc
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL')

  useEffect(() => {
    let active = true

    async function fetchAdminOrders() {
      setLoading(true)
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
        // Gọi API Admin Orders để lấy TOÀN BỘ đơn hàng của hệ thống
        const response = await fetch(`${API_URL}/api/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch orders')
        const data = await response.json()
        if (active) setOrders(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(error)
        if (active) setOrders([])
      } finally {
        if (active) setLoading(false)
      }
    }

    if (token) fetchAdminOrders()

    return () => { active = false }
  }, [token])

  // EFFECT MỚI: Tải chi tiết đơn hàng khi bấm nút xem chi tiết (đọc theo chuẩn AccountPage)
  useEffect(() => {
    if (!selectedOrderId) {
      setOrderDetail(null)
      return
    }
    
    let active = true
    setIsLoadingOrder(true)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    
    // Gọi API admin để lấy full chi tiết (Bao gồm orderItems và địa chỉ)
    fetch(`${API_URL}/api/admin/orders/${selectedOrderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (active) {
        setOrderDetail(data)
        setIsLoadingOrder(false)
      }
    })
    .catch(err => {
      console.error("Lỗi lấy chi tiết đơn hàng:", err)
      if (active) setIsLoadingOrder(false)
    })

    return () => { active = false }
  }, [selectedOrderId, token])

  // Logic lọc danh sách đơn hàng theo trạng thái và phương thức thanh toán
  const filteredOrdersList = useMemo(() => {
    return orders.filter(order => {
      const status = String(order.status || order.orderStatus || 'PENDING').toUpperCase()
      const matchStatus = filterStatus === 'ALL' || status === filterStatus
      const matchPayment = filterPaymentMethod === 'ALL' || order.paymentMethod === filterPaymentMethod
      return matchStatus && matchPayment
    })
  }, [orders, filterStatus, filterPaymentMethod])

  // Hiển thị tối đa 50 đơn hàng thỏa mãn điều kiện lọc
  const latestOrders = useMemo(() => filteredOrdersList.slice(0, 50), [filteredOrdersList])

  // Lấy dữ liệu gộp giữa order đang chọn và order list để render Modal
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null
    return orders.find(o => o.id === selectedOrderId || o.orderCode === selectedOrderId)
  }, [selectedOrderId, orders])

  const displayOrder = orderDetail || selectedOrder

  function formatOrderMoney(value) {
    const amount = Number(value || 0)
    return amount.toLocaleString('vi-VN') + ' đ'
  }

  function getOrderTotal(order) {
    return order.totalAmount || order.totalPrice || order.amount || order.total || 0
  }

  // HÀM MỚI: Đổi trạng thái qua Dropdown
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Cập nhật trạng thái thất bại');

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus, orderStatus: newStatus } : order
        )
      )

      if (orderDetail && orderDetail.id === orderId) {
        setOrderDetail(prev => ({ ...prev, status: newStatus, orderStatus: newStatus }))
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* KHỐI 1: HEADER NGUYÊN BẢN */}
      <section className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          ADMIN / ORDERS
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
          Quản lý đơn hàng
        </h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          Khu vực quản lý và cập nhật trạng thái đơn hàng của tất cả khách hàng trên hệ thống.
        </p>
      </section>

      {/* KHỐI 2: THỐNG KÊ (Đã sửa grid-cols-2 và xóa khối Quay lại Dashboard theo y/c 1) */}
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tổng số đơn hàng</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : orders.length}
          </strong>
        </article>

        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Đơn thỏa điều kiện</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : filteredOrdersList.length}
          </strong>
        </article>
      </section>

      {/* KHỐI 3: DANH SÁCH ĐƠN HÀNG DẠNG NGANG (Thêm Dropdown + Nút Xem Chi Tiết) */}
      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-ink">Danh sách đơn hàng toàn hệ thống</h2>
          
          <div className="flex flex-wrap gap-3">
            {/* Bộ lọc Phương thức thanh toán */}
            <select 
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="rounded-xl border border-border bg-slate-50 px-4 py-2 text-sm font-semibold text-ink outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 cursor-pointer"
            >
              <option value="ALL">Tất cả thanh toán</option>
              <option value="COD">COD</option>
              <option value="CARD">CARD</option>
            </select>

            {/* Bộ lọc Trạng thái */}
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-border bg-slate-50 px-4 py-2 text-sm font-semibold text-ink outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">PENDING</option>
              <option value="SHIPPING">SHIPPING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
             <p className="text-slate-600">Đang tải dữ liệu đơn hàng...</p>
          ) : latestOrders.length === 0 ? (
            <p className="text-slate-600">Hệ thống chưa có đơn hàng nào.</p>
          ) : (
            latestOrders.map((order, index) => {
              const orderId = order.orderCode || order.id || index + 1
              const status = String(order.status || order.orderStatus || 'PENDING').toUpperCase()
              const isCard = order.paymentMethod === 'CARD'
              // Không cho phép thay đổi nếu trạng thái là CANCELLED hoặc nếu là CARD mà chưa SHIPPING
              const canChange = status !== 'CANCELLED' && (!isCard || status === 'SHIPPING')
              const total = getOrderTotal(order)

              return (
                <article
                  key={order.id || `admin-order-${index}`}
                  className="rounded-2xl border border-border bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    
                    {/* Phần text hiển thị ngang giữ nguyên */}
                    <div>
                      <strong className="text-ink text-base block">Đơn hàng #{orderId} - {order.receiverName || order.fullName || 'Khách hàng'}</strong>
                      <p className="mt-1 text-sm text-slate-700">
                        Tổng tiền: <strong className="text-ink">{formatOrderMoney(total)}</strong>
                      </p>
                    </div>

                    {/* Phần bổ sung Nút và Dropdown hiển thị ngang */}
                    <div className="flex items-center gap-3">
                      <select
                        disabled={updatingId === order.id || !canChange}
                        value={status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className={`rounded-full px-3 py-1.5 text-sm font-semibold border outline-none cursor-pointer disabled:opacity-50 ${
                          status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-200' :
                          status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200' :
                          status === 'SHIPPING' ? 'bg-sky-100 text-sky-800 border-sky-200' :
                          'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="PENDING" disabled={isCard}>PENDING</option>
                        <option value="SHIPPING">SHIPPING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(order.id || order.orderCode)}
                        className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-800 transition shadow-sm whitespace-nowrap"
                      >
                        Chi tiết →
                      </button>
                    </div>

                  </div>
                </article>
              )
            })
          )}
        </div>
      </section>

      {/* KHỐI 4: MODAL HIỂN THỊ CHI TIẾT (Bê chuẩn 100% từ AccountPage sang) */}
      {displayOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-border bg-white shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                  Chi tiết đơn hàng #{displayOrder.orderCode || displayOrder.id}
                  {isLoadingOrder && <span className="text-sm font-normal text-sky-600 animate-pulse">(Đang tải chi tiết...)</span>}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ngày đặt: {new Date(displayOrder.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white border border-border font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border p-4 bg-slate-50">
                  <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-2">Trạng thái đơn hàng</span>
                  <div className="mt-1.5">
                    {String(displayOrder.status).toUpperCase() === 'COMPLETED' ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-200">
                        COMPLETED
                      </span>
                    ) : String(displayOrder.status).toUpperCase() === 'CANCELLED' ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
                        CANCELLED
                      </span>
                    ) : String(displayOrder.status).toUpperCase() === 'SHIPPING' ? (
                      <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 border border-sky-200">
                        SHIPPING
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                        {displayOrder.status || 'PENDING'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-4 bg-slate-50">
                  <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-2">Phương thức thanh toán</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-slate-600 text-[20px]">
                      {displayOrder.paymentMethod === 'CARD' ? 'credit_card' : 'payments'}
                    </span>
                    <span className="text-sm font-medium text-ink">
                      {displayOrder.paymentMethod === 'CARD' ? 'Thẻ tín dụng / Thẻ ghi nợ' : displayOrder.paymentMethod || 'Thanh toán khi nhận hàng (COD)'}
                    </span>
                  </div>
                </div>

                {(() => {
                  // Logic móc địa chỉ đúng như AccountPage.jsx
                  let recName = 'Chưa cập nhật tên';
                  let recPhone = 'Chưa cập nhật SĐT';
                  let recAddress = 'Chưa cập nhật địa chỉ';

                  if (displayOrder.shippingAddress && typeof displayOrder.shippingAddress === 'object') {
                    const sa = displayOrder.shippingAddress;
                    recName = sa.fullName || sa.full_name || sa.name || recName;
                    recPhone = sa.phone || sa.phoneNumber || recPhone;
                    const parts = [sa.street || sa.addressLine, sa.ward, sa.province || sa.city].filter(Boolean);
                    if (parts.length > 0) {
                      recAddress = parts.join(', ');
                    } else if (sa.address) {
                      recAddress = sa.address;
                    }
                  } 
                  else if (displayOrder.shippingFullName || displayOrder.fullName || displayOrder.receiverName) {
                    recName = displayOrder.shippingFullName || displayOrder.fullName || displayOrder.receiverName || recName;
                    recPhone = displayOrder.shippingPhone || displayOrder.phone || displayOrder.phoneNumber || recPhone;
                    
                    const parts = [
                      displayOrder.shippingStreet || displayOrder.street, 
                      displayOrder.shippingWard || displayOrder.ward, 
                      displayOrder.shippingProvince || displayOrder.province || displayOrder.city
                    ].filter(Boolean);
                    
                    if (parts.length > 0) {
                      recAddress = parts.join(', ');
                    } else if (displayOrder.address || displayOrder.shippingAddressStr) {
                      recAddress = displayOrder.address || displayOrder.shippingAddressStr;
                    }
                  }

                  return (
                    <div className="rounded-2xl border border-border bg-slate-50 p-4 sm:col-span-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                        Thông tin giao hàng
                      </span>
                      <div className="space-y-2 text-sm text-ink">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">person</span>
                          <span className="font-medium">{recName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">call</span>
                          <span className="text-slate-600">{recPhone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-[18px] mt-0.5">location_on</span>
                          <span className="text-slate-600 leading-relaxed">{recAddress}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-3">
                  Danh sách phụ kiện
                </span>
                <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
                  {(() => {
                    const orderItemsList = displayOrder.items || displayOrder.orderItems || [];
                    
                    return orderItemsList.length > 0 ? (
                      orderItemsList.map((item, idx) => {
                        const productName = item.productName || item.product?.name || item.name || 'Sản phẩm phụ kiện';
                        const productPrice = item.price || item.product?.price || 0;
                        const productImage = item.product?.image || item.product?.imageUrl || item.image;

                        return (
                          <div key={item.id || idx} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50">
                            <div className="flex items-center gap-3">
                              {productImage ? (
                                <img 
                                  src={productImage} 
                                  alt={productName} 
                                  className="h-12 w-12 rounded-xl object-cover border border-border" 
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-xl bg-slate-100 border border-border flex items-center justify-center text-slate-400">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-ink text-sm max-w-[350px] truncate">
                                  {productName}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Số lượng: {item.quantity || 1} × {productPrice.toLocaleString('vi-VN')} đ
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold text-ink text-sm whitespace-nowrap">
                              {(productPrice * (item.quantity || 1)).toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="p-4 text-sm text-slate-500 text-center">
                        Không tìm thấy thông tin sản phẩm.
                      </p>
                    )
                  })()}
                </div>
              </div>

              {/* TÓM TẮT THANH TOÁN CHI TIẾT */}
              <div className="rounded-2xl border border-border bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Tạm tính:</span>
                  <span className="font-bold text-ink">{formatOrderMoney(displayOrder.subTotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Phí vận chuyển:</span>
                  <span className="font-bold text-ink">{formatOrderMoney(displayOrder.shippingFee || 0)}</span>
                </div>
                {(displayOrder.discountAmount > 0 || displayOrder.voucherCode) && (
                  <div className="flex justify-between text-sm text-sky-700">
                    <span className="font-medium">Giảm giá {displayOrder.voucherCode ? `(Mã: ${displayOrder.voucherCode})` : ''}:</span>
                    <span className="font-bold">- {formatOrderMoney(displayOrder.discountAmount || 0)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-base font-bold text-ink uppercase">Tổng cộng:</span>
                  <strong className="text-xl font-bold text-red-600">
                    {formatOrderMoney(displayOrder.totalAmount || 0)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-slate-50 px-6 py-4 flex items-center justify-between">
              <div className="text-left">
                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Tổng thanh toán</span>
                <strong className="text-xl font-bold text-ink">
                  {(displayOrder.totalAmount ?? displayOrder.totalPrice ?? displayOrder.total ?? 0).toLocaleString('vi-VN')} đ
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="rounded-full bg-slate-900 px-6 py-2.5 font-semibold text-white transition hover:bg-slate-800 shadow-sm text-sm"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminOrdersPage