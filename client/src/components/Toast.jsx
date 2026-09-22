function Toast({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-[fade-in_180ms_ease-out] border border-pp-primary bg-white p-4 shadow-xl shadow-black/10" role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center bg-pp-primary text-base text-white" aria-hidden="true">✓</span>
        <p className="flex-1 pt-1 text-sm font-semibold leading-5 text-pp-ink">{message}</p>
        <button className="px-1.5 py-1 text-sm font-bold text-pp-primary transition hover:bg-pp-bg focus:outline-none focus:ring-2 focus:ring-pp-accent" type="button" onClick={onDismiss} aria-label="Dismiss notification">×</button>
      </div>
    </div>
  )
}

export default Toast
