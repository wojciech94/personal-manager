import React, { useState } from 'react'
import { Check, Edit, Star, Trash2 } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { CATEGORIES } from '../../constants/appConstants'
import { useApi } from '../../contexts/ApiContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { UpdateProduct } from '../../screens/Shopping/ProductsList'
import { Product } from '../../screens/Shopping/types'
import { Button } from '../Button/Button'
import { TranslationKey } from '../../translations'

export const ProductListItem = ({
	product,
	productsData,
	setProductsData,
	fetchProducts,
}: {
	product: Product
	productsData: Product[]
	setProductsData: React.Dispatch<React.SetStateAction<Product[]>>
	fetchProducts: () => Promise<void>
}) => {
	const [editedProduct, setEditedProduct] = useState('')
	const [nameValue, setNameValue] = useState('')
	const [categoryValue, setCategoryValue] = useState<TranslationKey>('other')
	const [unitValue, setUnitValue] = useState('')
	const [priceValue, setPriceValue] = useState('0')
	const [tagsValue, setTagsValue] = useState('')
	const { fetchData } = useApi()
	const { dashboardId } = useParams()
	const productData = { name: nameValue, category: categoryValue, unit: unitValue, price: priceValue, tags: tagsValue }
	const { t } = useTranslation()

	const handleEditProduct = (id: string) => {
		if (productsData && productsData.length > 0) {
			const product = productsData.find(p => p._id === id)
			if (!product) {
				console.error('Product not found')
				return
			}
			setEditedProduct(id)
			setNameValue(product.name)
			setCategoryValue(product.category as TranslationKey)
			setUnitValue(product.unit)
			setPriceValue(product.price)
			setTagsValue(product.tags)
		} else {
			console.error('Empty products list')
		}
	}

	const handleUpdate = async (id: string, data: UpdateProduct | { isFavourite: boolean }) => {
		const url = `${API_URL}dashboards/${dashboardId}/products/${id}`
		const options = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		}

		const response = await fetchData<Product>(url, options)

		if (response.error) {
			console.error('Faileds to update product:', response.status, response.error)
		}

		if (response.data) {
			const data = response.data
			setProductsData((prevData: Product[]) =>
				prevData.map((p: Product) => {
					if (p._id === id) {
						return data
					}
					return p
				})
			)
		}

		setEditedProduct('')
	}

	const handleDelete = async (id: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/products/${id}`
		const options = {
			method: 'DELETE',
		}

		const response = await fetchData<Product>(url, options)

		if (response.error) {
			console.error('Failed to delete product:', response.status, response.error)
			return
		}

		if (response.data) {
			fetchProducts()
		}
	}

	return (
		<tr key={product._id} className='even:bg-zinc-100 border-collapse border-b'>
			<td>
				<Button variant='text' onClick={() => handleUpdate(product._id, { isFavourite: !product.isFavourite })}>
					<Star size={20} color={product.isFavourite ? 'gold' : 'gray'} />
				</Button>
			</td>
			{product._id === editedProduct ? (
				<>
					<td>
						<input
							type='text'
							value={nameValue}
							placeholder={t('type_name')}
							onChange={e => setNameValue(e.target.value)}
						/>
					</td>
					<td>
						<select
							name='categorySelect'
							id='categorySelect'
							value={categoryValue}
							onChange={e => setCategoryValue(e.target.value as TranslationKey)}>
							{CATEGORIES.map(c => (
								<option key={c.value} value={c.value}>
									{t(c.value)}
								</option>
							))}
						</select>
					</td>
					<td>
						<input
							type='text'
							value={unitValue}
							placeholder={t('type_name')}
							onChange={e => setUnitValue(e.target.value)}
						/>
					</td>
					<td>
						<input
							type='number'
							value={priceValue}
							placeholder={t('type_price')}
							onChange={e => setPriceValue(e.target.value)}
						/>
					</td>
					<td>
						<input
							type='text'
							value={tagsValue}
							placeholder={t('type_tags')}
							onChange={e => setTagsValue(e.target.value)}
						/>
					</td>
				</>
			) : (
				<>
					<td>{product.name}</td>
					<td>{t(product.category as TranslationKey)}</td>
					<td>{product.unit}</td>
					<td>{product.price}</td>
					<td className='hidden sm:table-cell'>{product.tags}</td>
				</>
			)}
			<td>
				<div className='flex gap-1'>
					{product._id === editedProduct ? (
						<Button onlyIcon={true} variant='success' onClick={() => handleUpdate(product._id, productData)}>
							<Check size={16} />
						</Button>
					) : (
						<Button onlyIcon={true} onClick={() => handleEditProduct(product._id)}>
							<Edit size={16} />
						</Button>
					)}
					<Button onlyIcon={true} variant='danger' onClick={() => handleDelete(product._id)}>
						<Trash2 size={16} />
					</Button>
				</div>
			</td>
		</tr>
	)
}
