const TaskGroup = require('../models/TaskGroup')
const Dashboard = require('../models/Dashboard')
const mongoose = require('mongoose')
const { addLog } = require('./logsController')

exports.addTasksGroup = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { name } = req.body
		const userId = req.user.userId

		if (!name) {
			return res.status(500).json({ message: 'No name provided in the request body' })
		}

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const existingTodoGroup = await TaskGroup.findOne({ name, _id: { $in: dashboard.todoGroupIds } })

		if (existingTodoGroup) {
			return res.status(409).json({ message: 'A group with this name allready exist on the dashboard.' })
		}

		let newGroup = await TaskGroup.create({ name })

		dashboard.todoGroupIds.push(newGroup._id)
		await dashboard.save()

		const message = `Added new tasks group (${name})`
		await addLog(dashboard.logsId, userId, message)

		res.status(200).json(newGroup)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getTasksGroup = async (req, res) => {
	try {
		const { dashboardId } = req.params

		if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Invalid dashboard ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const todoGroupsIds = dashboard.todoGroupIds
		if (!todoGroupsIds || todoGroupsIds.length === 0) {
			return res.status(404).json({ message: 'No task groups found' })
		}

		const todoGroups = await TaskGroup.find({ _id: { $in: todoGroupsIds } })

		res.status(200).json(todoGroups)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.updateTasksGroup = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { id, name } = req.body
		const userId = req.user.userId

		if (!name || !id) {
			return res.status(400).json({ message: 'No name or id were provided in the request body' })
		}

		const groupToEdit = await TaskGroup.findById(id)

		if (!groupToEdit) {
			return res.status(409).json({ message: 'A group with this id not exist.' })
		}

		groupToEdit.name = name

		await groupToEdit.save()

		const dashboard = await Dashboard.findById(dashboardId).populate('todoGroupIds')
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const message = `Task group updated (new name: ${name})`
		await addLog(dashboard.logsId, userId, message)

		res.status(200).json(dashboard.todoGroupIds)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deleteTasksGroup = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { id } = req.body
		const userId = req.user.userId

		if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Invalid dashboard ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (!id) {
			return res.status(400).json({ message: 'No id provided in the body request' })
		}

		if (!dashboard.todoGroupIds.some(g => g.toString() === id)) {
			return res.status(404).json({ message: 'Task group not associated with this dashboard' })
		}

		const todoGroup = await TaskGroup.findByIdAndDelete(id)
		if (!todoGroup) {
			return res.status(404).json({ message: 'Task group not found' })
		}

		dashboard.todoGroupIds = dashboard.todoGroupIds.filter(g => g.toString() !== id)
		await dashboard.save()

		await dashboard.populate('todoGroupIds')

		const message = `Removed task group (${todoGroup.name})`
		await addLog(dashboard.logsId, userId, message)

		res.status(200).json(dashboard.todoGroupIds)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
