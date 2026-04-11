function PageBanner({ title, subtitle }) {
  return (
    <section className="mvp-banner">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </section>
  )
}

export default PageBanner
