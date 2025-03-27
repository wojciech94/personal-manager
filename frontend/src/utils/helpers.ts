import { ButtonSize } from '../components/Button/types'
import { ScreenSize } from '../types/global'

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

export function getScreenType() {
	const width = window.innerWidth
	if (width > 1200) return ScreenSize.XLARGE
	if (width > 992) return ScreenSize.LARGE
	if (width > 768) return ScreenSize.MEDIUM
	if (width > 576) return ScreenSize.SMALL

	return ScreenSize.XSMALL
}

export function BtnSize2PaddingClass(size: ButtonSize) {
	switch (size) {
		case 'xs':
			return 'p-1'
		case 'sm':
			return 'p-2'
		case 'md':
			return 'px-4 py-2'
		case 'lg':
			return 'px-6 py-3'
		case 'xl':
			return 'px-8 py-4'
		default:
			return 'p-2'
	}
}
