const express = require('express')
const router = express.Router()
const shoppingItemController = require('../controllers/shoppingItemController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/shoppingLists/:shoppingListId/shopping-items', shoppingItemController.addItem)
router.get('/shoppingLists/:shoppingListId/shopping-items', shoppingItemController.getItems)
router.patch('/shopping-items/:id', shoppingItemController.updateItem)
router.delete('/shoppingLists/:shoppingListId/shopping-items/:id', shoppingItemController.deleteItem)

module.exports = router
