const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/dashboards/:dashboardId/products', productController.addProduct)
router.post('/dashboards/:dashboardId/import-products', productController.importDefaultProducts)
router.get('/dashboards/:dashboardId/products', productController.getProducts)
router.patch('/dashboards/:dashboardId/products/:productId', productController.updateProducts)
router.delete('/dashboards/:dashboardId/products/:id', productController.deleteProduct)

module.exports = router
