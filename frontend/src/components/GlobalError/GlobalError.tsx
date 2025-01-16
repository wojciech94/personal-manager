import { useRouteError } from 'react-router-dom'

export const GlobalError = () => {
	const error = useRouteError()

	if (error instanceof Response) {
		let errorData: { message?: string } = {}
		try {
			if (!error.bodyUsed) {
				const text = error.statusText || 'Unexpected error'
				errorData.message = text
			}
		} catch {
			errorData.message = 'An unexpected error occurred'
		}

		return (
			<div style={{ padding: '2rem', textAlign: 'center' }}>
				<h1>Error {error.status}</h1>
				<p>{errorData.message || 'An error occurred while processing your request.'}</p>
			</div>
		)
	}

	if (error instanceof Error) {
		return (
			<div style={{ padding: '2rem', textAlign: 'center' }}>
				<h1>Something went wrong</h1>
				<p>{error.message}</p>
			</div>
		)
	}

	return (
		<div style={{ padding: '2rem', textAlign: 'center' }}>
			<h1>An unexpected error occurred</h1>
		</div>
	)
}
