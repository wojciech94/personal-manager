const express = require('express')
const router = express.Router()
const noteController = require('../controllers/noteController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/dashboards/:dashboardId/add-note', noteController.addNote)
router.post('/notes/add-category', noteController.addNoteCategory)
router.get('/dashboards/:dashboardId/folders/notes/:folderId?', noteController.getNotes)
router.get('/notes/:noteId', noteController.getNote)
router.get('/dashboards/:dashboardId/note-categories', noteController.getNoteCategories)
router.patch('/notes/:noteId', noteController.updateNote)
router.delete('/dashboards/:dashboardId/notes/remove', noteController.deleteNote)

module.exports = router
