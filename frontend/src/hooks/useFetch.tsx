import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ApiError, FetchFunction, FetchOptions, FetchResponse } from '../types/global'

export const useFetch = <T,>(urlOrFn: string | FetchFunction<T>, options: FetchOptions = {}): FetchResponse<T> => {
	const [data, setData] = useState<T | null>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<Error | ApiError | null>(null)
	const [status, setStatus] = useState<number | null>(null)
	const { accessToken } = useAuth()

	const fetchData = useCallback(async () => {
		setLoading(true)
		setError(null)
		setStatus(null)

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

				setStatus(response.status)

				if (!response.ok) {
					const ErrorMessage: ApiError = await response.json()
					setError(ErrorMessage)
					throw new Error(ErrorMessage.message)
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

	return { data, status, loading, error, refetch: fetchData }
}
