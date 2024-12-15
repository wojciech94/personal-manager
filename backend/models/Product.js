const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	category: {
		type: String,
		default: 'Uncategorized',
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
})

const Product = mongoose.model('Product', ProductSchema)

module.exports = Product
