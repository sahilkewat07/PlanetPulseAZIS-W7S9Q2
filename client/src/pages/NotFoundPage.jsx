import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <span className="text-5xl" aria-hidden="true">🪴</span>
        <h1 className="mt-5 font-display text-4xl font-bold text-pp-ink">This path has grown away.</h1>
        <p className="mt-2 text-pp-ink opacity-70">Let’s get you back to your PlanetPulse dashboard.</p>
        <Link className="mt-6 inline-flex bg-pp-primary px-5 py-3 text-sm font-bold text-white transition hover:opacity-90" to="/">Go to dashboard</Link>
      </div>
    </div>
  )
}

export default NotFoundPage
