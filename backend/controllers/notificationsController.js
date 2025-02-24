const User = require('../models/User')
const mongoose = require('mongoose')
const Notification = require('../models/Notification')
const Dashboard = require('../models/Dashboard')

exports.addNotification = async (req, res) => {
	try {
		const userId = req.user.userId

		const { content, type, author, target, dashboardId } = req.body
		const creatorId = author ? author : userId
		const targetId = target ? target : userId

		const notification = await Notification.create({ content, type, creatorId, dashboardId })

		if (!notification) {
			return res.status(500).json({ message: 'Cannot create notification.' })
		}

		const user = mongoose.Types.ObjectId.isValid(target)
			? await User.findById(targetId)
			: await User.findOne({ name: target })
		if (!user) {
			return res.status(404).json({ message: 'Cannot find User for provided target' })
		}

		user.notifications.push(notification._id)

		await user.save()
		res.status(201).json(notification)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.acceptNotification = async (req, res) => {
	try {
		const userId = req.user.userId
		const { id } = req.body

		const notification = await Notification.findByIdAndDelete(id)
		if (!notification) {
			return res.status(404).json({ message: 'Cannot find notification for provided Id.' })
		}

		const user = await User.findById(userId)
		if (!user) {
			return res.status(404).json({ message: 'Cannot find User.' })
		}

		const dashboard = await Dashboard.findById(notification.dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found for provided Id' })
		}

		user.notifications = user.notifications.filter(n => n.toString() !== id)
		await user.save()

		if (!dashboard.userIds.includes(userId)) {
			dashboard.userIds.push(userId)
			await dashboard.save()
		}

		const updatedUser = await User.findById(userId).populate({
			path: 'notifications',
			populate: {
				path: 'creatorId',
				select: 'name',
			},
		})

		res.status(200).json(updatedUser.notifications)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getNotifications = async (req, res) => {
	try {
		const userId = req.user.userId
		if (!userId) {
			return res.status(500).json({ message: 'Cannot get userId' })
		}

		const user = await User.findById(userId).populate({
			path: 'notifications',
			populate: {
				path: 'creatorId',
				select: 'name',
			},
		})

		if (!user) {
			return res.status(404).json({ message: 'User not found for provided Id' })
		}

		const notifications = user.notifications

		console.log(notifications)

		res.status(200).json(notifications)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.updateNotification = async (req, res) => {
	try {
		const userId = req.user.userId
		const { id, read } = req.body

		if (!userId) {
			return res.status(500).json({ message: 'Cannot get userId' })
		}

		const user = await User.findById(userId)

		if (!user) {
			return res.status(404).json({ message: 'User not found for provided Id' })
		}

		const notification = Notification.findById(id)
		if (!notification) {
			return res.status(404).json({ message: 'Notification not found for provided id' })
		}

		if (typeof read === 'boolean') notification.read = read

		await notification.save()
		res.status(200).json(notification)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deleteNotification = async (req, res) => {
	try {
		const userId = req.user.userId
		const { id } = req.body

		if (!userId) {
			return res.status(500).json({ message: 'Cannot get userId' })
		}

		const user = await User.findById(userId)
		if (!user) {
			return res.status(404).json({ message: 'Cannot find user for provided Id' })
		}

		const notification = await Notification.findByIdAndDelete(id)
		if (!notification) {
			return res.status(404).json({ message: 'Cannot find notification to delete' })
		}

		user.notifications = user.notifications.filter(n => n.toString() !== id)

		await user.save()

		res.status(204).send()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
