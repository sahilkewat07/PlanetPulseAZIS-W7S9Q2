export function getCurrentWeekRange() {
  const now = new Date()
  const start = new Date(now)
  const daysSinceMonday = (now.getDay() + 6) % 7

  start.setDate(start.getDate() - daysSinceMonday)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}
