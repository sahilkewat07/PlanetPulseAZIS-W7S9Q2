function formatKg(value) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value || 0)
}

function NudgeBanner({ weeklyCO2, weeklyTarget, tip }) {
  const overage = Math.max(weeklyCO2 - weeklyTarget, 0)

  return (
    <section className="border-l-4 border-pp-warning bg-white p-5 sm:p-6" role="status" aria-live="polite">
      <div className="flex gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-pp-warning">{formatKg(overage)} kg CO₂ over this week’s target</h2>
          <p className="mt-2 text-sm leading-6 text-pp-ink">{formatKg(weeklyCO2)} kg logged against a {formatKg(weeklyTarget)} kg target. Every new activity can still help you notice what matters most.</p>
          {tip && <p className="mt-3 border-t border-pp-border pt-3 text-sm font-semibold leading-6 text-pp-primary">A practical next step: {tip}</p>}
        </div>
      </div>
    </section>
  )
}

export default NudgeBanner
