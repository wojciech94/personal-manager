const express = require('express')
const router = express.Router()
const notificationsController = require('../controllers/notificationsController')

const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/notifications', notificationsController.addNotification)
router.post('/notifications/accept', notificationsController.acceptNotification)
router.get('/notifications', notificationsController.getNotifications)
router.patch('/notifications', notificationsController.updateNotification)
router.delete('/notifications', notificationsController.deleteNotification)

module.exports = router
