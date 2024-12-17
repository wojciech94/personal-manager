const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboardController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

//### Dashboards
router.post('/', dashboardController.addDashboard)
router.get('/', dashboardController.getDashboards)
router.get('/:dashboardId', dashboardController.getDashboardDetails)
router.patch('/:dashboardId', dashboardController.updateDashboard)
router.delete('/:dashboardId', dashboardController.deleteDashboard)

//### Tasks settings
router.get('/:dashboardId/tasks-settings', dashboardController.getTasksSettings)
router.patch('/:dashboardId/tasks-settings', dashboardController.updateTasksSettings)

module.exports = router
