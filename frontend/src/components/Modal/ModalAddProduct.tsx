import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { CATEGORIES } from '../../constants/appConstants'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'

export function ModalAddProduct({ modalData }: { modalData: DataProps }) {
	const [nameValue, setNameValue] = useState('')
	const [categoryValue, setCategoryValue] = useState('other')
	const [unitValue, setUnitValue] = useState('')
	const [priceValue, setPriceValue] = useState('')
	const [tagsValue, setTagsValue] = useState('')
	const [isFavouriteValue, setIsFavouriteValue] = useState(false)
	const { dashboardId } = useParams()
	const { setActiveModal } = useModalContext()
	const { accessToken } = useApi()
	const { t } = useTranslation()

	const addProduct = async () => {
		if (!accessToken) {
			console.error('No token found in localStorage')
		}

		const res = await fetch(`${API_URL}dashboards/${dashboardId}/products`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: nameValue,
				category: categoryValue,
				unit: unitValue,
				price: priceValue,
				tags: tagsValue,
				isFavourite: isFavouriteValue,
			}),
		})
		if (res.ok) {
			const data = await res.json()
			if (data) {
				if (modalData?.action && modalData.action.length === 0) {
					const action = modalData.action as () => Promise<void>
					action()
				} else {
					console.error('Unexpected function type: arugments not passed')
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
								{t(c.value)}
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
				<FormRow label='Is favourite'>
					<input type='checkbox' checked={isFavouriteValue} onChange={e => setIsFavouriteValue(e.target.checked)} />
				</FormRow>
			</div>
			<div className='card-footer'>
				<Button variant='success' className='w-100' onClick={addProduct}>
					Add product
				</Button>
			</div>
		</>
	)
}
