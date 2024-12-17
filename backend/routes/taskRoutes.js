const express = require('express')
const router = express.Router()
const taskController = require('../controllers/taskController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/dashboards/:dashboardId/add-task', taskController.addTask)

router.get('/dashboards/:dashboardId/tasks/:groupId?', taskController.getTasks)

router.patch('/dashboards/:dashboardId/task/:id', taskController.updateTask)

router.delete('/dashboards/:dashboardId/task/:id', taskController.deleteTask)

module.exports = router
