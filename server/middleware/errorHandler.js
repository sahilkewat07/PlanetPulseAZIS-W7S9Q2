export function notFoundHandler(request, _response, next) {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`)
  error.statusCode = 404
  next(error)
}

export function errorHandler(error, _request, response, _next) {
  let statusCode = error.statusCode || error.status || 500
  let message = statusCode >= 500 ? 'Something went wrong on our side. Please try again.' : (error.message || 'Something went wrong. Please try again.')

  if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400
    message = 'Request data must be valid JSON.'
  }

  if (error.name === 'CastError') {
    statusCode = 400
    message = 'One or more values have an invalid format.'
  }

  if (error.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(' ')
  }

  if (error.name === 'MongoServerError' && error.code === 11000) {
    statusCode = 409
    message = 'A record with those values already exists.'
  }

  response.status(statusCode).json({ error: message })
}
