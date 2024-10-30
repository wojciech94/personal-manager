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
		}
	],
	created_at: {
		type: Date,
		default: Date.now(),
	},
})

const Dashboard = mongoose.model('Dashboard', dashboardSchema)

module.exports = Dashboard
