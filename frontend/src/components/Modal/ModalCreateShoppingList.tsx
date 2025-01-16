import { useContext } from 'react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { ModalContext } from '../../contexts/ModalContext'
import { FormRow } from '../FormRow/FormRow'

export function ModalCreateShoppingList({ modalData }) {
	const [nameValue, setNameValue] = useState('')
	const { dashboardId } = useParams()
	const { setActiveModal } = useModalContext()

	const createShoppingList = async () => {
		const token = localStorage.getItem('token')
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/shopping-lists`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name: nameValue }),
		})
		if (!res.ok) {
			const errorData = await res.json()
			console.error(errorData.message)
		} else {
			setActiveModal(null)
			if (modalData?.action) {
				modalData.action()
			}
		}
	}

	return (
		<>
			<FormRow label='Name' className='mb-4'>
				<input type='text' value={nameValue} onChange={e => setNameValue(e.target.value)} />
			</FormRow>
			<div className='card-footer'>
				<button className='btn btn-success d-block w-100' onClick={createShoppingList}>
					Create shopping list
				</button>
			</div>
		</>
	)
}
