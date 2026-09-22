import { useEffect, useMemo, useState } from 'react'
import CategoryDonutChart from '../components/CategoryDonutChart'
import EquivalenceCard from '../components/EquivalenceCard'
import NudgeBanner from '../components/NudgeBanner'
import { useActivityData } from '../context/ActivityDataContext'
import { getActivities, getDashboard, getDashboardInsights } from '../services/api'
import { getFriendlyApiError } from '../utils/apiError'
import { loadDashboardSections } from '../utils/loadDashboardSections'

const ACTIVITY_LABELS = {
  car: 'Car journey',
  bus: 'Bus journey',
  flight: 'Flight',
  electricity: 'Electricity use',
  veg_meal: 'Veg meal',
  non_veg_meal: 'Non-veg meal',
}

const ACTIVITY_ICONS = {
  car: '🚗',
  bus: '🚌',
  flight: '✈️',
  electricity: '⚡',
  veg_meal: '🥗',
  non_veg_meal: '🍲',
}

function formatKg(value) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value || 0)
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function getWeeklyHeadline(dashboard, weeklyCO2, target) {
  if (!dashboard) return 'Your shared week is taking shape.'
  if (dashboard.exceeded) return `${formatKg(weeklyCO2 - target)} kg over target this week.`
  if (weeklyCO2 === 0) return 'A fresh week to shape, one choice at a time.'
  return `You’re at ${formatKg(dashboard.percentUsed)}% of this week’s target — ${formatKg(dashboard.remaining)} kg remains.`
}

function MetricCard({ label, value, helper, featured = false }) {
  return (
    <article className={`border p-5 ${featured ? 'border-pp-primary bg-pp-primary px-6 py-7 text-white sm:px-7' : 'border-pp-border bg-white'}`}>
      <p className={`text-sm font-semibold ${featured ? 'text-white' : 'text-pp-ink'}`}>{label}</p>
      <p className={`mt-2 font-display font-bold tracking-tight ${featured ? 'text-5xl sm:text-6xl' : 'text-3xl text-pp-ink'}`}>{value}</p>
      <p className={`mt-3 text-sm leading-6 ${featured ? 'text-white/80' : 'text-pp-ink'}`}>{helper}</p>
    </article>
  )
}

function RecentActivities({ activities }) {
  return (
    <section className="border border-pp-border bg-white p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-pp-ink">Recent activities</h2>
        </div>
        <span className="border border-pp-border px-3 py-1.5 text-xs font-bold text-pp-primary">Last 5</span>
      </div>

      {activities.length > 0 ? (
        <ul className="mt-5 divide-y divide-pp-border">
          {activities.map((activity) => (
            <li key={activity._id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-pp-border bg-pp-bg text-lg" aria-hidden="true">{ACTIVITY_ICONS[activity.type]}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-pp-ink">{ACTIVITY_LABELS[activity.type]}</p>
                <p className="mt-0.5 text-xs text-pp-ink opacity-70">{activity.quantity} {activity.unit} on {formatDate(activity.createdAt)}</p>
              </div>
              <p className="font-display text-base font-bold text-pp-primary">{formatKg(activity.co2)} kg</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 border-l-2 border-pp-accent bg-pp-bg px-5 py-7 text-center">
          <p className="font-bold text-pp-ink">No activities logged yet</p>
          <p className="mt-1 text-sm leading-6 text-pp-ink opacity-70">Your recent choices will appear here as you add them.</p>
        </div>
      )}
    </section>
  )
}

function OptionalSectionStatus({ title, state, onRetry }) {
  const loading = state.status === 'loading'
  return (
    <section className="border border-pp-border bg-white p-6 sm:p-7" aria-busy={loading}>
      <h2 className="font-display text-2xl font-bold text-pp-ink">{title}</h2>
      <p className="mt-4 text-sm text-pp-ink" role="status">
        {loading ? `Loading ${title.toLowerCase()}…` : `${title} temporarily unavailable. Please try again in a moment.`}
      </p>
      {!loading && <button className="mt-4 border border-pp-border px-3 py-2 text-sm font-bold text-pp-primary" type="button" onClick={onRetry}>Try again</button>}
    </section>
  )
}

function DashboardPage() {
  const [dashboardState, setDashboardState] = useState({ status: 'loading' })
  const [insightsState, setInsightsState] = useState({ status: 'loading' })
  const [activitiesState, setActivitiesState] = useState({ status: 'loading' })
  const [retryVersion, setRetryVersion] = useState(0)
  const { dataVersion } = useActivityData()

  useEffect(() => loadDashboardSections(
    { dashboard: getDashboard, insights: getDashboardInsights, activities: getActivities },
    (name, result) => {
      const setters = { dashboard: setDashboardState, insights: setInsightsState, activities: setActivitiesState }
      setters[name](result)
    },
  ), [dataVersion, retryVersion])

  const dashboard = dashboardState.data ?? null
  const insights = insightsState.data ?? null
  const recentActivities = activitiesState.data?.slice(0, 5) ?? []
  const loadError = dashboardState.status === 'error'
    ? getFriendlyApiError(dashboardState.error, 'We could not reach the dashboard just now. Please try again in a moment.')
    : ''
  const retry = () => setRetryVersion((version) => version + 1)
  const weeklyCO2 = dashboard?.weeklyCO2 ?? 0
  const target = dashboard?.weeklyTarget ?? 25
  const percentUsed = dashboard?.percentUsed ?? 0
  const progress = Math.min(percentUsed, 100)
  const targetUsedHelper = dashboard?.exceeded ? `${formatKg(percentUsed)}% — target exceeded` : 'Of your weekly target'
  const chartBreakdown = useMemo(() => dashboard?.categoryBreakdown || {}, [dashboard])
  const weeklyHeadline = dashboard
    ? getWeeklyHeadline(dashboard, weeklyCO2, target)
    : loadError ? 'Your footprint is temporarily unavailable.' : 'Loading your footprint…'

  return (
    <div className="space-y-7">
      <section className="border border-pp-primary bg-pp-primary px-6 py-8 text-white sm:px-8 sm:py-10">
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{weeklyHeadline}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">PlanetPulse measures the current Monday–Sunday week against the shared target.</p>
        </div>
      </section>

      {loadError && (
        <div className="flex flex-col gap-3 border border-pp-warning bg-white p-4 text-sm font-medium text-pp-warning sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p>{loadError}</p>
          <button className="self-start border border-pp-warning px-3 py-2 text-xs font-bold text-pp-warning transition hover:bg-pp-bg sm:self-auto" type="button" onClick={() => setRetryVersion((version) => version + 1)}>Try again</button>
        </div>
      )}

      {dashboardState.status === 'loading' && <p className="text-sm text-pp-ink" role="status">Loading dashboard totals…</p>}

      {dashboard?.exceeded && <NudgeBanner weeklyCO2={weeklyCO2} weeklyTarget={target} tip={insights?.tip ?? 'Choose one small lower-carbon action that feels practical this week, such as combining errands or trying a plant-based meal.'} />}

      {dashboard && <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total this week" value={`${formatKg(weeklyCO2)} kg`} helper="Carbon logged since Monday" featured />
        <MetricCard label="All-time footprint" value={`${formatKg(dashboard.totalCO2)} kg`} helper="Carbon from all logged activities" />
        <MetricCard label="Weekly target" value={`${formatKg(target)} kg`} helper="A shared, adjustable goal" />
        <MetricCard label="Remaining" value={`${formatKg(dashboard?.remaining ?? target)} kg`} helper={dashboard?.exceeded ? 'You can still make every choice count.' : 'Still available this week'} />
        <MetricCard label="Target used" value={`${formatKg(percentUsed)}%`} helper={targetUsedHelper} />
      </section>

      <section className="border border-pp-border bg-white p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-3xl font-bold text-pp-ink">{dashboard ? `${formatKg(weeklyCO2)} of ${formatKg(target)} kg` : 'Loading your footprint…'}</h2>
          </div>
          <span className={`border px-3 py-1.5 text-sm font-bold ${dashboard?.exceeded ? 'border-pp-warning text-pp-warning' : 'border-pp-border text-pp-primary'}`}>{formatKg(percentUsed)}% used</span>
        </div>
        <div className="mt-6 h-2 overflow-hidden bg-pp-bg" aria-label={`${formatKg(percentUsed)} percent of weekly target used`}>
          <div className={`h-full transition-all duration-500 ${dashboard?.exceeded ? 'bg-pp-warning' : 'bg-pp-accent'}`} style={{ width: `${progress}%` }} />
        </div>
      </section>
      </>}

      <div className={`grid gap-7 ${dashboard ? 'xl:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]' : ''}`}>
        {dashboard && <CategoryDonutChart breakdown={chartBreakdown} />}
        {activitiesState.status === 'success'
          ? <RecentActivities activities={recentActivities} />
          : <OptionalSectionStatus title="Recent activities" state={activitiesState} onRetry={retry} />}
      </div>

      {insightsState.status === 'success'
        ? <EquivalenceCard insights={insights} />
        : <OptionalSectionStatus title="Insights" state={insightsState} onRetry={retry} />}
    </div>
  )
}

export default DashboardPage
