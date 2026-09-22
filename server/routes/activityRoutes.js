import { Router } from 'express'
import {
  createActivity,
  deleteActivity,
  getActivities,
  getWeeklyActivities,
} from '../controllers/activityController.js'

const router = Router()

router.route('/').post(createActivity).get(getActivities)
router.get('/weekly', getWeeklyActivities)
router.route('/:id').delete(deleteActivity)

export default router
