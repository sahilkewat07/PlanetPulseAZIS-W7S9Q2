import { Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { ActivityDataProvider } from './context/ActivityDataContext'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'
import LogActivityPage from './pages/LogActivityPage'
import NotFoundPage from './pages/NotFoundPage'
import SettingsPage from './pages/SettingsPage'

const pageTitles = {
  '/': 'Dashboard',
  '/log': 'Log activity',
  '/history': 'History',
  '/settings': 'Settings',
}

function App() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'PlanetPulse'

  return (
    <ActivityDataProvider>
      <div className="min-h-screen bg-pp-bg font-sans text-pp-ink lg:flex">
        <Sidebar />
        <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-10 lg:py-7">
          <p className="text-sm font-semibold text-pp-ink opacity-70">{title}</p>
          <span className="hidden border border-pp-border bg-white px-3 py-1.5 text-xs font-semibold text-pp-primary sm:inline-flex">Shared demo for everyone</span>
        </header>
        <div className="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 lg:px-10 lg:pb-12">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/log" element={<LogActivityPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        </main>
      </div>
    </ActivityDataProvider>
  )
}

export default App
