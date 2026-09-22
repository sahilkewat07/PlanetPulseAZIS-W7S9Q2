import { Router } from 'express'
import { getDashboard, getDashboardInsights } from '../controllers/dashboardController.js'

const router = Router()

router.get('/', getDashboard)
router.get('/insights', getDashboardInsights)

export default router
