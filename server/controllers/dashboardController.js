import Activity from '../models/Activity.js'
import Settings from '../models/Settings.js'
import { getCurrentWeekRange } from '../services/weekService.js'

const CATEGORY_KEYS = ['transport', 'electricity', 'food']
const CAR_KG_PER_KM = 0.2
const TREE_KG_PER_YEAR = 21
const SMARTPHONE_CHARGE_KG = 0.008

function createEmptyBreakdown() {
  return { transport: 0, electricity: 0, food: 0 }
}

function sumCategories(activities) {
  return activities.reduce((breakdown, activity) => {
    breakdown[activity.category] += activity.co2
    return breakdown
  }, createEmptyBreakdown())
}

async function getSharedSettings() {
  let settings = await Settings.findOne()

  if (!settings) {
    settings = await Settings.create({ weeklyTarget: 25 })
  }

  return settings
}

function getPercentUsed(weeklyCO2, weeklyTarget) {
  if (weeklyTarget === 0) {
    return weeklyCO2 > 0 ? 100 : 0
  }

  return (weeklyCO2 / weeklyTarget) * 100
}

function getTopCategory(categoryBreakdown) {
  const topCategory = CATEGORY_KEYS.reduce((currentTop, category) => (
    categoryBreakdown[category] > categoryBreakdown[currentTop] ? category : currentTop
  ), CATEGORY_KEYS[0])

  return categoryBreakdown[topCategory] > 0 ? topCategory : null
}

function getCategoryTip(topCategory) {
  const tips = {
    transport: 'For a lower-carbon trip, consider combining errands or choosing public transit, walking, or cycling when practical.',
    electricity: 'If it fits your routine, try shifting one high-use appliance run or switching off standby power this week.',
    food: 'A plant-based meal swap is one small option to lower food-related emissions this week.',
  }

  return tips[topCategory] || 'You’re building awareness—choose one small lower-carbon action that feels practical this week.'
}

function roundEstimate(value) {
  return Math.round(value * 10) / 10
}

async function getWeeklyData() {
  const { start, end } = getCurrentWeekRange()
  const activities = await Activity.find({
    createdAt: { $gte: start, $lte: end },
  })
  const weeklyCO2 = activities.reduce((sum, activity) => sum + activity.co2, 0)

  return {
    start,
    weeklyCO2,
    categoryBreakdown: sumCategories(activities),
  }
}

export async function getDashboard(_request, response, next) {
  try {
    const [allTimeTotals, settings, weeklyData] = await Promise.all([
      Activity.aggregate([
        { $group: { _id: null, totalCO2: { $sum: '$co2' } } },
      ]),
      getSharedSettings(),
      getWeeklyData(),
    ])

    const totalCO2 = allTimeTotals[0]?.totalCO2 || 0
    const weeklyTarget = settings.weeklyTarget
    const exceeded = weeklyData.weeklyCO2 > weeklyTarget

    return response.status(200).json({
      totalCO2,
      weeklyCO2: weeklyData.weeklyCO2,
      weeklyTarget,
      remaining: Math.max(weeklyTarget - weeklyData.weeklyCO2, 0),
      percentUsed: getPercentUsed(weeklyData.weeklyCO2, weeklyTarget),
      categoryBreakdown: weeklyData.categoryBreakdown,
      exceeded,
    })
  } catch (error) {
    return next(error)
  }
}

export async function getDashboardInsights(_request, response, next) {
  try {
    const { start, weeklyCO2, categoryBreakdown } = await getWeeklyData()
    const elapsedMilliseconds = Date.now() - start.getTime()
    const elapsedDays = Math.min(7, Math.max(1, Math.floor(elapsedMilliseconds / 86_400_000) + 1))
    const topCategory = getTopCategory(categoryBreakdown)

    return response.status(200).json({
      equivalence: [
        {
          label: 'Tree-days to offset',
          value: roundEstimate((weeklyCO2 * 365) / TREE_KG_PER_YEAR),
          unit: 'tree-days',
          estimate: 'Estimated using about 21 kg CO₂ absorbed per tree per year.',
        },
        {
          label: 'Car kilometres not driven',
          value: roundEstimate(weeklyCO2 / CAR_KG_PER_KM),
          unit: 'km',
          estimate: 'Estimated using PlanetPulse’s 0.20 kg CO₂ per car kilometre factor.',
        },
        {
          label: 'Smartphone charges',
          value: roundEstimate(weeklyCO2 / SMARTPHONE_CHARGE_KG),
          unit: 'charges',
          estimate: 'Estimated using about 0.008 kg CO₂ per smartphone charge.',
        },
      ],
      forecastKg: roundEstimate((weeklyCO2 / elapsedDays) * 7),
      topCategory,
      tip: getCategoryTip(topCategory),
    })
  } catch (error) {
    return next(error)
  }
}
