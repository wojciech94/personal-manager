const mongoose = require('mongoose')

const LogEntrySchema = new mongoose.Schema({
	timestamps: {
		type: Date,
		default: Date.now,
	},
	initiatorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
})

const LogsSchema = new mongoose.Schema({
	logs: [LogEntrySchema],
})

module.exports = mongoose.model('Logs', LogsSchema)
