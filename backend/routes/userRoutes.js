const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/dashboards/:dashboardId/add-user', userController.addUser)
router.get('/userId', userController.getUserId)
router.patch('/dashboards/:dashboardId/remove', userController.removeUser)

module.exports = router
