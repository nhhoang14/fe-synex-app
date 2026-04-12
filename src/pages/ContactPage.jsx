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
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Ket noi nhanh voi doi ngu tư vấn Synex chuyen nghiep</h1>
          <p className="mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">
            Chung toi hỗ trợ tư vấn san pham, bao gia doanh nghiep, bao hanh, ky thuat
            va cac giai phap phu hop cho ca ca nhan lan to chuc.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200">
              Liên hệ ngay
            </button>
            <button type="button" className="rounded-full border border-white/30 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
              Xem cau hoi thuong gap
            </button>
          </div>
        </article>

        <article className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
          <p className="inline-flex rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
            Doi ngu phan hoi trong vong 30 phut lam viec
          </p>
          <ul className="mt-5 space-y-3 text-slate-700">
            <li>Tu van mua san pham va phu kien setup</li>
            <li>Ho tro don hang doanh nghiep va du an</li>
            <li>Tiep nhan bao hanh va hỗ trợ ky thuat</li>
          </ul>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-ink">Chung toi luon san sang lang nghe va hỗ trợ</h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <h3 className="font-heading text-xl font-bold text-ink">Hotline ban hang</h3>
              <strong className="mt-2 block text-lg text-slate-900">1900 6868</strong>
              <p className="mt-1 text-slate-700">Tu van san pham, bao gia, chuong trinh ưu đãi</p>
            </div>

            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <h3 className="font-heading text-xl font-bold text-ink">Email cham soc khach hang</h3>
              <strong className="mt-2 block text-lg text-slate-900">support@synex.vn</strong>
              <p className="mt-1 text-slate-700">Ho tro bao hanh, van chuyen va tinh trang don hang</p>
            </div>

            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <h3 className="font-heading text-xl font-bold text-ink">Thoi gian lam viec</h3>
              <strong className="mt-2 block text-lg text-slate-900">08:30 - 18:00</strong>
              <p className="mt-1 text-slate-700">Tu thu Hai den thu Bay</p>
            </div>
          </div>
        </article>

        <form className="rounded-[28px] border border-border bg-white p-8 shadow-sm" onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold text-ink">Gui yeu cau cho Synex</h2>
          <p className="mt-2 text-slate-700">
            Dien thong tin de doi ngu cua chung toi lien he lai som nhat.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block space-y-2" htmlFor="fullName">
              <span className="text-sm font-medium text-ink">Ho va ten</span>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nhap ho va ten"
                required
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label className="block space-y-2" htmlFor="phone">
              <span className="text-sm font-medium text-ink">So dien thoai</span>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Nhap so dien thoai"
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
              <span className="text-sm font-medium text-ink">Chu de</span>
              <select
                id="topic"
                name="topic"
                value={form.topic}
                onChange={handleChange}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              >
                <option value="">Chon chu de</option>
                <option value="bao-gia">Bao gia doanh nghiep</option>
                <option value="bao-hanh">Bao hanh - ky thuat</option>
                <option value="don-hang">Don hang - van chuyen</option>
              </select>
            </label>
          </div>

          <label className="mt-4 block space-y-2" htmlFor="message">
            <span className="text-sm font-medium text-ink">Noi dung</span>
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
          <button type="submit" className="mt-5 rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
            Gui yeu cau
          </button>
          {submitted && <p className="mt-3 text-sm text-slate-600">Da ghi nhan thong tin. Cam on ban!</p>}
        </form>
      </section>

      <FaqSection variant="contact" />
    </div>
  )
}

export default ContactPage
