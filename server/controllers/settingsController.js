import Settings from '../models/Settings.js'

function createHttpError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export async function getSettings(_request, response, next) {
  try {
    let settings = await Settings.findOne()

    if (!settings) {
      settings = await Settings.create({ weeklyTarget: 25 })
    }

    return response.status(200).json(settings)
  } catch (error) {
    return next(error)
  }
}

export async function updateSettings(request, response, next) {
  try {
    const { weeklyTarget } = request.body || {}

    if (typeof weeklyTarget !== 'number' || !Number.isFinite(weeklyTarget) || weeklyTarget < 0) {
      throw createHttpError(400, 'Weekly target must be a non-negative number.')
    }

    let settings = await Settings.findOne()

    if (!settings) {
      settings = new Settings({ weeklyTarget })
    } else {
      settings.weeklyTarget = weeklyTarget
      settings.updatedAt = new Date()
    }

    await settings.save()
    return response.status(200).json(settings)
  } catch (error) {
    return next(error)
  }
}
