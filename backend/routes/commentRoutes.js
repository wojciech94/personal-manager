const express = require('express')
const router = express.Router()
const commentController = require('../controllers/commentController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/dashboards/:dashboardId/posts/:postId/comments', commentController.addComment)
router.delete('/dashboards/:dashboardId/posts/:postId/comments', commentController.deleteComment)
router.patch('/dashboards/:dashboardId/comments', commentController.updateComment)

module.exports = router
