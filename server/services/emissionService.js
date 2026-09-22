export const ACTIVITY_CONFIG = Object.freeze({
  car: { category: 'transport', unit: 'km', emissionFactor: 0.2 },
  bus: { category: 'transport', unit: 'km', emissionFactor: 0.08 },
  flight: { category: 'transport', unit: 'km', emissionFactor: 0.25 },
  electricity: { category: 'electricity', unit: 'kWh', emissionFactor: 0.8 },
  veg_meal: { category: 'food', unit: 'meals', emissionFactor: 0.5 },
  non_veg_meal: { category: 'food', unit: 'meals', emissionFactor: 2 },
})

export function calculateCO2(type, quantity) {
  const activity = ACTIVITY_CONFIG[type]

  if (!activity) {
    throw new Error(`Unsupported activity type: ${type}`)
  }

  if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Quantity must be a positive finite number')
  }

  return {
    category: activity.category,
    unit: activity.unit,
    emissionFactor: activity.emissionFactor,
    co2: quantity * activity.emissionFactor,
  }
}
