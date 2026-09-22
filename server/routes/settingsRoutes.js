import { Router } from 'express'
import { getSettings, updateSettings } from '../controllers/settingsController.js'

const router = Router()

router.route('/').get(getSettings).put(updateSettings)

export default router
