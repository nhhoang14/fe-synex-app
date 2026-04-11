import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="section-block center-page">
      <h1>404</h1>
      <p>Không tim thay trang ban can.</p>
      <Link to="/" className="primary-link">
        Ve trang chu
      </Link>
    </section>
  )
}

export default NotFoundPage
