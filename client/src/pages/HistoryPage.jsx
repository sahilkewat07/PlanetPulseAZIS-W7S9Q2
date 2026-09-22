import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import { useActivityData } from '../context/ActivityDataContext'
import { getActivities } from '../services/api'
import { getFriendlyApiError } from '../utils/apiError'

const ACTIVITY_LABELS = {
  car: 'Car',
  bus: 'Bus',
  flight: 'Flight',
  electricity: 'Electricity',
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
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value || 0)
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function toStartOfDayIso(dateInput) {
  if (!dateInput) return undefined

  return new Date(`${dateInput}T00:00:00`).toISOString()
}

function toEndOfDayIso(dateInput) {
  if (!dateInput) return undefined

  return new Date(`${dateInput}T23:59:59.999`).toISOString()
}

function HistoryPage() {
  const [category, setCategory] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [retryVersion, setRetryVersion] = useState(0)
  const { dataVersion } = useActivityData()

  const filters = useMemo(() => ({
    ...(category ? { category } : {}),
    ...(fromDate ? { from: toStartOfDayIso(fromDate) } : {}),
    ...(toDate ? { to: toEndOfDayIso(toDate) } : {}),
  }), [category, fromDate, toDate])

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)
    setLoadError('')

    getActivities(filters)
      .then(({ data }) => {
        if (isCurrent) setActivities(data)
      })
      .catch((error) => {
        if (isCurrent) {
          setActivities([])
          setLoadError(getFriendlyApiError(error, 'We could not load the activity history just now. Please try again in a moment.'))
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [filters, dataVersion, retryVersion])

  function clearFilters() {
    setCategory('')
    setFromDate('')
    setToDate('')
  }

  function retryLoad() {
    setRetryVersion((version) => version + 1)
  }

  const hasFilters = category || fromDate || toDate

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-4xl font-bold tracking-tight text-pp-ink sm:text-5xl">Activity history</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-pp-ink opacity-70">Every activity stays in the shared journal, making it easier to notice patterns over time.</p>

      <div className="mt-8">
        <FilterBar
          category={category}
          fromDate={fromDate}
          toDate={toDate}
          onCategoryChange={setCategory}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onClear={clearFilters}
        />
      </div>

      <section className="mt-5 overflow-hidden border border-pp-border bg-white">
        <div className="flex flex-col gap-2 border-b border-pp-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-pp-ink">Logged activities</h2>
            <p className="mt-1 text-sm text-pp-ink opacity-70">Newest entries appear first.</p>
          </div>
          {!isLoading && !loadError && <span className="border border-pp-border px-3 py-1.5 text-xs font-bold text-pp-primary">{activities.length} {activities.length === 1 ? 'activity' : 'activities'}</span>}
        </div>

        {isLoading ? (
          <div className="grid min-h-72 place-items-center p-8" role="status">
            <div className="text-center">
              <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-pp-border border-t-pp-primary" aria-hidden="true" />
              <p className="mt-4 text-sm font-medium text-pp-ink opacity-70">Loading your activity journal…</p>
            </div>
          </div>
        ) : loadError ? (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center border border-pp-warning text-2xl" aria-hidden="true">🌦️</span>
              <h3 className="mt-4 font-display text-2xl font-bold text-pp-ink">We couldn’t load your history</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-pp-ink opacity-70">{loadError}</p>
              <button className="mt-5 bg-pp-primary px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90" type="button" onClick={retryLoad}>Try again</button>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center border border-pp-border bg-pp-bg text-2xl" aria-hidden="true">🍃</span>
              <h3 className="mt-4 font-display text-2xl font-bold text-pp-ink">{hasFilters ? 'No activities match these filters' : 'Your activity journal is ready'}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-pp-ink opacity-70">{hasFilters ? 'Try a different category or date range to see more of the shared journal.' : 'Log your first activity to begin building a clearer picture of everyday impact.'}</p>
              {hasFilters ? (
                <button className="mt-5 bg-pp-primary px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90" type="button" onClick={clearFilters}>Clear filters</button>
              ) : (
                <Link className="mt-5 inline-flex bg-pp-primary px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90" to="/log">Log an activity</Link>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[44rem] w-full border-collapse text-left">
              <thead className="bg-pp-bg text-xs font-semibold text-pp-ink">
                <tr>
                  <th className="px-6 py-4 font-bold">Activity</th>
                  <th className="px-6 py-4 font-bold">Quantity</th>
                  <th className="px-6 py-4 font-bold">Unit</th>
                  <th className="px-6 py-4 font-bold">CO₂</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pp-border">
                {activities.map((activity) => (
                  <tr key={activity._id} className="transition hover:bg-pp-bg">
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center border border-pp-border bg-pp-bg text-base" aria-hidden="true">{ACTIVITY_ICONS[activity.type]}</span>
                        <span className="font-bold text-pp-ink">{ACTIVITY_LABELS[activity.type]}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-pp-ink">{activity.quantity}</td>
                    <td className="px-6 py-4 text-sm text-pp-ink opacity-70">{activity.unit}</td>
                    <td className="px-6 py-4 font-display text-base font-bold text-pp-primary">{formatKg(activity.co2)} kg</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-pp-ink opacity-70">{formatDate(activity.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default HistoryPage
