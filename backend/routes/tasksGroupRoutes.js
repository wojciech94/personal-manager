const express = require('express')
const router = express.Router()
const tasksGroupController = require('../controllers/tasksGroupController')

const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/dashboards/:dashboardId/add-todo-group', tasksGroupController.addTasksGroup)
router.get('/dashboards/:dashboardId/tasks-groups', tasksGroupController.getTasksGroup)
router.patch('/dashboards/:dashboardId/tasks-groups', tasksGroupController.updateTasksGroup)
router.delete('/dashboards/:dashboardId/tasks-groups', tasksGroupController.deleteTasksGroup)

module.exports = router
