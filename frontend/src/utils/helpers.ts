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
