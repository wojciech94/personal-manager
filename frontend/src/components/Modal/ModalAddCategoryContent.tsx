import { useContext, useState } from 'react'
import { API_URL } from '../../config'
import { ModalContext } from '../../contexts/ModalContext'
import { FormRow } from '../FormRow/FormRow'

export const ModalAddCategoryContent = () => {
	const [nameValue, setNameValue] = useState('')
	const [, setActiveModal] = useContext(ModalContext)

	const addCategory = async () => {
		const token = localStorage.getItem('token')
		if (token) {
			const res = await fetch(`${API_URL}notes/add-category`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
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
				<button className='btn btn-success d-block w-100' onClick={addCategory}>
					Add category
				</button>
			</div>
		</>
	)
}
