export function getFriendlyApiError(error, fallbackMessage) {
  const responseMessage = error?.response?.data?.error

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage
  }

  return fallbackMessage
}
