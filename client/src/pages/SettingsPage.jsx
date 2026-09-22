import { useEffect, useState } from 'react'
import Toast from '../components/Toast'
import { useActivityData } from '../context/ActivityDataContext'
import { getSettings, updateSettings } from '../services/api'
import { getFriendlyApiError } from '../utils/apiError'

function SettingsPage() {
  const [weeklyTarget, setWeeklyTarget] = useState('25')
  const [errorMessage, setErrorMessage] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [loadVersion, setLoadVersion] = useState(0)
  const { refreshSettingsData } = useActivityData()

  useEffect(() => {
    let isCurrent = true

    getSettings()
      .then(({ data }) => {
        if (isCurrent) {
          setWeeklyTarget(String(data.weeklyTarget))
          setErrorMessage('')
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setErrorMessage(getFriendlyApiError(error, 'We could not load the weekly target. Please try again.'))
        }
      })

    return () => {
      isCurrent = false
    }
  }, [loadVersion])

  useEffect(() => {
    if (!toastMessage) return undefined

    const timeoutId = window.setTimeout(() => setToastMessage(''), 4_000)
    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  async function handleSubmit(event) {
    event.preventDefault()
    const target = Number(weeklyTarget)

    if (!Number.isFinite(target) || target < 0) {
      setErrorMessage('Enter a weekly target of zero or more kilograms.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setToastMessage('')

    try {
      const { data } = await updateSettings(target)
      setWeeklyTarget(String(data.weeklyTarget))
      setToastMessage('Weekly target updated for the shared demo.')
      refreshSettingsData()
    } catch (error) {
      setErrorMessage(getFriendlyApiError(error, 'We could not update the weekly target. Please try again.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-4xl font-bold tracking-tight text-pp-ink sm:text-5xl">Set the weekly target</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-pp-ink opacity-70">This is a shared demo setting. Use a target that makes the week’s progress meaningful and encouraging.</p>

      <form className="mt-8 border border-pp-border bg-white p-6 sm:p-8" onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center border border-pp-border bg-pp-bg text-lg" aria-hidden="true">🎯</span>
          <div>
            <label className="block text-sm font-bold text-pp-ink" htmlFor="weeklyTarget">Weekly CO₂ target</label>
            <p className="mt-1 text-sm leading-6 text-pp-ink opacity-70">Choose the amount you want the current Monday–Sunday week to aim for.</p>
          </div>
        </div>
        <div className="mt-3 flex max-w-md overflow-hidden border border-pp-border bg-white focus-within:border-pp-primary focus-within:ring-2 focus-within:ring-pp-accent">
          <input
            id="weeklyTarget"
            className="min-w-0 flex-1 border-0 px-4 py-3 font-display text-2xl font-bold text-pp-ink outline-none"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={weeklyTarget}
            onChange={(event) => {
              setWeeklyTarget(event.target.value)
              setErrorMessage('')
            }}
            aria-describedby="target-help"
          />
          <span className="grid place-items-center border-l border-pp-border bg-pp-bg px-4 text-sm font-bold text-pp-primary">kg CO₂</span>
        </div>
        <p id="target-help" className="mt-3 text-sm leading-6 text-pp-ink opacity-70">The dashboard compares activities logged from Monday through Sunday with this target.</p>

        {errorMessage && (
          <div className="mt-5 border border-pp-warning bg-white px-4 py-3 text-sm font-medium text-pp-warning" role="alert">
            <p>{errorMessage}</p>
            {!isSaving && <button className="mt-2 text-sm font-bold underline underline-offset-2" type="button" onClick={() => setLoadVersion((version) => version + 1)}>Try again</button>}
          </div>
        )}

        <button
          className="mt-6 bg-pp-primary px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pp-accent disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? 'Saving target…' : 'Save weekly target'}
        </button>
      </form>
      <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
    </div>
  )
}

export default SettingsPage
