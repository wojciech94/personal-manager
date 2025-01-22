const Dashboard = require('../models/Dashboard')
const Folder = require('../models/Folder')
const mongoose = require('mongoose')
const { addLog } = require('./logsController')

exports.addFolder = async (req, res) => {
	try {
		const userId = req.user.userId
		const { dashboardId } = req.params

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const { name } = req.body

		if (!name) {
			return res.status(400).json({ message: 'No folder name provided' })
		}

		const existingFolder = await Folder.findOne({ name })
		let newFolder
		if (!existingFolder) {
			newFolder = await Folder.create({ name })
		}

		const folderId = existingFolder ? existingFolder._id : newFolder._id
		dashboard.foldersIds.push(folderId)
		await dashboard.save()

		const message = `Added new folder (${name}) to notes panel.`
		await addLog(dashboard.logsId, userId, message)

		res.status(200).json({ message: 'Folder added successfully', folderId: folderId })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getFolders = async (req, res) => {
	const { dashboardId } = req.params

	if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
		return res.status(400).json({ message: 'Invalid dashboard ID format' })
	}

	const dashboard = await Dashboard.findById(dashboardId).populate('userIds')

	if (!dashboard) {
		return res.status(404).json({ message: 'Dashboard not found' })
	}

	const folderIds = dashboard.foldersIds

	if (!folderIds || folderIds.length === 0) {
		return res.status(204).send()
	}

	const folders = await Folder.find({ _id: { $in: folderIds } })

	if (!folders || folders.length === 0) {
		return res.status(404).json({ message: 'No folders found' })
	}

	res.status(200).json(folders)
}

exports.updateFolder = async (req, res) => {
	try {
		const userId = req.user.userId

		const { folderId, dashboardId } = req.params
		const { name } = req.body

		const folder = await Folder.findById(folderId)

		if (!folder) {
			return res.status(404).json({ message: 'Folder not found' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const message = `Changed folder name from ${folder.name} to ${name}`
		await addLog(dashboard.logsId, userId, message)

		folder.name = name

		await folder.save()

		return res.status(200).json({ message: 'Folder updated', folder })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deleteFolder = async (req, res) => {
	try {
		const { dashboardId, folderId } = req.params
		const userId = req.user.userId

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (!dashboard.foldersIds.includes(folderId)) {
			return res.status(400).json({ message: `No folder in ${dashboard.name}` })
		}

		dashboard.foldersIds = dashboard.foldersIds.filter(fId => !fId.equals(folderId))

		await dashboard.save()

		const folder = await Folder.findByIdAndDelete({ _id: folderId })

		const message = `Deleted folder ${folder.name}`
		await addLog(dashboard.logsId, userId, message)

		return res.status(200).json({ message: 'Folder removed successfully from dashboard' })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
