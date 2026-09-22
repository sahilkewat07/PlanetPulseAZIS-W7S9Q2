import { useMemo, useState } from 'react'
import { useActivityData } from '../context/ActivityDataContext'
import { createActivity } from '../services/api'
import { getFriendlyApiError } from '../utils/apiError'

const ACTIVITY_OPTIONS = [
  { value: 'car', label: 'Car', unit: 'km', factor: 0.2, icon: '🚗' },
  { value: 'bus', label: 'Bus', unit: 'km', factor: 0.08, icon: '🚌' },
  { value: 'flight', label: 'Flight', unit: 'km', factor: 0.25, icon: '✈️' },
  { value: 'electricity', label: 'Electricity', unit: 'kWh', factor: 0.8, icon: '⚡' },
  { value: 'veg_meal', label: 'Veg meal', unit: 'meals', factor: 0.5, icon: '🥗' },
  { value: 'non_veg_meal', label: 'Non-veg meal', unit: 'meals', factor: 2, icon: '🍲' },
]

function formatKg(value) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value)
}

function LogActivityPage() {
  const [type, setType] = useState('car')
  const [quantityInput, setQuantityInput] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [pendingConfirmation, setPendingConfirmation] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { refreshActivityData } = useActivityData()

  const selectedActivity = useMemo(
    () => ACTIVITY_OPTIONS.find((activity) => activity.value === type),
    [type],
  )
  const parsedQuantity = quantityInput.trim() === '' ? null : Number(quantityInput)
  const previewCO2 = Number.isFinite(parsedQuantity) && parsedQuantity > 0
    ? parsedQuantity * selectedActivity.factor
    : null

  function validateForm() {
    if (!selectedActivity) return 'Select an activity type.'
    if (quantityInput.trim() === '') return 'Enter the quantity for this activity.'
    if (!Number.isFinite(parsedQuantity)) return 'Quantity must be a number.'
    if (parsedQuantity <= 0) return 'Quantity must be greater than zero.'
    return ''
  }

  async function submitActivity(payload) {
    setIsSubmitting(true)
    setFormError('')

    try {
      const { data } = await createActivity(payload)

      if (data.requiresConfirmation) {
        setPendingConfirmation(payload)
        return
      }

      setQuantityInput('')
      setType('car')
      setSuccessMessage(`Activity saved — ${formatKg(data.co2)} kg CO₂ added to the shared journal.`)
      refreshActivityData()
    } catch (error) {
      setFormError(getFriendlyApiError(error, 'We could not save this activity. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationMessage = validateForm()

    if (validationMessage) {
      setSuccessMessage('')
      setFormError(validationMessage)
      return
    }

    setSuccessMessage('')
    submitActivity({ type, quantity: parsedQuantity })
  }

  function handleConfirm() {
    if (!pendingConfirmation) return

    const confirmedPayload = { ...pendingConfirmation, confirmUnusual: true }
    setPendingConfirmation(null)
    submitActivity(confirmedPayload)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-4xl font-bold tracking-tight text-pp-ink sm:text-5xl">Log an activity</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-pp-ink opacity-70">Add one everyday choice at a time. PlanetPulse confirms the final estimate on the server before it reaches your shared journal.</p>

      <form className="mt-8 border border-pp-border bg-white p-6 sm:p-8" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-pp-ink" htmlFor="activityType">Activity type</label>
            <div className="relative mt-3">
              <select
                id="activityType"
                className="w-full appearance-none border border-pp-border bg-white px-4 py-3 pr-10 text-base font-semibold text-pp-ink outline-none transition focus:border-pp-primary focus:ring-2 focus:ring-pp-accent"
                value={type}
                onChange={(event) => {
                  setType(event.target.value)
                  setFormError('')
                  setSuccessMessage('')
                }}
              >
                {ACTIVITY_OPTIONS.map((activity) => (
                  <option key={activity.value} value={activity.value}>{activity.icon} {activity.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-pp-primary" aria-hidden="true">⌄</span>
            </div>
            <p className="mt-3 text-sm text-pp-ink opacity-70">Unit: <span className="font-bold text-pp-primary">{selectedActivity.unit}</span></p>
          </div>

          <div>
            <label className="block text-sm font-bold text-pp-ink" htmlFor="activityQuantity">Quantity</label>
            <div className="mt-3 flex overflow-hidden border border-pp-border bg-white focus-within:border-pp-primary focus-within:ring-2 focus-within:ring-pp-accent">
              <input
                id="activityQuantity"
                className="min-w-0 flex-1 border-0 px-4 py-3 text-base font-semibold text-pp-ink outline-none"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                placeholder="0"
                value={quantityInput}
                onChange={(event) => {
                  setQuantityInput(event.target.value)
                  setFormError('')
                  setSuccessMessage('')
                }}
                aria-describedby="quantity-help"
              />
              <span className="grid place-items-center border-l border-pp-border bg-pp-bg px-4 text-sm font-bold text-pp-primary">{selectedActivity.unit}</span>
            </div>
            <p id="quantity-help" className="mt-3 text-sm text-pp-ink opacity-70">Use the actual quantity; PlanetPulse will never auto-convert or change it.</p>
          </div>
        </div>

        <section className="mt-7 border-l-4 border-pp-accent bg-pp-bg p-5" aria-live="polite">
          <p className="text-sm font-bold text-pp-primary">Estimated footprint</p>
          {previewCO2 === null ? (
            <p className="mt-2 text-base font-medium text-pp-ink opacity-70">Enter a valid quantity to see a preview.</p>
          ) : (
            <p className="mt-2 font-display text-4xl font-bold tracking-tight text-pp-primary">{formatKg(previewCO2)} <span className="font-sans text-lg">kg CO₂</span></p>
          )}
          <p className="mt-2 text-sm leading-6 text-pp-ink opacity-70">Preview only — the backend calculates and saves the final value using the prescribed factor.</p>
        </section>

        {formError && <p className="mt-5 border border-pp-warning bg-white px-4 py-3 text-sm font-medium text-pp-warning" role="alert">{formError}</p>}
        {successMessage && <p className="mt-5 border border-pp-primary bg-pp-bg px-4 py-3 text-sm font-medium text-pp-primary" role="status">{successMessage}</p>}

        <button
          className="mt-6 inline-flex items-center justify-center bg-pp-primary px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pp-accent disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving activity…' : 'Add activity'}
        </button>
      </form>

      {pendingConfirmation && (
        <div className="pp-overlay fixed inset-0 z-50 grid place-items-center p-5" role="presentation">
          <section className="w-full max-w-md border border-pp-border bg-white p-6 shadow-2xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="unusual-value-title" aria-describedby="unusual-value-description">
            <span className="grid h-12 w-12 place-items-center border border-pp-warning text-2xl" aria-hidden="true">⚠️</span>
            <h2 id="unusual-value-title" className="mt-5 font-display text-2xl font-bold text-pp-ink">Unusual value</h2>
            <p id="unusual-value-description" className="mt-2 text-base leading-7 text-pp-ink opacity-70">This seems unusually high. Please verify your input.</p>
            <p className="mt-3 border-l-2 border-pp-warning bg-pp-bg px-4 py-3 text-sm font-semibold text-pp-ink">{pendingConfirmation.quantity} {ACTIVITY_OPTIONS.find((activity) => activity.value === pendingConfirmation.type)?.unit}</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button className="px-4 py-3 text-sm font-bold text-pp-ink transition hover:bg-pp-bg" type="button" onClick={() => setPendingConfirmation(null)} disabled={isSubmitting}>Cancel</button>
              <button className="bg-pp-warning px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pp-accent disabled:cursor-not-allowed disabled:opacity-70" type="button" onClick={handleConfirm} disabled={isSubmitting}>{isSubmitting ? 'Logging…' : 'Confirm & Log'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default LogActivityPage
