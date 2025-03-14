import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { CATEGORIES } from '../../constants/appConstants'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Product } from '../../screens/Shopping/types'
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
	const { fetchData } = useApi()
	const { t } = useTranslation()

	const addProduct = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/products`
		const options = {
			method: 'POST',
			headers: {
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
		}

		const response = await fetchData<Product>(url, options)

		if (response.error) {
			console.error('Failed to add product:', response.status, response.error)
			return
		}

		if (response.data) {
			const data = response.data
			if (modalData?.action && modalData.action.length === 0) {
				const action = modalData.action as () => Promise<void>
				action()
			} else {
				console.error('Unexpected function type: arugments not passed')
			}
			setActiveModal(null)
		}
	}

	return (
		<>
			<div className='card-content d-flex flex-column gap-2'>
				<FormRow label={t('product_name')} required>
					<input
						className='flex-1 max-w-200px'
						type='text'
						value={nameValue}
						onChange={e => setNameValue(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('category')}>
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
				<FormRow label={t('unit')}>
					<input
						className='flex-1 max-w-200px'
						type='text'
						value={unitValue}
						onChange={e => setUnitValue(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('price')}>
					<input
						className='flex-1 max-w-200px'
						type='number'
						value={priceValue}
						onChange={e => setPriceValue(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('tags')}>
					<input
						className='flex-1 max-w-200px'
						type='text'
						value={tagsValue}
						onChange={e => setTagsValue(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('is_favourite')}>
					<input type='checkbox' checked={isFavouriteValue} onChange={e => setIsFavouriteValue(e.target.checked)} />
				</FormRow>
			</div>
			<div className='card-footer'>
				<Button variant='success' className='w-100' onClick={addProduct}>
					{t('add_product')}
				</Button>
			</div>
		</>
	)
}
