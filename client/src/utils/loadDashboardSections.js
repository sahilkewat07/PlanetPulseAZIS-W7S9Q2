// Publish each response immediately; optional sections never gate the summary.
// The cleanup prevents responses from an older render overwriting newer data.
export function loadDashboardSections(requests, onResult) {
  let active = true
  const publish = (name, result) => {
    if (active) onResult(name, result)
  }

  for (const [name, request] of Object.entries(requests)) {
    publish(name, { status: 'loading' })
    Promise.resolve()
      .then(request)
      .then(
        (response) => publish(name, { status: 'success', data: response.data }),
        (error) => publish(name, { status: 'error', error }),
      )
  }

  return () => { active = false }
}
