const Dashboard = require('../models/Dashboard')
const User = require('../models/User')

//### Users
exports.addUser = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { name } = req.body

		const user = await User.findOne({ name: name })
		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (dashboard.userIds.includes(user._id)) {
			return res.status(400).json({ message: 'User already added to the dashboard' })
		}

		dashboard.userIds.push(user._id)
		await dashboard.save()
		res.json(dashboard)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getUserId = async (req, res) => {
	try {
		const userId = req.user.userId
		if (!userId) {
			throw new Error('Cannot decode user for provided token')
		}

		res.status(200).json({ userId })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
}

exports.removeUser = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { id } = req.body

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const userId = req.user.userId

		if (!dashboard.userIds.includes(userId)) {
			return res.status(400).json({ message: `User doesn't have access to dashboard ${dashboard.name}` })
		}

		//If id is provided remove id, else remove userId
		const idToDelete = id ? id : userId
		const initialLength = dashboard.userIds.length
		dashboard.userIds = dashboard.userIds.filter(id => !id.equals(idToDelete))

		if (dashboard.userIds.length === 0 && initialLength === 1) {
			await Dashboard.deleteOne({ _id: dashboardId })
			return res.status(200).json({ message: 'Last user removed. Dashboard deleted.' })
		} else {
			await dashboard.save()
			return res.status(200).json({ message: 'Access removed successfully' })
		}
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
