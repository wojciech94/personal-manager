const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env

const authMiddleware = (req, res, next) => {
	const token = req.headers['authorization']?.split(' ')[1] // pobranie tokena z nagłówka

	if (!token) {
		return res.status(401).json({ message: 'Access denied. No token provided.' })
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET)
		req.user = decoded // zapisujemy dane użytkownika w obiekcie request
		next() // przechodzimy do następnego middleware lub trasy
	} catch (error) {
		res.status(400).json({ message: 'Invalid token.' })
	}
}

module.exports = authMiddleware
