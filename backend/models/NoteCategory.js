const mongoose = require('mongoose')

const noteCategorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
})

const NoteCategory = mongoose.model('NoteCategory', noteCategorySchema)

module.exports = NoteCategory
