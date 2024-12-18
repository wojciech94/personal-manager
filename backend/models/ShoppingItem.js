const mongoose = require('mongoose')

const ShoppingItemSchema = mongoose.Schema(
	{
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product',
			required: true,
		},
		quantity: {
			type: Number,
			min: 0,
			default: 1,
			required: true,
		},
		notes: { type: String, trim: true, default: '' },
		customUnit: {
			type: String,
			default: ''
		},
		customPrice: {
			type: Number,
		},
		isPurchased: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
)

const ShoppingItem = mongoose.model('ShoppingItem', ShoppingItemSchema)

module.exports = ShoppingItem
