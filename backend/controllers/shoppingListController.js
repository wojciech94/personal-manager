const ShoppingList = require('../models/ShoppingList')
const ShoppingItem = require('../models/ShoppingItem')
const Dashboard = require('../models/Dashboard')

const mongoose = require('mongoose')
const { addLog } = require('./logsController')

exports.addList = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { name } = req.body
		const userId = req.user.userId

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboard Id' })
		}

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Cannot find dashboard for provided Id' })
		}

		const shoppingList = await ShoppingList.create({ name })
		if (!shoppingList) {
			return res.status(500).json({ message: 'Unknown error: Cannot create shoppingList ' })
		}

		const shoppingListId = shoppingList._id

		dashboard.shoppingListsIds.push(shoppingListId)

		await dashboard.save()

		const message = `Created new shopping list (${name})`
		await addLog(dashboard.logsId, userId, message)

		res.status(201).json(shoppingList)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getLists = async (req, res) => {
	try {
		const { dashboardId } = req.params

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboard Id' })
		}

		const dashboard = await Dashboard.findById(dashboardId).populate('shoppingListsIds')

		if (!dashboard) {
			return res.status(404).json({ message: 'Cannot find dashboard for provided Id' })
		}

		const list = dashboard.shoppingListsIds || []

		res.status(200).json(list)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getList = async (req, res) => {
	try {
		const { id } = req.params

		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Missing or invalid shopping list Id' })
		}

		const shoppingList = await ShoppingList.findById(id)
		if (!shoppingList) {
			res.status(404).json({ message: 'Cannot find shopping list for provided Id' })
		}

		const shoppingItems = await ShoppingItem.find({ _id: { $in: shoppingList.list } }).populate('productId')

		res.status(200).json({ ...shoppingList.toObject(), list: shoppingItems })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.updateList = async (req, res) => {
	try {
		const { id, dashboardId } = req.params
		const { name, creatorId } = req.body
		const userId = req.user.userId

		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Missing or invalid shopping list Id' })
		}

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboard Id' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Cannot find dashboard for provided Id' })
		}

		const shoppingList = await ShoppingList.findById(id)
		if (!shoppingList) {
			return res.status(404).json({ message: 'Cannot find shopping list for provided Id' })
		}

		if (name) shoppingList.name = name
		if (creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) shoppingList.creatorId = creatorId

		await shoppingList.save()

		const message = `Shopping list updated (${name})`
		await addLog(dashboard.logsId, userId, message)

		res.status(200).json(shoppingList)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deleteList = async (req, res) => {
	try {
		const { id, dashboardId } = req.params
		const userId = req.user.userId

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboard Id' })
		}

		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Missing or invalid Id' })
		}

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Cannot find dashboard for provided Id' })
		}

		const shoppingList = await ShoppingList.findByIdAndDelete(id)
		if (!shoppingList) {
			return res.status(404).json({ message: 'Cannot find shopping list for provided Id' })
		}

		dashboard.shoppingListsIds = dashboard.shoppingListsIds.filter(list => list._id !== id)

		await dashboard.save()

		const message = `Shopping list deleted (${shoppingList.name})`
		await addLog(dashboard.logsId, userId, message)

		res.status(204).send()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
