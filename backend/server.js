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
		const token = req.headers.authorization.split(' ')[1] // Pobierz token z nagłówka
		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

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

				try {
					jwt.verify(token, process.env.JWT_SECRET)
				} catch (error) {
					return res.status(401).json({ message: 'Invalid or expired token' })
				}

				const user = await User.findOne({ name: name })
				if (!user) {
					return res.status(404).json({ message: 'User not found' })
				}

				const name = req.body

				if (!name) {
					return res.status(404).json({ message: 'No category name provided' })
				}

				const existingCategory = await NoteCategory.findOne({ name: name })
				let newNoteCategory
				if (!existingCategory) {
					newNoteCategory = await NoteCategory.create({ name })
				}

				const noteCategoryId = existingCategory ? existingCategory._id : newNoteCategory._id
				user.note_categories.push(noteCategoryId)
			} catch (error) {
				res.status(500).json({ message: error.message })
			}
		})

		const { name } = req.body // Oczekuj, że nazwa będzie w body requestu
		const newDashboard = new Dashboard({
			name,
			creatorId: userId,
			userIds: [userId], // Użyj ID użytkownika, który jest już zalogowany
			notesIds: [],
		})

		await newDashboard.save()
		res.status(201).json(newDashboard)
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

		const initialLength = dashboard.userIds.length
		dashboard.userIds = dashboard.userIds.filter(id => !id.equals(userId))

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
		const { title, content, category, tags, is_favourite, expired_at } = req.body

		if (!title || !content) {
			return res.status(400).json({ message: 'Title and content are required.' })
		}

		const dashboard = await Dashboard.findById(dashboardId)
		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const newNote = await Note.create({ title, content, category, tags, is_favourite, expired_at })

		dashboard.notesIds.push(newNote._id)
		await dashboard.save()

		res.json(newNote)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//Pobieranie notatek dashboarda
app.get('/dashboards/:dashboardId/notes', async (req, res) => {
	try {
		const token = req.headers.authorization?.split(' ')[1]
		console.log('Token received:', token) // Logowanie tokenu

		if (!token) {
			return res.status(401).json({ message: 'No token provided' })
		}

		// Weryfikacja tokenu
		try {
			jwt.verify(token, process.env.JWT_SECRET)
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

		const { dashboardId } = req.params

		// Znajdź dashboard po ID
		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		// Pobierz notatki na podstawie ID zapisanych w dashboardzie
		const notes = await Note.find({ _id: { $in: dashboard.notesIds } })

		// Zwróć notatki jako odpowiedź
		res.json(notes)
	} catch (error) {
		console.error(error)
		if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}
		res.status(500).json({ message: error.message })
	}
})

app.get('/dashboards/:dashboardId/note-categories', async (req, res) => {
	const token = req.headers.authorization?.split(' ')[1]
	console.log('Token received:', token) // Logowanie tokenu

	if (!token) {
		return res.status(401).json({ message: 'No token provided' })
	}

	// Weryfikacja tokenu
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

	// Wyciągnij nazwy kategorii
	const categoryNames = noteCategories.map(category => category.name)

	// Zwróć nazwy kategorii notatek
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
			userId = decoded.userId // Zakładamy, że `userId` jest w payloadzie tokena
		} catch (error) {
			return res.status(401).json({ message: 'Invalid or expired token' })
		}

		// Znajdowanie użytkownika na podstawie ID z tokena
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

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
