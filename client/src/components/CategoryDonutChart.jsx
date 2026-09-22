import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const CATEGORY_META = {
  transport: { label: 'Transport', color: '#2F5233' },
  electricity: { label: 'Electricity', color: '#C98A3B' },
  food: { label: 'Food', color: '#B54834' },
}

function formatKg(value) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value || 0)
}

function CategoryTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const item = payload[0].payload
  return (
    <div className="border border-pp-border bg-white px-3 py-2 shadow-lg shadow-black/10">
      <p className="text-xs font-bold text-pp-ink">{item.label}</p>
      <p className="mt-1 font-display text-base font-semibold text-pp-ink">{formatKg(item.value)} kg CO₂</p>
    </div>
  )
}

function CategoryDonutChart({ breakdown }) {
  const data = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    key,
    label: meta.label,
    color: meta.color,
    value: breakdown?.[key] || 0,
  }))
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="border border-pp-border bg-white p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-pp-ink">Where your footprint comes from</h2>
        </div>
        <span className="border border-pp-border px-3 py-1.5 text-xs font-bold text-pp-primary">{formatKg(total)} kg total</span>
      </div>

      <div className="mt-5 grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,0.8fr)]">
        <div className="h-64 min-w-0">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius="57%" outerRadius="78%" paddingAngle={4} stroke="none">
                  {data.map((item) => <Cell key={item.key} fill={item.color} />)}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center rounded-full border-[18px] border-pp-border text-center">
              <p className="max-w-32 text-sm font-medium leading-6 text-pp-ink opacity-70">Your category mix will appear here.</p>
            </div>
          )}
        </div>

        <ul className="space-y-3" aria-label="Category breakdown">
          {data.map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm font-medium text-pp-ink"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>
              <span className="font-display text-base font-bold text-pp-ink">{formatKg(item.value)} kg</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default CategoryDonutChart
