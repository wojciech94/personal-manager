import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ApiError } from '../main'

type FetchResponse<T> = {
	data: T | null
	loading: boolean
	error: ApiError | null
	refetch: () => void
}

interface FetchOptions extends RequestInit {
	headers?: Record<string, string>
}

type FetchFunction<T> = () => Promise<T>

export const useFetch = <T,>(urlOrFn: string | FetchFunction<T>, options: FetchOptions = {}): FetchResponse<T> => {
	const [data, setData] = useState<T | null>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<Error | null>(null)
	const { accessToken } = useAuth()

	const fetchData = useCallback(async () => {
		setLoading(true)
		setError(null)

		try {
			let responseData: T

			const defaultHeaders: Record<string, string> = accessToken ? { Authorization: `Bearer ${accessToken}` } : {}

			if (typeof urlOrFn === 'function') {
				responseData = await urlOrFn()
			} else {
				const response = await fetch(urlOrFn, {
					...options,
					headers: {
						...defaultHeaders,
						...options.headers,
					},
				})

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`)
				}
				responseData = await response.json()
			}

			setData(responseData)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Unknown error'))
		} finally {
			setLoading(false)
		}
	}, [urlOrFn, options, accessToken])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	return { data, loading, error, refetch: fetchData }
}
