const Dashboard = require('../models/Dashboard')
const Product = require('../models/Product')
const mongoose = require('mongoose')

exports.addProduct = async (req, res) => {
	try {
		const { dashboardId } = req.params

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

		res.status(201).json(product)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getProducts = async (req, res) => {
	try {
		const { dashboardId } = req.params

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboardId' })
		}

		const dashboard = await Dashboard.findById(dashboardId).populate('productsIds')

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found for provided id' })
		}

		res.status(201).json(dashboard.productsIds)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.updateProducts = async (req, res) => {
	try {
		const { dashboardId, productId } = req.params

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

		res.status(200).json(product)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deleteProduct = async (req, res) => {
	try {
		const { dashboardId, id } = req.params
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

		res.status(204).send()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
