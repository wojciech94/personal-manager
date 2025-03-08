import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'

export function ModalCreateShoppingList({ modalData }: { modalData: DataProps }) {
	const [nameValue, setNameValue] = useState('')
	const { dashboardId } = useParams()
	const { setActiveModal } = useModalContext()
	const { accessToken } = useApi()

	const createShoppingList = async () => {
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/shopping-lists`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
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
			<div className='card-content'>
				<FormRow label='Name'>
					<input type='text' value={nameValue} onChange={e => setNameValue(e.target.value)} />
				</FormRow>
			</div>
			<div className='card-footer'>
				<Button variant='success' className='w-100' onClick={createShoppingList}>
					Create shopping list
				</Button>
			</div>
		</>
	)
}
