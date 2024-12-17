require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const userRoutes = require('./routes/userRoutes')
const noteRoutes = require('./routes/noteRoutes')
const folderRoutes = require('./routes/folderRoutes')
const tasksGroupRoutes = require('./routes/tasksGroupRoutes')
const taskRoutes = require('./routes/taskRoutes')
const productRoutes = require('./routes/productRoutes')

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

app.use('/auth', authRoutes)
app.use('/dashboards', dashboardRoutes)
app.use('/', userRoutes)
app.use('/', noteRoutes)
app.use('/', folderRoutes)
app.use('/', tasksGroupRoutes)
app.use('/', taskRoutes)
app.use('/', productRoutes)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
