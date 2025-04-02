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
			<div className='p-4 flex flex-col gap-2 border-t border-zinc-300'>
				<FormRow label={t('product_name')} required>
					<input
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						type='text'
						value={nameValue}
						onChange={e => setNameValue(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('category')}>
					<select
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						name='categorySelect'
						id='categorySelect'
						value={categoryValue}
						onChange={e => setCategoryValue(e.target.value)}>
						{CATEGORIES.map((c, index) => (
							<option className='text-gray-800 bg-white hover:bg-gray-100' key={index} value={c.value}>
								{t(c.value)}
							</option>
						))}
					</select>
				</FormRow>
				<FormRow label={t('unit')}>
					<input
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						type='text'
						value={unitValue}
						onChange={e => setUnitValue(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('price')}>
					<input
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						type='number'
						value={priceValue}
						onChange={e => setPriceValue(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('tags')}>
					<input
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						type='text'
						value={tagsValue}
						onChange={e => setTagsValue(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('is_favourite')}>
					<input
						type='checkbox'
						className='w-4 h-4 bg-gray-100 border-gray-300'
						checked={isFavouriteValue}
						onChange={e => setIsFavouriteValue(e.target.checked)}
					/>
				</FormRow>
			</div>
			<div className='py-4 px-6 border-t border-slate-300 bg-zinc-200 rounded-b-2xl'>
				<Button variant='success' className='w-full' onClick={addProduct}>
					{t('add_product')}
				</Button>
			</div>
		</>
	)
}
