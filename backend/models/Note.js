const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		index: true,
		maxlength: 25,
	},
	content: {
		type: String,
		required: true,
	},
	category: {
		type: String,
	},
	tags: {
		type: [String],
		index: true,
	},
	is_favourite: {
		type: Boolean,
		default: false,
	},
	folder_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Folder',
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
	updated_at: {
		type: Date,
		default: Date.now,
	},
	expired_at: {
		type: Date,
		validate: {
			validator: function (value) {
				return value === null || value > Date.now()
			},
			message: 'Expiration date must be in the future.',
		},
		default: null,
	},
})

noteSchema.pre('save', function (next) {
	this.updated_at = Date.now()
	next()
})

const Note = mongoose.model('Note', noteSchema)

module.exports = Note
