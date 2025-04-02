export type ApiError = {
	message: string
	status?: number
}

export enum ScreenSize {
	XSMALL = 'extra-small', //576
	SMALL = 'small', //768
	MEDIUM = 'medium', //992
	LARGE = 'large', //1200
	XLARGE = 'extra-large', //1400
}

export type ScreenType = {
	type: ScreenSize
}

export type InputDynamicObject = {
	[key: string]: string
}

export type FetchResult<T> = {
	data: T | null
	error: ApiError | Error | null
	status: number | null
}

export interface FetchOptions extends RequestInit {
	headers?: Record<string, string>
}

export type FetchFunction<T> = () => Promise<T>

export type SortDirection = 'asc' | 'desc'
