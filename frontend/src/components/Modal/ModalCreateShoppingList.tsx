import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useModalContext } from '../../contexts/ModalContext'
import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'

export function ModalCreateShoppingList({ modalData }: { modalData: DataProps }) {
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
			if (modalData.action && typeof modalData.action === 'function' && modalData.action.length === 0) {
				const action = modalData.action as () => Promise<void>
				action()
				setActiveModal(null)
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
