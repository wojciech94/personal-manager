const Dashboard = require('../models/Dashboard')
const Note = require('../models/Note')
const NoteCategory = require('../models/NoteCategory')
const User = require('../models/User')
const { addLog } = require('./logsController')

exports.addNote = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { title, content, category, tags, folder_id, is_favourite, expired_at } = req.body
		const userId = req.user.userId

		if (!title || !content) {
			return res.status(400).json({ message: 'Title and content are required.' })
		}

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const newNote = new Note({
			title,
			content,
			category: category || 'Other',
			is_favourite: is_favourite || false,
			tags: tags || [],
			folder_id: folder_id || null,
			expired_at: expired_at || null,
		})

		await newNote.save()

		dashboard.notesIds.push(newNote._id)
		await dashboard.save()

		const message = `Added new note (${title})`
		await addLog(dashboard.logsId, userId, message)

		res.json(newNote)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.addNoteCategory = async (req, res) => {
	try {
		const userId = req.user.userId

		const user = await User.findById(userId)

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		const { name } = req.body

		if (!name) {
			return res.status(400).json({ message: 'No category name provided' })
		}

		const existingCategory = await NoteCategory.findOne({ name })
		let newNoteCategory
		if (!existingCategory) {
			newNoteCategory = await NoteCategory.create({ name })
		}

		const noteCategoryId = existingCategory ? existingCategory._id : newNoteCategory._id
		user.note_categories.push(noteCategoryId)
		await user.save()

		res.status(200).json({ message: 'Category added successfully', categoryId: noteCategoryId })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getNotes = async (req, res) => {
	try {
		const { dashboardId, folderId } = req.params

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const query = { _id: { $in: dashboard.notesIds } }
		if (folderId) {
			query.folder_id = folderId
		}

		const notes = await Note.find(query)
		const now = new Date()
		const expiredNotes = notes.filter(note => {
			if (note.expired_at) {
				return note.expired_at < now
			}
			return false
		})

		if (expiredNotes.length > 0) {
			const expiredIds = expiredNotes.map(note => note._id)
			dashboard.notesIds = dashboard.notesIds.filter(n => !expiredNotes.includes(n))
			await dashboard.save()
			await Note.deleteMany({ _id: { $in: expiredIds } })
		}

		const validNotes = notes.filter(note => {
			if (note.expired_at) {
				return note.expired_at > now
			}
			return true
		})

		res.json(validNotes)
	} catch (error) {
		console.error(error)
		if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}
		res.status(500).json({ message: error.message })
	}
}

exports.getNote = async (req, res) => {
	try {
		const { noteId } = req.params

		const note = await Note.findById(noteId)

		if (!note) {
			return res.status(404).json({ message: 'Note not found' })
		}

		res.json(note)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getNoteCategories = async (req, res) => {
	const { dashboardId } = req.params

	const dashboard = await Dashboard.findById(dashboardId).populate('userIds')

	if (!dashboard) {
		return res.status(404).json({ message: 'Dashboard not found' })
	}

	const noteCategoryIds = []

	for (const user of dashboard.userIds) {
		if (user.note_categories && Array.isArray(user.note_categories)) {
			noteCategoryIds.push(...user.note_categories)
		}
	}

	const uniqueNoteCategoryIds = [...new Set(noteCategoryIds)]

	const noteCategories = await NoteCategory.find({ _id: { $in: uniqueNoteCategoryIds } })

	const categoryNames = noteCategories.map(category => category.name)

	res.status(200).json(categoryNames)
}

exports.updateNote = async (req, res) => {
	try {
		const userId = req.user.userId

		const { noteId, dashboardId } = req.params
		const note = await Note.findById(noteId)

		if (!note) {
			return res.status(404).json({ message: 'Note not found' })
		}

		const dashboard = await Dashboard.findById(dashboardId).populate('userIds')

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const { title, content, category, tags, folder_id, is_favourite, expired_at } = req.body

		if (title) note.title = title
		if (content) note.content = content
		if (category) note.category = category
		if (tags) note.tags = tags
		note.folder_id = folder_id ? folder_id : null
		if (typeof is_favourite !== 'undefined') note.is_favourite = is_favourite
		if (expired_at) note.expired_at = expired_at

		await note.save()

		const message = `Note updated (${title})`
		await addLog(dashboard.logsId, userId, message)

		return res.status(200).json({ message: 'Note updated successfully', note })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deleteNote = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { id } = req.body
		const userId = req.user.userId

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (!dashboard.notesIds.includes(id)) {
			return res.status(400).json({ message: `Note not found in ${dashboard.name}` })
		}

		dashboard.notesIds = dashboard.notesIds.filter(noteId => !noteId.equals(id))

		await dashboard.save()

		const note = await Note.findByIdAndDelete(id)
		if (!note) {
			return res.status(404).json({ message: 'Note not found' })
		}

		const message = `Note deleted (${note.title})`
		await addLog(dashboard.logsId, userId, message)

		return res.status(200).json({ message: 'Note removed successfully from dashboard' })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
