const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
	content: {
		type: String,
	},
	priority: {
		type: String,
		enum: ['low', 'medium', 'high'],
	},
	is_done: {
		type: Boolean,
		default: false,
	},
	created_at: {
		type: Date,
		default: () => new Date(),
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
	archived_at: {
		type: Date,
		default: null,
	},
	removed_at: {
		type: Date,
		default: null,
	},
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
