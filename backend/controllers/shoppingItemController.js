const ShoppingItem = require('../models/ShoppingItem')
const ShoppingList = require('../models/ShoppingList')

const mongoose = require('mongoose')

exports.addItem = async (req, res) => {
	try {
		const { shoppingListId } = req.params
		const { quantity, notes, customUnit, customPrice, isPurchased, productId } = req.body

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
		const { id } = req.params
		const { quantity, notes, customUnit, customPrice, isPurchased } = req.body

		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Missing or invalid shopping item Id' })
		}

		const shoppingItem = await ShoppingItem.findById(id)

		if (!shoppingItem) {
			return res.status(404).json({ message: 'Cannot find shopping item for provided Id' })
		}

		if (quantity) shoppingItem.quantity = quantity
		if (notes) shoppingItem.notes = notes
		if (customUnit) shoppingItem.customUnit = customUnit
		if (customPrice) shoppingItem.customPrice = customPrice
		if (typeof isPurchased !== 'undefined') shoppingItem.isPurchased = isPurchased

		await shoppingItem.save()

		res.status(200).json(shoppingItem)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deleteItem = async (req, res) => {
	try {
		const { id, shoppingListId } = req.params
		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Missing or invalid shopping item Id' })
		}

		if (!shoppingListId || !mongoose.Types.ObjectId.isValid(shoppingListId)) {
			return res.status(400).json({ message: 'Missing or invalid shopping list Id' })
		}

		const shoppingList = await ShoppingList.findById(shoppingListId)
		if (!shoppingList) {
			return res.status(404).json({ message: 'Cannot find shopping list for provided Id' })
		}

		const shoppingItem = await ShoppingItem.findByIdAndDelete(id)

		if (!shoppingItem) {
			return res.status(404).json({ message: 'Cannot find shopping item for provided Id' })
		}

		shoppingList.list = shoppingList.list.filter(el => el._id !== id)
		await shoppingList.save()

		res.status(204).send()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
