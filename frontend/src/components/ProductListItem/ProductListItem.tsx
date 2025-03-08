import { useState } from 'react'
import { Check, Edit, Star, Trash2 } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { CATEGORIES } from '../../constants/appConstants'
import { useApi } from '../../contexts/ApiContext'
import { Product } from '../../screens/Shopping/Products'
import { UpdateProduct } from '../../screens/Shopping/ProductsList'
import { Button } from '../Button/Button'

export const ProductListItem = ({
	product,
	productsData,
	setProductsData,
}: {
	product: Product
	productsData: Product[]
	setProductsData: React.Dispatch<React.SetStateAction<Product[]>>
}) => {
	const [editedProduct, setEditedProduct] = useState('')
	const [nameValue, setNameValue] = useState('')
	const [categoryValue, setCategoryValue] = useState('')
	const [unitValue, setUnitValue] = useState('')
	const [priceValue, setPriceValue] = useState(0)
	const [tagsValue, setTagsValue] = useState('')
	const { accessToken } = useApi()
	const { dashboardId } = useParams()
	const productData = { name: nameValue, category: categoryValue, unit: unitValue, price: priceValue, tags: tagsValue }

	const handleEditProduct = (id: string) => {
		if (productsData && productsData.length > 0) {
			const product = productsData.find(p => p._id === id)
			if (!product) {
				console.error('Product not found')
				return
			}
			setEditedProduct(id)
			setNameValue(product.name)
			setCategoryValue(product.category)
			setUnitValue(product.unit)
			setPriceValue(product.price)
			setTagsValue(product.tags)
		} else {
			console.error('Empty products list')
		}
	}

	const handleUpdate = async (id: string, data: UpdateProduct | { isFavourite: boolean }) => {
		if (!accessToken) {
			console.error('No token found in local storage.')
		}

		const res = await fetch(`${API_URL}dashboards/${dashboardId}/products/${id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
		if (res.ok) {
			const result: Product = await res.json()
			setProductsData((prevData: Product[]) =>
				prevData.map((p: Product) => {
					if (p._id === id) {
						return result
					}
					return p
				})
			)
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
		setEditedProduct('')
	}

	const handleDelete = async (id: string) => {
		if (!accessToken) {
			return
		}

		const res = await fetch(`${API_URL}dashboards/${dashboardId}/products/${id}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})
		if (res.ok) {
			setProductsData(prevData => prevData.filter(d => d._id !== id))
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
	}

	return (
		<tr key={product._id} className='product-row'>
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
							placeholder='Type name...'
							onChange={e => setNameValue(e.target.value)}
						/>
					</td>
					<td>
						<select
							name='categorySelect'
							id='categorySelect'
							value={categoryValue}
							onChange={e => setCategoryValue(e.target.value)}>
							{CATEGORIES.map(c => (
								<option key={c.value} value={c.value}>
									{c.name}
								</option>
							))}
						</select>
					</td>
					<td>
						<input
							type='text'
							value={unitValue}
							placeholder='Type unit...'
							onChange={e => setUnitValue(e.target.value)}
						/>
					</td>
					<td>
						<input
							type='number'
							value={priceValue}
							placeholder='Type price...'
							onChange={e => setPriceValue(Number(e.target.value))}
						/>
					</td>
					<td>
						<input
							type='text'
							value={tagsValue}
							placeholder='Type tags...'
							onChange={e => setTagsValue(e.target.value)}
						/>
					</td>
				</>
			) : (
				<>
					<td>{product.name}</td>
					<td>{product.category}</td>
					<td>{product.unit}</td>
					<td>{product.price}</td>
					<td className='d-none d-table-cell-sm'>{product.tags}</td>
				</>
			)}
			<td>
				<div className='d-flex gap-1'>
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
