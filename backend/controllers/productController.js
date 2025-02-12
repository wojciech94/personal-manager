const Dashboard = require('../models/Dashboard')
const Product = require('../models/Product')
const mongoose = require('mongoose')
const { addLog } = require('./logsController')

exports.addProduct = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const userId = req.user.userId

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboardId' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found for provided id' })
		}

		const { name, category, unit, price, tags, isFavourite } = req.body

		const product = await Product.create({ name, category, unit, price, tags, isFavourite })

		if (!product) {
			return res.status(500).json({ message: 'Cannot create product.' })
		}

		dashboard.productsIds.push(product._id)

		await dashboard.save()

		const message = `New product created (${name})`
		await addLog(dashboard.logsId, userId, message)

		res.status(201).json(product)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getProducts = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { sort_by, direction } = req.query

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboardId' })
		}

		const dashboard = await Dashboard.findById(dashboardId).populate('productsIds')

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found for provided id' })
		}

		let products = dashboard.productsIds

		if (sort_by) {
			const sortDirection = direction === 'desc' ? -1 : 1
			products = products.sort((a, b) => {
				if (a[sort_by] < b[sort_by]) return -sortDirection
				if (a[sort_by] > b[sort_by]) return sortDirection
				return 0
			})
		}

		res.status(201).json(products)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.updateProducts = async (req, res) => {
	try {
		const { dashboardId, productId } = req.params
		const userId = req.user.userId

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboardId' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found for provided id' })
		}

		const { name, category, unit, price, tags, isFavourite } = req.body

		const product = await Product.findById(productId)

		if (!product) {
			return res.status(404).json({ message: 'Product not found.' })
		}

		if (name) product.name = name
		if (category) product.category = category
		if (unit) product.unit = unit
		if (price) product.price = price
		if (tags) product.tags = tags
		if (isFavourite !== 'undefined') product.isFavourite = isFavourite

		await product.save()

		const message = `Updated product (${name})`
		await addLog(dashboard.logsId, userId, message)

		res.status(200).json(product)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deleteProduct = async (req, res) => {
	try {
		const { dashboardId, id } = req.params
		const userId = req.user.userId

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboardId' })
		}

		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Missing or invalid Id' })
		}

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const product = await Product.findByIdAndDelete(id)
		if (!product) {
			return res.status(404).json({ message: 'Product not found' })
		}

		dashboard.productsIds = dashboard.productsIds.filter(p => p.toString() !== id)
		await dashboard.save()

		const message = `Product deleted (${product.name})`
		await addLog(dashboard.logsId, userId, message)

		res.status(204).send()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
