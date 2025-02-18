import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import { API_URL } from '../config'

interface AuthContextType {
	accessToken: string | null
	login: (token: string) => void
	logout: () => void
	refreshToken: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
	children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [accessToken, setAccessToken] = useState<string | null>(null)

	const login = (token: string) => {
		setAccessToken(token)
	}

	const logout = () => {
		setAccessToken(null)
		sessionStorage.removeItem('name')
	}

	const refreshToken = async () => {
		try {
			const response = await fetch(`${API_URL}auth/refresh`, {
				method: 'POST',
				credentials: 'include',
			})

			if (!response.ok) {
				throw new Error('Failed to refresh token')
			}

			const data = await response.json()
			setAccessToken(data.accessToken)
		} catch (error) {
			console.error('Error refreshing token:', error)
			logout()
		}
	}

	useEffect(() => {
		if (!accessToken) {
			refreshToken()
		}
	}, [accessToken])

	return <AuthContext.Provider value={{ accessToken, login, logout, refreshToken }}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
