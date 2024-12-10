const mongoose = require('mongoose')

const dashboardSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	creatorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	userIds: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	notesIds: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Note',
		},
	],
	foldersIds: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Folder',
		},
	],
	todoGroupIds: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'TaskGroup',
		},
	],
	created_at: {
		type: Date,
		default: Date.now(),
	},
	tasksSettingsId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'TasksSettings',
	},
})

const Dashboard = mongoose.model('Dashboard', dashboardSchema)

module.exports = Dashboard
