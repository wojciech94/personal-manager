import { useState } from 'react'
import {API_URL} from '../../config'

export const DashboardRow = ({ dashboard, fetchUserDashboards }) => {
	const [showInput, setShowInput] = useState(false)
	const [inputValue, setInputValue] = useState('')

	const handleSubmit = async () => {
		try {
			const token = localStorage.getItem('token')
			const response = await fetch(`${API_URL}dashboards/${dashboard._id}/add-user`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ name: inputValue }),
			})

			if (response.ok) {
				console.log(`User ${inputValue} added to dashboard ${dashboard.name}`)
				setShowInput(false)
				setInputValue('')
			} else {
				const errorData = await response.json()
				console.error(`Failed to add user: ${errorData.message}`)
			}
		} catch (error) {
			console.error('Error adding user', error)
		}
	}

	const handleRemove = async () => {
		try {
			const token = localStorage.getItem('token')
			const response = await fetch(`${API_URL}dashboards/${dashboard._id}/remove`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			})
			if (response.ok) {
				console.log('Access removed succesfully')
				fetchUserDashboards()
			} else {
				const errorData = await response.json()
				console.error(errorData.message)
			}
		} catch (error) {
			console.error('Failed to remove access:', error)
		}
	}

	return (
		<>
			<div className='d-flex gap-2 justify-between'>
				<div>{dashboard.name}</div>
				<div>
					{!showInput && <button onClick={() => setShowInput(true)}>+</button>}
					<button onClick={handleRemove}>-</button>
				</div>
			</div>
			{showInput && (
				<>
					<input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder='Type user name'></input>
					<button onClick={handleSubmit}>Add user</button>
				</>
			)}
		</>
	)
}
