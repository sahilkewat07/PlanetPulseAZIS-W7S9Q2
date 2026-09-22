// Isolated, in-memory browser test fixture. Never connects to MongoDB.
// Run npm run test:dashboard, then open http://127.0.0.1:5174/.
// Scenarios: ?scenario=zero-insights-error, history-error, core-error, empty.
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

process.env.VITE_API_URL = '/__dashboard_fixture'
const server = await createServer({
  root: fileURLToPath(new URL('..', import.meta.url)),
  server: { host: '127.0.0.1', port: 5174, strictPort: true, open: false },
})
server.middlewares.use((request, response, next) => {
  if (!request.url.startsWith('/__dashboard_fixture/')) return next()
  const scenario = new URL(request.headers.referer || 'http://localhost').searchParams.get('scenario')
  const path = request.url.replace('/__dashboard_fixture', '')
  const empty = scenario === 'empty'
  const zero = scenario === 'zero-insights-error' || empty
  const weeklyCO2 = empty ? 0 : 12
  const weeklyTarget = zero ? 0 : 25
  let data
  let status = 200
  if (request.method !== 'GET') {
    status = 405
    data = { error: 'This fixture is read-only.' }
  } else if (path === '/api/dashboard') {
    data = { totalCO2: empty ? 0 : 123.4, weeklyCO2, weeklyTarget,
      remaining: Math.max(weeklyTarget - weeklyCO2, 0),
      percentUsed: zero ? (weeklyCO2 > 0 ? 100 : 0) : 48,
      exceeded: weeklyCO2 > weeklyTarget,
      categoryBreakdown: { transport: weeklyCO2, electricity: 0, food: 0 } }
    if (scenario === 'core-error') status = 503
  } else if (path === '/api/dashboard/insights') {
    data = { equivalence: [], forecastKg: empty ? 0 : 28, tip: 'Consider combining errands when practical.' }
    if (scenario === 'zero-insights-error') status = 503
  } else if (path === '/api/activities') {
    data = []
    if (scenario === 'history-error') status = 503
  } else {
    status = 404
  }
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(status === 200 ? data : { error: 'Simulated test failure' }))
})
await server.listen()
console.log('Dashboard test fixture (synthetic data only): http://127.0.0.1:5174/')
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
