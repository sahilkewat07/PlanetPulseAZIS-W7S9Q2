function formatEstimate(value) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value || 0)
}

function EquivalenceCard({ insights }) {
  const equivalence = insights?.equivalence || []

  return (
    <section className="border border-pp-border bg-white p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-pp-ink">Impact in context</h2>
        </div>
        <span className="border border-pp-border px-3 py-1.5 text-xs font-bold text-pp-primary">Estimates</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {equivalence.map((item) => (
          <article key={item.label} className="border-t-2 border-pp-accent bg-pp-bg p-4">
            <p className="text-sm font-bold text-pp-ink">{item.label}</p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight text-pp-primary">{formatEstimate(item.value)} <span className="font-sans text-sm">{item.unit}</span></p>
            <p className="mt-2 text-xs leading-5 text-pp-ink opacity-70">{item.estimate}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2 border-l-2 border-pp-primary bg-pp-bg p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-pp-ink">End-of-week forecast <span className="font-medium opacity-70">at your current pace</span></p>
        <p className="font-display text-2xl font-bold text-pp-primary">{formatEstimate(insights?.forecastKg)} kg CO₂ <span className="font-sans text-xs font-semibold">estimate</span></p>
      </div>
    </section>
  )
}

export default EquivalenceCard
