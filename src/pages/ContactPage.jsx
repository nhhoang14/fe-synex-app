import { useState } from 'react'
import FaqSection from '../components/FaqSection'

function ContactPage() {
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
    <div className="page-stack">
      <section className="contact-hero-shell">
        <article className="contact-hero-card contact-hero-main">
          <h1>Ket noi nhanh voi doi ngu tư vấn Synex chuyen nghiep</h1>
          <p>
            Chung toi hỗ trợ tư vấn san pham, bao gia doanh nghiep, bao hanh, ky thuat
            va cac giai phap phu hop cho ca ca nhan lan to chuc.
          </p>
          <div className="hero-actions">
            <button type="button">Liên hệ ngay</button>
            <button type="button" className="outline-btn">
              Xem cau hoi thuong gap
            </button>
          </div>
        </article>

        <article className="contact-hero-card contact-hero-side">
          <p className="contact-status-dot">Doi ngu phan hoi trong vong 30 phut lam viec</p>
          <ul className="service-list">
            <li>Tu van mua san pham va phu kien setup</li>
            <li>Ho tro don hang doanh nghiep va du an</li>
            <li>Tiep nhan bao hanh va hỗ trợ ky thuat</li>
          </ul>
        </article>
      </section>

      <section className="contact-content-grid">
        <article className="contact-info-panel">
          <h2>Chung toi luon san sang lang nghe va hỗ trợ</h2>

          <div className="contact-info-card">
            <h3>Hotline ban hang</h3>
            <strong>1900 6868</strong>
            <p>Tu van san pham, bao gia, chuong trinh ưu đãi</p>
          </div>

          <div className="contact-info-card">
            <h3>Email cham soc khach hang</h3>
            <strong>support@synex.vn</strong>
            <p>Ho tro bao hanh, van chuyen va tinh trang don hang</p>
          </div>

          <div className="contact-info-card">
            <h3>Thoi gian lam viec</h3>
            <strong>08:30 - 18:00</strong>
            <p>Tu thu Hai den thu Bay</p>
          </div>
        </article>

        <form className="contact-form-card" onSubmit={handleSubmit}>
          <h2>Gui yeu cau cho Synex</h2>
          <p>
            Dien thong tin de doi ngu cua chung toi lien he lai som nhat.
          </p>

          <div className="form-row-2">
            <label className="form-field" htmlFor="fullName">
              <span>Ho va ten</span>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nhap ho va ten"
                required
              />
            </label>

            <label className="form-field" htmlFor="phone">
              <span>So dien thoai</span>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Nhap so dien thoai"
              />
            </label>
          </div>

          <div className="form-row-2">
            <label className="form-field" htmlFor="email">
              <span>Email</span>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
              />
            </label>

            <label className="form-field" htmlFor="topic">
              <span>Chu de</span>
              <select id="topic" name="topic" value={form.topic} onChange={handleChange}>
                <option value="">Chon chu de</option>
                <option value="bao-gia">Bao gia doanh nghiep</option>
                <option value="bao-hanh">Bao hanh - ky thuat</option>
                <option value="don-hang">Don hang - van chuyen</option>
              </select>
            </label>
          </div>

          <label className="form-field" htmlFor="message">
            <span>Noi dung</span>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Gui yeu cau</button>
          {submitted && <p className="hint">Da ghi nhan thong tin. Cam on ban!</p>}
        </form>
      </section>

      <FaqSection variant="contact" />
    </div>
  )
}

export default ContactPage
