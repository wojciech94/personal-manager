const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/dashboards/:dashboardId/posts', postController.addPost)
router.get('/dashboards/:dashboardId/posts', postController.getPosts)
router.delete('/dashboards/:dashboardId/posts', postController.deletePost)
router.patch('/dashboards/:dashboardId/posts', postController.updatePost)

module.exports = router
