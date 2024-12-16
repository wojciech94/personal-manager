require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const authMiddleware = require('./middlewares/authMiddleware')

const Note = require('./models/Note')
const User = require('./models/User')
const Dashboard = require('./models/Dashboard')
const NoteCategory = require('./models/NoteCategory')
const Folder = require('./models/Folder')
const TaskGroup = require('./models/TaskGroup')
const Task = require('./models/Task')
const TasksSettings = require('./models/TasksSettings')
const Product = require('./models/Product')

const app = express()
const PORT = process.env.PORT || 5000
const corsOptions = {
	origin: ['https://personal-manager-beta.vercel.app', 'http://localhost:5173'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(express.json())

const dbUrl = process.env.DB_URL

mongoose
	.connect(dbUrl)
	.then(() => {
		console.log('MongoDB connected successfully')
	})
	.catch(err => {
		console.error('MongoDB connection error:', err)
	})

// Endpoint logowania użytkowników
app.post('/login', async (req, res) => {
	try {
		const { name, password } = req.body

		const user = await User.findOne({ name })
		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' })
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' })
		}

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

		res.status(200).json({ token })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

app.get('/userId', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId
		if (!userId) {
			throw new Error('Cannot decode user for provided token')
		}

		res.status(200).json({ userId })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

app.post('/register', async (req, res) => {
	try {
		const { name, password } = req.body
		const newUser = new User({ name, password })
		await newUser.save()
		res.status(201).json({ message: 'User created successfully', user: newUser })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

app.get('/users', authMiddleware, async (req, res) => {
	try {
		const users = await User.find()
		res.status(200).json(users)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

app.get('/dashboards', authMiddleware, async (req, res) => {
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
})

app.post('/dashboards', authMiddleware, async (req, res) => {
	try {
		const { name } = req.body
		if (!name) {
			return res.status(400).json({ message: 'Dashboard name is required' })
		}

		const userId = req.user.userId

		const newTasksSettings = new TasksSettings()
		await newTasksSettings.save()

		const newDashboard = new Dashboard({
			name,
			creatorId: userId,
			userIds: [userId],
			notesIds: [],
			tasksSettingsId: newTasksSettings._id,
		})

		await newDashboard.save()

		res.status(201).json(newDashboard)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//Pobieranie danych dashboarda
app.get('/dashboards/:dashboardId', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId

		const { dashboardId } = req.params

		if (!dashboardId) {
			return res.status(404).json({ message: 'No DashboardId' })
		}

		const dashboard = await Dashboard.findById(dashboardId)
			.populate('creatorId', 'name')
			.populate('userIds', 'name')
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
})

app.delete('/dashboards/:dashboardId', authMiddleware, async (req, res) => {
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
})

//Pobieranie danych taskssettings
app.get('/dashboards/:dashboardId/tasks-settings', authMiddleware, async (req, res) => {
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
})

//Aktualizacja danych taskssettings
app.post('/dashboards/:dashboardId/tasks-settings', authMiddleware, async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { showDeadline, archivizationTime, removeTime, sortMethod, sortDirection } = req.body

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

		await tasksSettings.save()

		return res.status(200).json(tasksSettings)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//Dodawanie użytkownika do dashboardu
app.post('/dashboards/:dashboardId/add-user', authMiddleware, async (req, res) => {
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
})

//Edytowanie dashboardu
app.patch('/dashboards/:dashboardId', authMiddleware, async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { name, creatorId, tasksArchiveTime, tasksRemoveTime } = req.body

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (name) dashboard.name = name
		if (creatorId) dashboard.creatorId = creatorId
		if (tasksArchiveTime) dashboard.tasksArchiveTime = tasksArchiveTime
		if (tasksRemoveTime) dashboard.tasksRemoveTime = tasksRemoveTime

		await dashboard.save()
		res.status(200).json({ message: 'Dashboard updated', dashboard })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//Usuwanie użytkownika z dashboardu
app.patch('/dashboards/:dashboardId/remove', authMiddleware, async (req, res) => {
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
})

//Dodawanie notatki
app.post('/dashboards/:dashboardId/add-note', authMiddleware, async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { title, content, category, tags, folder_id, is_favourite, expired_at } = req.body

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

		res.json(newNote)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//Pobieranie notatek dashboarda
app.get('/dashboards/:dashboardId/folders/notes/:folderId?', authMiddleware, async (req, res) => {
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
})

//Pobieranie konkretnej notatki
app.get('/notes/:noteId', authMiddleware, async (req, res) => {
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
})

//Aktualizacja notatki
app.patch('/notes/:noteId', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId

		const { noteId } = req.params
		const note = await Note.findById(noteId)

		if (!note) {
			return res.status(404).json({ message: 'Note not found' })
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

		return res.status(200).json({ message: 'Note updated successfully', note })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//Usuwanie notatek
app.delete('/dashboards/:dashboardId/notes/remove', authMiddleware, async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { id } = req.body

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (!dashboard.notesIds.includes(id)) {
			return res.status(400).json({ message: `Note not found in ${dashboard.name}` })
		}

		dashboard.notesIds = dashboard.notesIds.filter(noteId => !noteId.equals(id))

		await dashboard.save()

		await Note.deleteOne({ _id: id })

		return res.status(200).json({ message: 'Note removed successfully from dashboard' })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//Pobranie kategorii notatek dashboarda
app.get('/dashboards/:dashboardId/note-categories', authMiddleware, async (req, res) => {
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
})

//Dodawanie kategorii notatki
app.post('/notes/add-category', authMiddleware, async (req, res) => {
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
})

//pobranie folderów dashboardu
app.get('/dashboards/:dashboardId/folders', authMiddleware, async (req, res) => {
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
})

//Dodawanie folderu
app.post('/dashboards/:dashboardId/add-folder', authMiddleware, async (req, res) => {
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

		res.status(200).json({ message: 'Folder added successfully', folderId: folderId })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//delete folder
app.delete('/dashboards/:dashboardId/folders/:folderId', authMiddleware, async (req, res) => {
	try {
		const { dashboardId, folderId } = req.params

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (!dashboard.foldersIds.includes(folderId)) {
			return res.status(400).json({ message: `No folder in ${dashboard.name}` })
		}

		dashboard.foldersIds = dashboard.foldersIds.filter(fId => !fId.equals(folderId))

		await dashboard.save()

		await Folder.deleteOne({ _id: folderId })

		return res.status(200).json({ message: 'Folder removed successfully from dashboard' })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//update folder
app.patch('/folders/:folderId', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId

		const { folderId } = req.params
		const { name } = req.body

		const folder = await Folder.findById(folderId)

		if (!folder) {
			return res.status(404).json({ message: 'Folder not found' })
		}

		folder.name = name

		await folder.save()

		return res.status(200).json({ message: 'Folder updated', folder })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//Get tasks groups
app.get('/dashboards/:dashboardId/tasks-groups', authMiddleware, async (req, res) => {
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
			return res.status(200).json({ message: 'No task groups found' })
		}

		const todoGroups = await TaskGroup.find({ _id: { $in: todoGroupsIds } })

		res.status(200).json({ todoGroups })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//add task group
app.post('/dashboards/:dashboardId/add-todo-group', authMiddleware, async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { name } = req.body

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
		res.status(200).json(newGroup)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//update task group
app.patch('/dashboards/:dashboardId/tasks-groups', authMiddleware, async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { id, name } = req.body

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

		res.status(200).json(dashboard.todoGroupIds)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//remove task group
app.delete('/dashboards/:dashboardId/tasks-groups', authMiddleware, async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { id } = req.body

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

		res.status(200).json(dashboard.todoGroupIds)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//get tasks by groupId
app.get('/dashboards/:dashboardId/tasks/:groupId?', authMiddleware, async (req, res) => {
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
})

//add task
app.post('/dashboards/:dashboardId/add-task', authMiddleware, async (req, res) => {
	try {
		const { content, priority, groupId, expirationDate } = req.body

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

		res.status(201).json(task)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//update task
app.patch('/dashboards/:dashboardId/task/:id', authMiddleware, async (req, res) => {
	try {
		const { content, is_done, priority, expired_at, archived_at, removed_at } = req.body
		const { id } = req.params

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid task ID format' })
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

		res.status(200).json(task)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//delete task
app.delete('/dashboards/:dashboardId/task/:id', authMiddleware, async (req, res) => {
	try {
		const { id } = req.params

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid ID format' })
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

		res.status(204).send()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//get products
app.get('/dashboards/:dashboardId/products', authMiddleware, async (req, res) => {
	try {
		const { dashboardId } = req.params

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboardId' })
		}

		const dashboard = await Dashboard.findById(dashboardId).populate('productsIds')

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found for provided id' })
		}

		res.status(201).json(dashboard.productsIds)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//add product
app.post('/dashboards/:dashboardId/products', authMiddleware, async (req, res) => {
	try {
		const { dashboardId } = req.params

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboardId' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found for provided id' })
		}

		const { name, category, unit, price, tags, isFavourite } = req.body

		const product = await Product.create({ name, category, unit, price, tags, isFavourite })

		if (!product) {
			return res.status(500).json({ message: 'Cannot create product.' })
		}

		dashboard.productsIds.push(product._id)

		await dashboard.save()

		res.status(201).json(product)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//update product
app.patch('/dashboards/:dashboardId/products/:productId', authMiddleware, async (req, res) => {
	try {
		const { dashboardId, productId } = req.params

		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboardId' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found for provided id' })
		}

		const { name, category, unit, price, tags, isFavourite } = req.body

		const product = await Product.findById(productId)

		if (!product) {
			return res.status(404).json({ message: 'Product not found.' })
		}

		if (name) product.name = name
		if (category) product.category = category
		if (unit) product.unit = unit
		if (price) product.price = price
		if (tags) product.tags = tags
		if (isFavourite !== 'undefined') product.isFavourite = isFavourite

		await product.save()

		res.status(200).json(product)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

app.delete('/dashboards/:dashboardId/products/:id', authMiddleware, async (req, res) => {
	try {
		const { dashboardId, id } = req.params
		if (!dashboardId || !mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Missing or invalid dashboardId' })
		}

		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Missing or invalid Id' })
		}

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const product = await Product.findByIdAndDelete(id)
		if (!product) {
			return res.status(404).json({ message: 'Product not found' })
		}

		dashboard.productsIds = dashboard.productsIds.filter(p => p.toString() !== id)
		await dashboard.save()

		res.status(204).send()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
