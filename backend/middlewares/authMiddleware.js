const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env

const authMiddleware = (req, res, next) => {
	const token = req.headers['authorization']?.split(' ')[1]

	if (!token) {
		return res.status(401).json({ message: 'Access denied. No token provided.' })
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET)
		req.user = decoded
		next()
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Token expired. Please refresh your token.' })
		}
		return res.status(400).json({ message: 'Invalid token.' })
	}
}

module.exports = authMiddleware
