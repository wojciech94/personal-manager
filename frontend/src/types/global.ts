export type ApiError = {
	message: string
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

export type FetchResponse<T> = {
	data: T | null
	status: number | null
	loading: boolean
	error: ApiError | null
	refetch: () => void
}

export interface FetchOptions extends RequestInit {
	headers?: Record<string, string>
}

export type FetchFunction<T> = () => Promise<T>
