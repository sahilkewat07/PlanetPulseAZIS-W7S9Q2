import mongoose from 'mongoose'
import Activity from '../models/Activity.js'
import { calculateCO2 } from '../services/emissionService.js'
import { validateActivityInput } from '../services/validationService.js'
import { getCurrentWeekRange } from '../services/weekService.js'

function createHttpError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function buildActivityFilter(queryParams) {
  const filter = {}
  const { category, from, to } = queryParams

  if (category) {
    if (!['transport', 'electricity', 'food'].includes(category)) {
      throw createHttpError(400, 'Category must be transport, electricity, or food.')
    }
    filter.category = category
  }

  if (from || to) {
    filter.createdAt = {}

    if (from) {
      const fromDate = new Date(from)
      if (Number.isNaN(fromDate.getTime())) {
        throw createHttpError(400, 'The from date is invalid.')
      }
      filter.createdAt.$gte = fromDate
    }

    if (to) {
      const toDate = new Date(to)
      if (Number.isNaN(toDate.getTime())) {
        throw createHttpError(400, 'The to date is invalid.')
      }
      filter.createdAt.$lte = toDate
    }

    if (filter.createdAt.$gte && filter.createdAt.$lte && filter.createdAt.$gte > filter.createdAt.$lte) {
      throw createHttpError(400, 'The from date must be before or equal to the to date.')
    }
  }

  return filter
}

export async function createActivity(request, response, next) {
  try {
    const { type, quantity, confirmUnusual = false } = request.body || {}
    const validation = validateActivityInput(type, quantity)

    if (!validation.valid) {
      throw createHttpError(400, validation.message)
    }

    if (validation.unusual && confirmUnusual !== true) {
      return response.status(200).json({
        warning: true,
        requiresConfirmation: true,
        message: validation.message,
      })
    }

    const calculation = calculateCO2(type, quantity)
    const activity = await Activity.create({
      type,
      quantity,
      ...calculation,
      flaggedUnusual: validation.unusual,
    })

    return response.status(201).json(activity)
  } catch (error) {
    return next(error)
  }
}

export async function getActivities(request, response, next) {
  try {
    const filter = buildActivityFilter(request.query)
    const activities = await Activity.find(filter).sort({ createdAt: -1 })
    return response.status(200).json(activities)
  } catch (error) {
    return next(error)
  }
}

export async function getWeeklyActivities(_request, response, next) {
  try {
    const { start, end } = getCurrentWeekRange()
    const activities = await Activity.find({
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 })
    const totalCO2 = activities.reduce((sum, activity) => sum + activity.co2, 0)

    return response.status(200).json({ activities, totalCO2 })
  } catch (error) {
    return next(error)
  }
}

export async function deleteActivity(request, response, next) {
  try {
    const { id } = request.params
    if (!mongoose.isObjectIdOrHexString(id)) {
      throw createHttpError(400, 'Activity id is invalid.')
    }

    const activity = await Activity.findByIdAndDelete(id)
    if (!activity) {
      throw createHttpError(404, 'Activity not found.')
    }

    return response.status(200).json({
      message: 'Activity deleted.',
      activity,
    })
  } catch (error) {
    return next(error)
  }
}
