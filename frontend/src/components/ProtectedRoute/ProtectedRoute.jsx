import { Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

export const ProtectedRoute = ({ children }) => {
	const token = localStorage.getItem('token')

	if (!token) {
		return <Navigate to='/login' /> // Przekierowanie do logowania
	}

	try {
		const decodedToken = jwtDecode(token)
		const currentTime = Date.now() / 1000
		if (decodedToken.exp < currentTime) {
			localStorage.removeItem('token')
			return <Navigate to='/login' />
		}
	} catch (error) {
		console.error('Error decoding token:', error)
		return <Navigate to='/login' />
	}

	return children // Renderuj dzieci, jeśli jest token
}
