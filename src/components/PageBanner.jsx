function PageBanner({ title, subtitle }) {
  return (
    <section className="rounded-[28px] border border-border bg-gradient-to-b from-slate-50 to-slate-100 px-6 py-10 text-center shadow-sm sm:px-10">
      <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{title}</h1>
      {subtitle && <p className="mx-auto mt-3 max-w-2xl text-base text-muted sm:text-lg">{subtitle}</p>}
    </section>
  )
}

export default PageBanner
