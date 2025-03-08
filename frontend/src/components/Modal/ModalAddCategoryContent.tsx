import { useState } from 'react'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'

export const ModalAddCategoryContent = () => {
	const [nameValue, setNameValue] = useState('')
	const { setActiveModal } = useModalContext()
	const { accessToken } = useApi()

	const addCategory = async () => {
		if (accessToken) {
			const res = await fetch(`${API_URL}notes/add-category`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name: nameValue }),
			})
			if (res.ok) {
				const data = await res.json()
				console.log('Note category added succesfully')
				setActiveModal(null)
			} else {
				const data = await res.json()
				console.error(`Server error: ${data.message}`)
				setNameValue('')
			}
		}
	}

	return (
		<>
			<div className='card-content'>
				<FormRow label='Category name'>
					<input type='text' value={nameValue} onChange={e => setNameValue(e.target.value)} />
				</FormRow>
			</div>
			<div className='card-footer'>
				<Button size='sm' variant='success' className='w-100' onClick={addCategory}>
					Add category
				</Button>
			</div>
		</>
	)
}
