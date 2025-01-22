const express = require('express')
const router = express.Router()
const logsController = require('../controllers/logsController')

const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/:dashboardId/logs', logsController.getLogs)

module.exports = router
