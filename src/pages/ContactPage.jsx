import { useState } from 'react'
import FaqSection from '../components/FaqSection'
import { usePageTitle } from '../hooks/usePageTitle'

function ContactPage() {
  usePageTitle('Liên hệ - Synex')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    topic: '',
    message: '',
  })
  
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false) // Thêm state xử lý loading khi đang gửi API

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // FIX: Chuyển thành async function và gọi API POST lên Backend
  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)

    try {
      // Sử dụng biến môi trường hoặc fallback về localhost
      const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080'
      
      // Gọi API POST gửi thông tin (Backend thường mở Public cho endpoint này, không cần token)
      const response = await fetch(`${API_URL}/api/contact-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      })

      if (!response.ok) {
        throw new Error('Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau!')
      }

      setSubmitted(true)
      // Reset form cho sạch sẽ sau khi gửi thành công
      setForm({ fullName: '', email: '', phone: '', topic: '', message: '' })
      
      // Ẩn thông báo thành công sau 5 giây (Tùy chọn)
      setTimeout(() => setSubmitted(false), 5000)

    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      
      {/* BANNER TRÀN VIỀN: Kỹ thuật tràn màn hình */}
      <section className="relative flex min-h-[400px] w-screen flex-col justify-center overflow-hidden bg-slate-950 p-8 shadow-sm md:p-16 lg:p-24 left-[50%] right-[50%] -ml-[50vw] -mr-[50vw]">
        {/* Ảnh nền */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />

        {/* Nội dung banner: Căn giữa theo container 7xl */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl leading-tight">
              Kết nối nhanh với đội ngũ tư vấn Synex chuyên nghiệp
            </h1>
            <p className="mt-5 text-base text-slate-300 sm:text-lg leading-relaxed">
              Chúng tôi hỗ trợ tư vấn sản phẩm, báo giá doanh nghiệp, bảo hành, kỹ thuật và các giải pháp phù hợp cho cả cá nhân lẫn tổ chức. Phản hồi nhanh chóng trong vòng 30 phút làm việc.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-3">
              <a 
                href="#contact-form" 
                className="rounded-full border border-sky-500 bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 hover:border-sky-400"
              >
                Gửi yêu cầu ngay
              </a>
              <a 
                href="tel:19006868" 
                className="flex items-center gap-2 rounded-full border border-slate-400/60 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
                1900 6868
              </a>
              <a 
                href="mailto:support@synex.vn" 
                className="flex items-center gap-2 rounded-full border border-slate-400/60 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[18px]">mail</span>
                support@synex.vn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* KHU VỰC THÔNG TIN VÀ FORM LIÊN HỆ */}
      <div className="mx-auto max-w-7xl px-4">
        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-ink">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <h3 className="font-heading text-xl font-bold text-ink">Hotline bán hàng</h3>
                <strong className="mt-2 block text-lg text-slate-900">1900 6868</strong>
                <p className="mt-1 text-slate-700">
                  Tư vấn sản phẩm, báo giá, chương trình ưu đãi
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <h3 className="font-heading text-xl font-bold text-ink">
                  Email chăm sóc khách hàng
                </h3>
                <strong className="mt-2 block text-lg text-slate-900">support@synex.vn</strong>
                <p className="mt-1 text-slate-700">
                  Hỗ trợ bảo hành, vận chuyển và tình trạng đơn hàng
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <h3 className="font-heading text-xl font-bold text-ink">Thời gian làm việc</h3>
                <strong className="mt-2 block text-lg text-slate-900">08:30 - 18:00</strong>
                <p className="mt-1 text-slate-700">Từ thứ Hai đến thứ Bảy</p>
              </div>
            </div>
          </article>

          <form
            id="contact-form"
            className="rounded-[28px] border border-border bg-white p-8 shadow-sm scroll-mt-24 relative"
            onSubmit={handleSubmit}
          >
            {/* Lớp phủ mờ khi đang tải dữ liệu */}
            {loading && (
              <div className="absolute inset-0 z-10 rounded-[28px] bg-white/50 backdrop-blur-sm flex items-center justify-center">
                 <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
              </div>
            )}

            <h2 className="text-3xl font-bold text-ink">Gửi yêu cầu cho Synex</h2>
            <p className="mt-2 text-slate-700">
              Điền thông tin để đội ngũ của chúng tôi liên hệ lại sớm nhất.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block space-y-2" htmlFor="fullName">
                <span className="text-sm font-medium text-ink">Họ và tên</span>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  required
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block space-y-2" htmlFor="phone">
                <span className="text-sm font-medium text-ink">Số điện thoại</span>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block space-y-2" htmlFor="email">
                <span className="text-sm font-medium text-ink">Email</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block space-y-2" htmlFor="topic">
                <span className="text-sm font-medium text-ink">Chủ đề</span>
                <select
                  id="topic"
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="">Chọn chủ đề</option>
                  <option value="bao-gia">Báo giá doanh nghiệp</option>
                  <option value="bao-hanh">Bảo hành - kỹ thuật</option>
                  <option value="don-hang">Đơn hàng - vận chuyển</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block space-y-2" htmlFor="message">
              <span className="text-sm font-medium text-ink">Nội dung</span>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 rounded-full bg-slate-900 px-7 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-400 flex items-center gap-2"
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>

            {submitted && (
              <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex gap-3 text-emerald-700">
                <span className="material-symbols-outlined">check_circle</span>
                <p className="text-sm font-medium">Đã gửi thành công! Đội ngũ Synex sẽ liên hệ lại với bạn sớm nhất.</p>
              </div>
            )}
          </form>
        </section>

        {/* THÊM KHOẢNG CÁCH CHO FAQ SECTION */}
        <div className="mt-12">
          <FaqSection variant="contact" />
        </div>
      </div>
    </div>
  )
}

export default ContactPage