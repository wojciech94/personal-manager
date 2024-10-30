import { useEffect, useState } from 'react'

export const ProtectedData = () => {
	const [data, setData] = useState(null)
	const [error, setError] = useState(null)

	useEffect(() => {
		// Funkcja do pobierania danych z chronionej trasy
		const fetchData = async () => {
			try {
				const response = await fetch('http://localhost:5000/protected', {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`, // Zdobądź token z localStorage
					},
				})

				if (!response.ok) {
					throw new Error('Network response was not ok')
				}

				const result = await response.json()
				setData(result)
			} catch (error) {
				setError(error.message)
			}
		}

		fetchData()
	}, []) // Pusty array dependencies - wywoła tylko raz po zamontowaniu
	if (error) {
		return <div>Error: {error}</div>
	}

	return (
		<div>
			<h1>Protected Data</h1>
			{data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
		</div>
	)
}
