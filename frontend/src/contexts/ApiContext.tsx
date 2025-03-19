import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import { JsonAnimation } from '../components/JsonAnimation/JsonAnimation'
import { API_URL } from '../config'
import { FetchOptions, FetchResult } from '../types/global'
import { getTokenExpiration } from '../utils/helpers'
import loadingAnimation from '../assets/mainloading.json'

interface ApiContextType {
	accessToken: string | null
	login: (token: string) => void
	logout: () => void
	refreshToken: () => Promise<void>
	fetchData: <T>(url: string, options?: FetchOptions) => Promise<FetchResult<T>>
	isRefreshing: boolean
}

interface ApiProviderProps {
	children: ReactNode
}

interface FetchError extends Error {
	status?: number
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
	const [accessToken, setAccessToken] = useState<string | null>(null)
	const [isRefreshing, setIsRefreshing] = useState(true)

	useEffect(() => {
		let tokenTimeout: number | undefined

		const checkToken = async () => {
			if (accessToken) {
				setIsRefreshing(false)
				const remainingTime = getTokenExpiration(accessToken) - new Date().getTime()
				if (remainingTime < 60 * 1000) {
					await refreshToken().catch(error => {
						console.error('Failed to refresh token in checkToken:', error)
						logout()
					})
				} else {
					tokenTimeout = window.setTimeout(() => {
						checkToken()
					}, remainingTime - 60 * 1000)
					console.log(`Token expires in ${Math.floor(remainingTime / 60000)} min`)
				}
			} else {
				refreshToken().catch(() => {
					console.log('No valid token or refresh failed')
				})
			}
		}

		checkToken()

		return () => {
			if (tokenTimeout !== undefined) clearTimeout(tokenTimeout)
		}
	}, [accessToken])

	const login = (token: string) => {
		setAccessToken(token)
		setIsRefreshing(false)
	}

	const logout = async () => {
		const url = `${API_URL}auth/logout`
		const options = {
			method: 'POST',
			credentials: 'include' as const,
		}

		const response = await fetchData(url, options)

		if (response.error) {
			console.error('Failed to logout', response.status, response.error)
			return
		}

		setAccessToken(null)
		sessionStorage.removeItem('name')
	}

	const refreshToken = async () => {
		setIsRefreshing(true)
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
			if (data.name) {
				sessionStorage.setItem('name', data.name)
			}
			return data.accessToken
		} catch (error) {
			console.error('Error refreshing token:', error)
			logout()
		} finally {
			setIsRefreshing(false)
		}
	}

	async function fetchData<T>(url: string, options: FetchOptions = {}): Promise<FetchResult<T>> {
		try {
			const headers: Record<string, string> = accessToken ? { Authorization: `Bearer ${accessToken}` } : {}

			const response = await fetch(url, {
				...options,
				headers: { ...headers, ...options.headers },
			})

			if (response.status === 204) {
				const defaultData = Array.isArray([] as unknown as T) ? [] : null
				return { data: defaultData as unknown as T, error: null, status: 204 }
			}

			if (response.status === 401) {
				const newToken = await refreshToken()
				const retryResponse = await fetch(url, {
					...options,
					headers: { ...headers, ...options.headers, Authorization: `Bearer ${newToken}` },
				})

				if (!retryResponse.ok) {
					const responseError = await retryResponse.json()
					const error: FetchError = new Error(responseError?.message || 'Undefined error after token refresh')
					error.status = retryResponse.status
					throw error
				}

				const data = await retryResponse.json()
				return { data, error: null, status: retryResponse.status }
			}

			if (!response.ok) {
				const responseError = await response.json()
				const error: FetchError = new Error(responseError?.message || 'Undefined error')
				error.status = response.status
				throw error
			}

			const data = await response.json()
			return { data, error: null, status: response.status }
		} catch (error) {
			const errorObj: FetchError = error instanceof Error ? error : new Error('Undefined error')
			return {
				data: null,
				error: errorObj,
				status: errorObj.status || null,
			}
		}
	}

	if (isRefreshing) {
		return <JsonAnimation data={loadingAnimation} />
	}

	return (
		<ApiContext.Provider value={{ accessToken, login, logout, refreshToken, fetchData, isRefreshing }}>
			{children}
		</ApiContext.Provider>
	)
}

export const useApi = (): ApiContextType => {
	const context = useContext(ApiContext)
	if (!context) {
		throw new Error('useApi must be used within an AuthProvider')
	}
	return context
}
