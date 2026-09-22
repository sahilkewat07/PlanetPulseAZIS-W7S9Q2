import { ACTIVITY_CONFIG } from './emissionService.js'

const UNUSUAL_QUANTITY_LIMITS = Object.freeze({
  car: 1000,
  bus: 1000,
  flight: 15000,
  electricity: 200,
  veg_meal: 10,
  non_veg_meal: 10,
})

export function validateActivityInput(type, quantity) {
  if (!ACTIVITY_CONFIG[type]) {
    return {
      valid: false,
      unusual: false,
      message: 'Select a supported activity type.',
    }
  }

  if (typeof quantity !== 'number' || !Number.isFinite(quantity)) {
    return {
      valid: false,
      unusual: false,
      message: 'Quantity must be a number.',
    }
  }

  if (quantity <= 0) {
    return {
      valid: false,
      unusual: false,
      message: 'Quantity must be greater than zero.',
    }
  }

  const unusualLimit = UNUSUAL_QUANTITY_LIMITS[type]
  if (quantity > unusualLimit) {
    return {
      valid: true,
      unusual: true,
      message: `This ${type.replace('_', ' ')} quantity is unusually high. Please confirm or correct it before logging.`,
    }
  }

  return {
    valid: true,
    unusual: false,
    message: '',
  }
}
