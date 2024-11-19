require('dotenv').config() // Wczytaj zmienne środowiskowe z pliku .env
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

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const dbUrl = process.env.DB_URL // Użycie zmiennej środowiskowej

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
	const { name, password } = req.body

	try {
		// Sprawdź, czy użytkownik istnieje
		const user = await User.findOne({ name })
		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' })
		}

		// Porównaj hasło
		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' })
		}

		// Utwórz token JWT
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

		// Zwróć token
		res.status(200).json({ token })
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

app.get('/users', async (req, res) => {
	try {
		const users = await User.find()
		res.status(200).json(users)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

app.get('/protected', authMiddleware, (req, res) => {
	res.json({ message: 'This is a protected route', user: req.user })
})

app.get('/dashboards', async (req, res) => {
	try {
		const token = req.headers.authorization?.split(' ')[1]
		console.log('Token received:', token) // Logowanie tokenu

		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const userId = decoded.userId

		console.log('Decoded userId:', userId) // Logowanie userId

		const dashboards = await Dashboard.find({ userIds: userId })
		console.log('Dashboards found:', dashboards) // Logowanie znalezionych dashboardów
		res.status(200).json(dashboards)
	} catch (error) {
		console.error(error)
		if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}
		res.status(500).json({ message: error.message })
	}
})

app.post('/dashboards', async (req, res) => {
	try {
		const token = req.headers.authorization?.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		let userId
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET)
			userId = decoded.userId
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

		const { name } = req.body
		if (!name) {
			return res.status(400).json({ message: 'Dashboard name is required' })
		}

		const newDashboard = new Dashboard({
			name,
			creatorId: userId,
			userIds: [userId],
			notesIds: [],
		})

		await newDashboard.save()
		res.status(201).json(newDashboard)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

app.get('/dashboards/:dashboardId', async (req, res) => {
	try {
		const token = req.headers.authorization?.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		let userId
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET)
			userId = decoded.userId
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

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

//Dodawanie użytkownika do dashboardu
app.post('/dashboards/:dashboardId/add-user', async (req, res) => {
	try {
		const authHeader = req.headers.authorization
		if (!authHeader) {
			return res.status(401).json({ message: 'No token provided' })
		}

		const token = authHeader.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		try {
			jwt.verify(token, process.env.JWT_SECRET)
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

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

//Usuwanie użytkownika z dashboardu
app.patch('/dashboards/:dashboardId/remove', async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { id } = req.body
		const token = req.headers.authorization.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const userId = new mongoose.Types.ObjectId(decoded.userId)

		if (!userId) {
			return res.status(401).json({ message: 'Token validation failed' })
		}

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

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
app.post('/dashboards/:dashboardId/add-note', async (req, res) => {
	try {
		const authHeader = req.headers.authorization
		if (!authHeader) {
			return res.status(401).json({ message: 'No token provided' })
		}

		const token = authHeader.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		try {
			jwt.verify(token, process.env.JWT_SECRET)
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

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
app.get('/dashboards/:dashboardId/folders/notes/:folderId?', async (req, res) => {
	try {
		const token = req.headers.authorization?.split(' ')[1]

		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		try {
			jwt.verify(token, process.env.JWT_SECRET)
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

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
app.get('/notes/:noteId', async (req, res) => {
	try {
		const authHeader = req.headers.authorization
		if (!authHeader) {
			return res.status(401).json({ message: 'No token provided' })
		}

		const token = authHeader.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		try {
			jwt.verify(token, process.env.JWT_SECRET)
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

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
app.patch('/notes/:noteId', async (req, res) => {
	try {
		const authHeader = req.headers.authorization
		if (!authHeader) {
			return res.status(401).json({ message: 'No token provided' })
		}

		const token = authHeader.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		let userId
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET)
			userId = decoded.userId
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

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
app.delete('/dashboards/:dashboardId/notes/remove', async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { id } = req.body

		console.log(id)

		const token = req.headers.authorization.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const userId = new mongoose.Types.ObjectId(decoded.userId)

		if (!userId) {
			return res.status(401).json({ message: 'Token validation failed' })
		}

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

app.get('/dashboards/:dashboardId/note-categories', async (req, res) => {
	const token = req.headers.authorization?.split(' ')[1]

	if (!token) {
		return res.status(401).json({ message: 'No token provided' })
	}

	try {
		jwt.verify(token, process.env.JWT_SECRET)
	} catch (error) {
		return res.status(401).json({ message: 'Invalid or expired token' })
	}

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
app.post('/notes/add-category', async (req, res) => {
	try {
		const authHeader = req.headers.authorization
		if (!authHeader) {
			return res.status(401).json({ message: 'No token provided' })
		}

		const token = authHeader.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		let userId
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET)
			userId = decoded.userId
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

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

app.get('/dashboards/:dashboardId/folders', async (req, res) => {
	const token = req.headers.authorization?.split(' ')[1]

	if (!token) {
		return res.status(401).json({ message: 'No token provided' })
	}

	try {
		jwt.verify(token, process.env.JWT_SECRET)
	} catch (error) {
		return res.status(401).json({ message: 'Invalid or expired token' })
	}

	const { dashboardId } = req.params

	// Najpierw sprawdzamy, czy dashboardId jest poprawne
	if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
		return res.status(400).json({ message: 'Invalid dashboard ID format' })
	}

	// Wyszukiwanie dashboardu w bazie danych
	const dashboard = await Dashboard.findById(dashboardId).populate('userIds')

	if (!dashboard) {
		return res.status(404).json({ message: 'Dashboard not found' })
	}

	// Pobieranie listy folderów
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
app.post('/dashboards/:dashboardId/add-folder', async (req, res) => {
	try {
		const authHeader = req.headers.authorization
		if (!authHeader) {
			return res.status(401).json({ message: 'No token provided' })
		}

		const token = authHeader.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		let userId
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET)
			userId = decoded.userId
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

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

app.delete('/dashboards/:dashboardId/folders/:folderId', async (req, res) => {
	try {
		const { dashboardId, folderId } = req.params

		const token = req.headers.authorization.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		try {
			jwt.verify(token, process.env.JWT_SECRET)
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

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

app.patch('/folders/:folderId', async (req, res) => {
	try {
		const authHeader = req.headers.authorization
		if (!authHeader) {
			return res.status(401).json({ message: 'No token provided' })
		}

		const token = authHeader.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		let userId
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET)
			userId = decoded.userId
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

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

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
