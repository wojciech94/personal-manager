const express = require('express')
const router = express.Router()
const calendarController = require('../controllers/calendarController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/dashboards/:dashboardId/events', calendarController.addEvent)
router.get('/dashboards/:dashboardId/events', calendarController.getEvents)
router.delete('/dashboards/:dashboardId/events/:eventId', calendarController.deleteEvent)

module.exports = router
