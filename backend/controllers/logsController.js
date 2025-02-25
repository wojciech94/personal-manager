const Dashboard = require('../models/Dashboard')
const Logs = require('../models/Logs')

exports.createLogs = async (initiatorId, message) => {
	try {
		const logEntry = {
			initiatorId: initiatorId,
			message: message,
			timestamps: new Date(),
		}

		const newLog = new Logs({ logs: [logEntry] })
		await newLog.save()

		return newLog
	} catch (error) {
		console.error('Error creating logs:', error)
		throw error
	}
}

exports.addLog = async (logsId, initiatorId, message) => {
	try {
		const logEntry = {
			initiatorId: initiatorId,
			message: message,
			timestamps: new Date(),
		}

		const logsObj = await Logs.findById(logsId)
		if (!logsObj) {
			throw new Error("Couldn't find logs for the provided id")
		}

		logsObj.logs.unshift(logEntry)
		await logsObj.save()
	} catch (error) {
		console.error('Error adding log:', error)
		throw error
	}
}

//Routes
exports.getLogs = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found for provided Id' })
		}

		const logs = await Logs.findById(dashboard.logs).populate('logs.initiatorId', 'name')
		if (!logs) {
			return res.status(404).json({ message: 'Logs not found for current dashboard' })
		}
		res.status(200).json(logs)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
