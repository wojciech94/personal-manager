const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { JWT_REFRESH_SECRET, JWT_SECRET } = process.env

exports.login = async (req, res) => {
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

		const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' })

		const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' })

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		res.status(200).json({ accessToken, name: user.name })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
}

exports.testlogin = async (req, res) => {
	try {
		const testUser = await User.findOne({ name: 'testowy' })
		if (!testUser) {
			return res.status(404).json({ message: 'User not found' })
		}

		const accessToken = jwt.sign({ userId: testUser._id }, JWT_SECRET, { expiresIn: '1h' })

		const refreshToken = jwt.sign({ userId: testUser._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' })

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		res.status(200).json({ accessToken, name: testUser.name })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
}

exports.register = async (req, res) => {
	try {
		const { name, password } = req.body

		const existingUser = await User.findOne({ name })
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' })
		}

		const newUser = new User({ name, password })
		await newUser.save()
		res.status(201).json({ message: 'User created successfully', user: newUser })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
}

exports.refresh = async (req, res) => {
	const refreshToken = req.cookies.refreshToken

	if (!refreshToken) {
		return res.status(403).json({ message: 'Refresh Token is required.' })
	}

	try {
		const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET)

		const user = await User.findById(decoded.userId)
		if (!user) {
			return res.status(403).json({ message: 'User not found.' })
		}

		const newAccessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' })

		res.json({ accessToken: newAccessToken })
	} catch (error) {
		console.error(error)
		return res.status(403).json({ message: 'Invalid Refresh Token.' })
	}
}
