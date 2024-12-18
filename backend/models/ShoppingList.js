const mongoose = require('mongoose')

const ShoppingListSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		list: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'ShoppingItem',
				},
			],
			default: [],
		},
		creatorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: true }
)

const ShoppingList = mongoose.model('ShoppingList', ShoppingListSchema)

module.exports = ShoppingList
