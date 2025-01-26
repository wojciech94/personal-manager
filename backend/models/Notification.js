const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
	content: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		enum: ['invitation', 'info'],
		default: 'info',
	},
	read: {
		type: Boolean,
		default: false,
	},
	creatorId: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
	},
	dashboardId: {
		type: mongoose.Types.ObjectId,
		ref: 'Dashboard',
	},
	timestamps: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Notification', NotificationSchema)
