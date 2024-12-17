const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

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

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

		res.status(200).json({ token })
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
