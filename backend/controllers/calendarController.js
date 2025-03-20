const mongoose = require('mongoose')
const Dashboard = require('../models/Dashboard')
const Event = require('../models/Event')
const { addLog } = require('./logsController')

exports.addEvent = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { title, description, startDate, endDate, allDay } = req.body
		const userId = req.user.userId

		if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Invalid dashboard ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (!title) {
			return res.status(400).json({ message: 'title is a required param' })
		}

		if (!startDate) {
			return res.status(400).json({ message: 'startDate is a required param' })
		}

		const event = await Event.create({ title, description, startDate, endDate, allDay })

		if (!event) {
			return res.status(500).json({ message: 'Failed to create Event' })
		}

		dashboard.eventIds.push(event._id)
		await dashboard.save()

		const message = `Added new event (${title})`
		await addLog(dashboard.logsId, userId, message)

		res.status(201).json(event)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getEvents = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { startDate, endDate } = req.query

		if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Invalid dashboard ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		let query = { _id: { $in: dashboard.eventIds } }

		if (startDate && endDate) {
			query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) }
		} else if (startDate) {
			query.startDate = { $gte: new Date(startDate) }
		} else if (endDate) {
			query.startDate = { $lte: new Date(endDate) }
		}

		const events = await Event.find(query).sort({ startDate: 1 })

		res.status(200).json(events)
	} catch (error) {
		console.error('Error fetching events:', error)
		res.status(500).json({ message: error.message })
	}
}

exports.deleteEvent = async (req, res) => {
	try {
		const { dashboardId, eventId } = req.params
		const event = await Event.findByIdAndDelete(eventId)
		const userId = req.user.userId

		if (!event) {
			return res.status(404).json({ message: 'Event not found' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		dashboard.eventIds.filter(e => e._id.toString() !== event._id)
		await dashboard.save()

		const message = `Event deleted: (${event.title})`
		await addLog(dashboard.logsId, userId, message)

		return res.status(204).send()
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: 'Server error', error: error.message })
	}
}
