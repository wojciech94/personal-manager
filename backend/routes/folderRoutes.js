const express = require('express')
const router = express.Router()
const folderController = require('../controllers/folderController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/dashboards/:dashboardId/add-folder', folderController.addFolder)

router.get('/dashboards/:dashboardId/folders', folderController.getFolders)

router.patch('/folders/:folderId', folderController.updateFolder)

router.delete('/dashboards/:dashboardId/folders/:folderId', folderController.deleteFolder)

module.exports = router
