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

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[28px] border border-border bg-slate-950 p-8 text-white shadow-sm">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Kết nối nhanh với đội ngũ tư vấn Synex chuyên nghiệp
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">
            Chúng tôi hỗ trợ tư vấn sản phẩm, báo giá doanh nghiệp, bảo hành, kỹ thuật
            và các giải pháp phù hợp cho cả cá nhân lẫn tổ chức.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
          </div>
        </article>

        <article className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
          <p className="inline-flex rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
            Đội ngũ phản hồi trong vòng 30 phút làm việc
          </p>
          <ul className="mt-5 space-y-3 text-slate-700">
            <li>Tư vấn mua sản phẩm và phụ kiện setup</li>
            <li>Hỗ trợ đơn hàng doanh nghiệp và dự án</li>
            <li>Tiếp nhận bảo hành và hỗ trợ kỹ thuật</li>
          </ul>
        </article>
      </section>

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
          className="rounded-[28px] border border-border bg-white p-8 shadow-sm"
          onSubmit={handleSubmit}
        >
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
            className="mt-5 rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Gửi yêu cầu
          </button>

          {submitted && (
            <p className="mt-3 text-sm text-slate-600">Đã ghi nhận thông tin. Cảm ơn bạn!</p>
          )}
        </form>
      </section>

      <FaqSection variant="contact" />
    </div>
  )
}

export default ContactPage