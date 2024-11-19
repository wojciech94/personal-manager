import { useContext } from 'react'
import { useState } from 'react'
import { ModalContext } from '../../contexts/ModalContext'

export const ModalAddCategoryContent = () => {
	const [nameValue, setNameValue] = useState('')
	const [, setActiveModal] = useContext(ModalContext)

	const addCategory = async () => {
		const token = localStorage.getItem('token')
		if (token) {
			const res = await fetch('http://localhost:5000/notes/add-category', {
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
		<div className='d-flex flex-column gap-2 p-4'>
			<input
				type='text'
				value={nameValue}
				placeholder='Type category name'
				onChange={e => setNameValue(e.target.value)}
			/>
			<button className='btn btn-success' onClick={addCategory}>
				Add category
			</button>
		</div>
	)
}
