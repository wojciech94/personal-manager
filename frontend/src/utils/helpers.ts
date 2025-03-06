import { ApiError, FetchResult } from './../types/global'
import { FetchFunction, FetchOptions, ScreenSize } from '../types/global'

export function getTokenExpiration(token: string) {
	const payloadBase64 = token.split('.')[1]
	const decodedPayload = JSON.parse(atob(payloadBase64))
	return decodedPayload.exp * 1000
}

export function debounce<T extends unknown[]>(fun: (...args: T) => void, delay = 1000) {
	let timeout: number

	return function (...args: T) {
		clearTimeout(timeout)
		timeout = setTimeout(() => {
			fun(...args)
		}, delay)
	}
}

export function getLocaleDateTime(date: string) {
	const newDate = new Date(date)
	const hours = newDate.getHours().toString().padStart(2, '0')
	const minutes = newDate.getMinutes().toString().padStart(2, '0')
	const dateTime = `${newDate.toLocaleDateString()} ${hours}:${minutes}`
	return dateTime
}

export function getScreenType() {
	const width = window.innerWidth
	if (width > 1200) return ScreenSize.XLARGE
	if (width > 992) return ScreenSize.LARGE
	if (width > 768) return ScreenSize.MEDIUM
	if (width > 576) return ScreenSize.SMALL

	return ScreenSize.XSMALL
}

export async function fetchData<T>(
	accessToken: string,
	urlOrFn: string | FetchFunction<T>,
	options: FetchOptions = {}
): Promise<FetchResult<T>> {
	try {
		let responseData: T
		let responseStatus: number
		let responseError: ApiError | null = null

		const defaultHeaders: Record<string, string> = accessToken ? { Authorization: `Bearer ${accessToken}` } : {}

		if (typeof urlOrFn === 'function') {
			responseData = await urlOrFn()
			return { data: responseData, error: null, status: null }
		} else {
			const response = await fetch(urlOrFn, {
				...options,
				headers: {
					...defaultHeaders,
					...options.headers,
				},
			})

			responseStatus = response.status

			if (!response.ok) {
				responseError = await response.json()
				const error = new Error(responseError?.message || 'Undefined error')
				;(error as any).status = responseStatus
				throw error
			}
			responseData = await response.json()
			return { data: responseData, error: null, status: responseStatus }
		}
	} catch (error) {
		const errorObj = error instanceof Error ? error : new Error('Undefined error')
		return {
			data: null,
			error: errorObj,
			status: error instanceof Error && 'status' in error ? (error as ApiError).status ?? null : null,
		}
	}
}
