export function getTokenExpiration(token) {
	const payloadBase64 = token.split('.')[1]
	const decodedPayload = JSON.parse(atob(payloadBase64))
	return decodedPayload.exp * 1000
}

export function debounce(fun, delay = 1000) {
	let timeout

	return function (...args) {
		clearTimeout(timeout)
		timeout = setTimeout(() => {
			fun(...args)
		}, delay)
	}
}
