const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	category: {
		type: String,
		default: 'Other',
		trim: true,
	},
	unit: {
		type: String,
		default: 'piece',
		trim: true,
	},
	price: {
		type: Number,
		min: 0,
	},
	tags: {
		type: [String],
		default: [],
	},
	isFavourite: {
		type: Boolean,
		default: false,
	},
})

const Product = mongoose.model('Product', ProductSchema)

module.exports = Product
