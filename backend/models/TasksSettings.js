const mongoose = require('mongoose')

const tasksSettingsSchema = new mongoose.Schema({
	showDeadline: {
		type: Boolean,
		default: true,
	},
	archivizationTime: {
		type: Number,
		default: 24,
	},
	removeTime: {
		type: Number,
		default: 720,
	},
	sortMethod: {
		type: String,
		enum: ['created_at', 'expired_at', 'priority'],
		default: 'created_at',
	},
	sortDirection: {
		type: String,
		enum: ['asc', 'desc'],
		default: 'desc',
	},
})

const TasksSettings = mongoose.model('TasksSettings', tasksSettingsSchema)

module.exports = TasksSettings
