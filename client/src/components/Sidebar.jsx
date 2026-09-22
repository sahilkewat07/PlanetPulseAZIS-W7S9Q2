import { NavLink } from 'react-router-dom'

const navigationItems = [
  { to: '/', label: 'Dashboard', icon: '◌', end: true },
  { to: '/log', label: 'Log activity', icon: '+', end: false },
  { to: '/history', label: 'History', icon: '↗', end: false },
  { to: '/settings', label: 'Settings', icon: '⚙', end: false },
]

function Sidebar() {
  return (
    <aside className="flex w-full flex-col border-b border-pp-border bg-white/85 px-4 py-4 backdrop-blur lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
      <div className="flex items-center justify-between lg:justify-start lg:px-2">
        <NavLink to="/" className="flex items-center gap-3" aria-label="PlanetPulse dashboard">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-pp-primary text-xl text-white" aria-hidden="true">🌱</span>
          <span>
            <span className="block font-display text-lg font-bold tracking-tight text-pp-ink">PlanetPulse</span>
            <span className="block text-xs font-medium text-pp-primary">Small choices. Clear impact.</span>
          </span>
        </NavLink>
        <span className="border border-pp-border px-3 py-1 text-xs font-semibold text-pp-primary lg:hidden">Shared demo</span>
      </div>

      <nav className="mt-5 grid grid-cols-4 gap-1 lg:mt-12 lg:flex lg:flex-col" aria-label="Main navigation">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `flex items-center justify-center border-b-2 px-2 py-2.5 text-xs font-semibold whitespace-nowrap transition lg:justify-start lg:gap-3 lg:border-b-0 lg:border-l-2 lg:px-3.5 lg:py-3 lg:text-sm ${
              isActive
                ? 'border-pp-accent text-pp-primary'
                : 'border-transparent text-pp-ink opacity-60 hover:border-pp-border hover:text-pp-primary hover:opacity-100'
            }`}
          >
            <span className="hidden h-5 w-5 place-items-center text-base leading-none lg:grid" aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto hidden border-l-2 border-pp-accent pl-4 lg:block">
        <p className="font-display text-base font-bold text-pp-ink">A shared climate journal</p>
        <p className="mt-1 text-xs leading-5 text-pp-ink opacity-70">No account needed. Log a choice, notice the pattern, keep moving forward.</p>
      </div>
    </aside>
  )
}

export default Sidebar
