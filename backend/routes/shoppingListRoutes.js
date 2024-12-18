const express = require('express')
const router = express.Router()
const shoppingListController = require('../controllers/shoppingListController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/dashboards/:dashboardId/shopping-lists', shoppingListController.addList)
router.get('/dashboards/:dashboardId/shopping-lists', shoppingListController.getLists)
router.get('/shopping-lists/:id', shoppingListController.getList)
router.patch('/shopping-lists/:id', shoppingListController.updateList)
router.delete('/dashboards/:dashboardId/delete/:id', shoppingListController.deleteList)

module.exports = router
