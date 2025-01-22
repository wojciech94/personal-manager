const Dashboard = require('../models/Dashboard')
const TasksSettings = require('../models/TasksSettings')
const { createLogs, addLog } = require('./logsController')
const { getUserName } = require('./userController')

//### Dashboards
exports.getDashboards = async (req, res) => {
	try {
		const userId = req.user.userId

		const dashboards = await Dashboard.find({ userIds: userId })
		res.status(200).json(dashboards)
	} catch (error) {
		console.error(error)
		if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}
		res.status(500).json({ message: error.message })
	}
}

exports.addDashboard = async (req, res) => {
	try {
		const { name } = req.body
		if (!name) {
			return res.status(400).json({ message: 'Dashboard name is required' })
		}

		const userId = req.user.userId

		const newTasksSettings = new TasksSettings()
		await newTasksSettings.save()

		const newLog = await createLogs(userId, `Created new dashboard with name '${name}'`)

		const newDashboard = new Dashboard({
			name,
			creatorId: userId,
			userIds: [userId],
			notesIds: [],
			tasksSettingsId: newTasksSettings._id,
			logsId: newLog._id,
		})

		await newDashboard.save()

		res.status(201).json(newDashboard)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getDashboardDetails = async (req, res) => {
	try {
		const userId = req.user.userId

		const { dashboardId } = req.params

		if (!dashboardId) {
			return res.status(404).json({ message: 'No DashboardId' })
		}

		const dashboard = await Dashboard.findById(dashboardId)
			.populate('creatorId', 'name')
			.populate('userIds', 'name')
			.populate({
				path: 'logsId',
				populate: {
					path: 'logs.initiatorId',
					select: 'name',
				},
			})
			.lean()

		if (!dashboard) {
			return res.status(404).json({ message: `Dashboard ${dashboardId} not found` })
		}
		const creatorId = String(dashboard.creatorId._id)
		const isOwner = userId === creatorId
		dashboard.isOwner = isOwner

		return res.status(200).json(dashboard)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.updateDashboard = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { name, creatorId, tasksArchiveTime, tasksRemoveTime } = req.body
		const userId = req.user.userId

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		let logDetails = ''

		if (name && dashboard.name !== name) {
			dashboard.name = name
			logDetails += `new name: ${name} `
		}
		if (creatorId && dashboard.creatorId.toString() !== creatorId) {
			dashboard.creatorId = creatorId
			const userName = await getUserName(creatorId)
			logDetails += `new owner: ${userName} `
		}
		if (tasksArchiveTime && dashboard.tasksArchiveTime !== tasksArchiveTime) {
			dashboard.tasksArchiveTime = tasksArchiveTime
			logDetails += `new tasks archive time: ${new Date(tasksArchiveTime).toLocaleDateString()}`
		}
		if (tasksRemoveTime && dashboard.tasksRemoveTime !== tasksRemoveTime) {
			dashboard.tasksRemoveTime = tasksRemoveTime
			logDetails += `new tasks remove time: ${new Date(tasksRemoveTime).toLocaleDateString()}`
		}

		logDetails = 'Dashboard updated ' + logDetails

		const logsId = dashboard.logsId
		if (logsId) {
			await addLog(logsId, userId, logDetails)
		}

		await dashboard.save()
		res.status(200).json({ message: 'Dashboard updated', dashboard })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deleteDashboard = async (req, res) => {
	try {
		const { dashboardId } = req.params

		if (!dashboardId) {
			return res.status(400).json({ message: 'No dashboardId provided' })
		}

		const dashboard = await Dashboard.findByIdAndDelete(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found for provided id' })
		}
		res.status(204).send()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

//### Tasks settings
exports.getTasksSettings = async (req, res) => {
	try {
		const { dashboardId } = req.params

		if (!dashboardId) {
			return res.status(404).json({ message: 'No DashboardId' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: `Dashboard ${dashboardId} not found` })
		}

		const tasksSettingsId = dashboard.tasksSettingsId
		if (!tasksSettingsId) {
			return res.status(404).json({ message: `Tasks settings not found for ${dashboardId}` })
		}

		const tasksSettings = await TasksSettings.findById(tasksSettingsId)
		if (!tasksSettings) {
			return res.status(404).json({ message: `Tasks settings not found` })
		}

		return res.status(200).json(tasksSettings)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.updateTasksSettings = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { showDeadline, archivizationTime, removeTime, sortMethod, sortDirection } = req.body
		const userId = req.user.userId

		if (!dashboardId) {
			return res.status(404).json({ message: 'No DashboardId' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: `Dashboard ${dashboardId} not found` })
		}

		const tasksSettingsId = dashboard.tasksSettingsId
		if (!tasksSettingsId) {
			return res.status(404).json({ message: `Tasks settings not found for ${dashboardId}` })
		}

		const tasksSettings = await TasksSettings.findById(tasksSettingsId)
		if (!tasksSettings) {
			return res.status(404).json({ message: `Tasks settings not found` })
		}

		if (typeof showDeadline !== 'undefined') tasksSettings.showDeadline = showDeadline
		if (archivizationTime) tasksSettings.archivizationTime = archivizationTime
		if (removeTime) tasksSettings.removeTime = removeTime
		if (sortMethod) tasksSettings.sortMethod = sortMethod
		if (sortDirection) tasksSettings.sortDirection = sortDirection

		const logsId = dashboard.logs
		if (logsId) {
			await addLog(logsId, userId, 'Tasks settings updated')
		}

		await tasksSettings.save()

		return res.status(200).json(tasksSettings)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
