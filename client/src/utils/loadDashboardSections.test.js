import assert from 'node:assert/strict'
import { setImmediate } from 'node:timers/promises'
import test from 'node:test'
import { loadDashboardSections } from './loadDashboardSections.js'

const success = (data) => () => Promise.resolve({ data })
const failure = () => Promise.reject(new Error('Unavailable'))
const pending = () => new Promise(() => {})

test('summary is published even when insights fail and history is still pending', async () => {
  const states = {}
  const summary = { totalCO2: 123.4, weeklyCO2: 12, weeklyTarget: 0 }
  const cleanup = loadDashboardSections({
    dashboard: success(summary), insights: failure, activities: pending,
  }, (name, result) => { states[name] = result })
  await setImmediate()
  assert.deepEqual(states.dashboard, { status: 'success', data: summary })
  assert.equal(states.insights.status, 'error')
  assert.equal(states.activities.status, 'loading')
  cleanup()
})

test('a pending insights request and failed history cannot block the summary', async () => {
  const states = {}
  const cleanup = loadDashboardSections({
    dashboard: success({ weeklyTarget: 25 }), insights: pending, activities: failure,
  }, (name, result) => { states[name] = result })
  await setImmediate()
  assert.equal(states.dashboard.status, 'success')
  assert.equal(states.insights.status, 'loading')
  assert.equal(states.activities.status, 'error')
  cleanup()
})

test('a failed core request does not discard successful optional sections', async () => {
  const states = {}
  const cleanup = loadDashboardSections({
    dashboard: failure, insights: success({ forecastKg: 20 }), activities: success([]),
  }, (name, result) => { states[name] = result })
  await setImmediate()
  assert.equal(states.dashboard.status, 'error')
  assert.equal(states.insights.data.forecastKg, 20)
  assert.deepEqual(states.activities.data, [])
  cleanup()
})

test('cleanup ignores late successes and failures from an older load', async () => {
  const updates = []
  let resolveSummary
  let rejectInsights
  const summary = new Promise((resolve) => { resolveSummary = resolve })
  const insights = new Promise((_resolve, reject) => { rejectInsights = reject })
  const cleanup = loadDashboardSections({
    dashboard: () => summary, insights: () => insights,
  }, (name, result) => updates.push({ name, ...result }))
  await setImmediate()
  cleanup()
  resolveSummary({ data: { totalCO2: 999 } })
  rejectInsights(new Error('Late failure'))
  await setImmediate()
  assert.deepEqual(updates.map(({ status }) => status), ['loading', 'loading'])
})

test('retry can replace an error with fresh data', async () => {
  const states = {}
  const onResult = (name, result) => { states[name] = result }
  const cleanup = loadDashboardSections({ dashboard: failure }, onResult)
  await setImmediate()
  assert.equal(states.dashboard.status, 'error')
  cleanup()
  const stopRetry = loadDashboardSections({ dashboard: success({ weeklyTarget: 0 }) }, onResult)
  assert.equal(states.dashboard.status, 'loading')
  await setImmediate()
  assert.deepEqual(states.dashboard, { status: 'success', data: { weeklyTarget: 0 } })
  stopRetry()
})

test('synchronous request errors are isolated too', async () => {
  const states = {}
  const cleanup = loadDashboardSections({
    dashboard: success({ totalCO2: 0 }),
    insights: () => { throw new Error('Request setup failed') },
  }, (name, result) => { states[name] = result })
  await setImmediate()
  assert.equal(states.dashboard.status, 'success')
  assert.equal(states.insights.status, 'error')
  cleanup()
})
