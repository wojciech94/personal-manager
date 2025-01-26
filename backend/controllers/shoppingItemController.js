const ShoppingItem = require('../models/ShoppingItem')
const ShoppingList = require('../models/ShoppingList')
const { addLog } = require('./logsController')

const mongoose = require('mongoose')
const Dashboard = require('../models/Dashboard')

exports.addItem = async (req, res) => {
	try {
		const { shoppingListId, dashboardId } = req.params
		const { quantity, notes, customUnit, customPrice, isPurchased, productId } = req.body
		const userId = req.user.userId

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboard Id' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Cannot find dashboard for provided Id' })
		}

		if (!quantity) {
			return res.status(400).json({ message: 'Quantity is a required filed' })
		}

		if (!shoppingListId || !mongoose.Types.ObjectId.isValid(shoppingListId)) {
			return res.status(400).json({ message: 'Missing or invalid shoppingListId' })
		}

		const shoppingList = await ShoppingList.findById(shoppingListId)

		if (!shoppingList) {
			return res.status(404).json({ message: 'Canot find shopping list for provided Id' })
		}

		const shoppingItem = await ShoppingItem.create({ productId, quantity, notes, customUnit, customPrice, isPurchased })

		shoppingList.list.push(shoppingItem)

		await shoppingList.save()

		const message = `Added new shopping item (${shoppingItem.productId.name}) to ${shoppingList.name}`
		await addLog(dashboard.logsId, userId, message)

		res.status(201).json(shoppingItem)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getItems = async (req, res) => {
	try {
		const { shoppingListId } = req.params
		if (!shoppingListId || !mongoose.Types.ObjectId.isValid(shoppingListId)) {
			return res.status(400).json({ message: 'Missing or invalid shoppingListId' })
		}

		const shoppingList = await ShoppingList.findById(shoppingListId).populate('list')
		if (!shoppingList) {
			return res.status(404).json({ message: 'Cannot find shopping list for provided Id' })
		}

		const shoppingItems = await ShoppingItem.find({ _id: { $in: shoppingList.list } }).populate('productId')
		res.status(200).json(shoppingItems)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.updateItem = async (req, res) => {
	try {
		const { dashboardId, shoppingListId, id } = req.params
		const { quantity, notes, customUnit, customPrice, isPurchased } = req.body
		const userId = req.user.userId

		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Missing or invalid shopping item Id' })
		}

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboard Id' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Cannot find dashboard for provided Id' })
		}

		const shoppingItem = await ShoppingItem.findById(id).populate('productId')

		if (!shoppingItem) {
			return res.status(404).json({ message: 'Cannot find shopping item for provided Id' })
		}

		const shoppingList = await ShoppingList.findById(shoppingListId)

		if (!shoppingList) {
			return res.status(404).json({ message: 'Cannot find shopping list for provided Id' })
		}

		if (quantity) shoppingItem.quantity = quantity
		if (notes) shoppingItem.notes = notes
		if (customUnit) shoppingItem.customUnit = customUnit
		if (customPrice) shoppingItem.customPrice = customPrice
		if (typeof isPurchased !== 'undefined') shoppingItem.isPurchased = isPurchased

		await shoppingItem.save()
		shoppingList.updatedAt = new Date()
		await shoppingList.save()

		const message = `Update shopping item (${shoppingItem.productId.name})`
		await addLog(dashboard.logsId, userId, message)

		res.status(200).json(shoppingItem)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deleteItem = async (req, res) => {
	try {
		const { dashboardId, id, shoppingListId } = req.params
		const userId = req.user.userId

		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Missing or invalid shopping item Id' })
		}

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboard Id' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Cannot find dashboard for provided Id' })
		}

		if (!shoppingListId || !mongoose.Types.ObjectId.isValid(shoppingListId)) {
			return res.status(400).json({ message: 'Missing or invalid shopping list Id' })
		}

		const shoppingList = await ShoppingList.findById(shoppingListId)
		if (!shoppingList) {
			return res.status(404).json({ message: 'Cannot find shopping list for provided Id' })
		}

		const shoppingItem = await ShoppingItem.findByIdAndDelete(id).populate('productId')

		if (!shoppingItem) {
			return res.status(404).json({ message: 'Cannot find shopping item for provided Id' })
		}

		shoppingList.list = shoppingList.list.filter(el => el._id !== id)
		await shoppingList.save()

		const message = `Delete shopping item (${shoppingItem.productId.name})`
		await addLog(dashboard.logsId, userId, message)

		res.status(204).send()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
