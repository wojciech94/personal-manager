const Dashboard = require('../models/Dashboard')
const Task = require('../models/Task')
const TaskGroup = require('../models/TaskGroup')
const mongoose = require('mongoose')
const { addLog } = require('./logsController')

exports.getTasks = async (req, res) => {
	try {
		const { dashboardId, groupId } = req.params
		const { sortBy = 'created_at', order = 'asc' } = req.query

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

		let tasks = []

		if (groupId) {
			const group = await TaskGroup.findOne({ _id: groupId }).populate('tasks')
			if (!group) {
				return res.status(404).json({ message: 'Group not found for specific Id' })
			}
			tasks = group.tasks
		} else {
			const groups = await TaskGroup.find({ _id: { $in: todoGroupsIds } }).populate('tasks')
			groups.forEach(group => {
				tasks = tasks.concat(group.tasks)
			})
		}

		if (tasks.length === 0) {
			return res.status(200).json({ tasks, message: 'No tasks found in any group' })
		}

		const validSortFields = ['created_at', 'expired_at', 'priority']
		if (!validSortFields.includes(sortBy)) {
			return res.status(400).json({ message: `Invalid sort field: ${sortBy}` })
		}

		const priorityMap = {
			low: 0,
			medium: 1,
			high: 2,
		}

		const mapPriority = priority => priorityMap[priority] ?? -1

		const sortOrder = order === 'desc' ? -1 : 1

		tasks.sort((a, b) => {
			const aValue = a[sortBy] ?? (sortOrder === 1 ? Infinity : -Infinity)
			const bValue = b[sortBy] ?? (sortOrder === 1 ? Infinity : -Infinity)

			if (sortBy === 'priority') {
				return (mapPriority(a.priority) - mapPriority(b.priority)) * sortOrder
			}

			if (aValue < bValue) return -sortOrder
			if (aValue > bValue) return sortOrder
			return 0
		})

		res.status(200).json({ tasks })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.addTask = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { content, priority, groupId, expirationDate } = req.body
		const userId = req.user.userId

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (!content) {
			return res.status(400).json({ message: 'No content provided in the request body' })
		}

		const taskGroup = await TaskGroup.findById(groupId)
		if (!taskGroup) {
			return res.status(404).json({ message: 'Task group not found for provided id' })
		}

		const task = await Task.create({ content, priority, expired_at: expirationDate })

		taskGroup.tasks.push(task)
		await taskGroup.save()

		const message = `Added new task (${task._id})`
		await addLog(dashboard.logsId, userId, message)

		res.status(201).json(task)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.updateTask = async (req, res) => {
	try {
		const { content, is_done, priority, expired_at, archived_at, removed_at } = req.body
		const { id, dashboardId } = req.params
		const userId = req.user.userId

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid task ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const task = await Task.findById(id)

		if (!task) {
			return res.status(404).json({ message: 'Task not found for provided id' })
		}

		if (content !== undefined) task.content = content
		if (typeof is_done === 'boolean') task.is_done = is_done
		if (priority !== undefined) task.priority = priority
		if (expired_at !== undefined) task.expired_at = expired_at
		if (archived_at !== undefined) task.archived_at = archived_at
		if (removed_at !== undefined) task.removed_at = removed_at

		await task.save()

		const message = `Update task (${task._id})`
		await addLog(dashboard.logsId, userId, message)

		res.status(200).json(task)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deleteTask = async (req, res) => {
	try {
		const { id, dashboardId } = req.params
		const userId = req.user.userId

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const task = await Task.findById(id)

		if (!task) {
			return res.status(404).json({ message: 'Task not found for provided Id' })
		}

		const taskGroup = await TaskGroup.findOne({ tasks: id })
		if (!taskGroup) {
			return res.status(404).json({ message: 'No tasks group containing this task was found' })
		}
		taskGroup.tasks = taskGroup.tasks.filter(t => t._id !== id)
		await taskGroup.save()

		await Task.deleteOne({ _id: id })

		const message = `Task deleted (${id})`
		await addLog(dashboard.logsId, userId, message)

		res.status(204).send()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
