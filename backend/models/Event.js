const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: false,
		default: '',
	},
	startDate: {
		type: Date,
		required: true,
	},
	endDate: {
		type: Date,
		required: false,
		default: null,
	},
	location: {
		type: String,
		required: false,
		default: null,
	},
	allDay: {
		type: Boolean,
		default: false,
	},
	tags: [
		{
			type: String,
			required: false,
			default: [],
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
})

const Event = mongoose.model('Event', eventSchema)

module.exports = Event
