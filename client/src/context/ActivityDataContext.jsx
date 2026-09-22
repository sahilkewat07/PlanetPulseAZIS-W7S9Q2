import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ActivityDataContext = createContext(null)

export function ActivityDataProvider({ children }) {
  const [dataVersion, setDataVersion] = useState(0)

  const refreshActivityData = useCallback(() => {
    setDataVersion((version) => version + 1)
  }, [])

  const value = useMemo(() => ({
    dataVersion,
    refreshActivityData,
    refreshSettingsData: refreshActivityData,
  }), [dataVersion, refreshActivityData])

  return <ActivityDataContext.Provider value={value}>{children}</ActivityDataContext.Provider>
}

export function useActivityData() {
  const context = useContext(ActivityDataContext)

  if (!context) {
    throw new Error('useActivityData must be used inside ActivityDataProvider')
  }

  return context
}
