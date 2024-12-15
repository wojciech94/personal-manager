import { useContext } from 'react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { CATEGORIES } from '../../constants/appConstants'
import { ModalContext } from '../../contexts/ModalContext'
import { FormRow } from '../FormRow/FormRow'

export function ModalAddProduct({ modalData }) {
	const [nameValue, setNameValue] = useState('')
	const [categoryValue, setCategoryValue] = useState('')
	const [unitValue, setUnitValue] = useState('')
	const [priceValue, setPriceValue] = useState('')
	const [tagsValue, setTagsValue] = useState('')
	const { dashboardId } = useParams()
	const [, setActiveModal] = useContext(ModalContext)

	const addProduct = async () => {
		const token = localStorage.getItem('token')
		if (!token) {
			console.error('No token found in localStorage')
		}

		const res = await fetch(`${API_URL}dashboards/${dashboardId}/products`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: nameValue,
				category: categoryValue,
				unit: unitValue,
				price: priceValue,
				tags: tagsValue,
			}),
		})
		if (res.ok) {
			const data = await res.json()
			if (data) {
				if (modalData?.action) {
					modalData.action()
				}
				setActiveModal(null)
			}
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
	}

	return (
		<>
			<div className='card-content d-flex flex-column gap-2'>
				<FormRow label='Product name' required>
					<input
						className='flex-1 max-w-200px'
						type='text'
						value={nameValue}
						onChange={e => setNameValue(e.target.value)}
					/>
				</FormRow>
				<FormRow label='Category'>
					<select
						className='flex-1 max-w-200px'
						name='categorySelect'
						id='categorySelect'
						value={categoryValue}
						onChange={e => setCategoryValue(e.target.value)}>
						{CATEGORIES.map((c, index) => (
							<option key={index} value={c.value}>
								{c.name}
							</option>
						))}
					</select>
				</FormRow>
				<FormRow label='Unit'>
					<input
						className='flex-1 max-w-200px'
						type='text'
						value={unitValue}
						onChange={e => setUnitValue(e.target.value)}
					/>
				</FormRow>
				<FormRow label='Price'>
					<input
						className='flex-1 max-w-200px'
						type='number'
						value={priceValue}
						onChange={e => setPriceValue(e.target.value)}
					/>
				</FormRow>
				<FormRow label='Tags'>
					<input
						className='flex-1 max-w-200px'
						type='text'
						value={tagsValue}
						onChange={e => setTagsValue(e.target.value)}
					/>
				</FormRow>
			</div>
			<div className='card-footer'>
				<button className='btn btn-success d-block w-100' onClick={addProduct}>
					Add product
				</button>
			</div>
		</>
	)
}
