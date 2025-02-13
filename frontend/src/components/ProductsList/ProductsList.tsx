import { useState, useEffect } from 'react'
import { Edit, Star, Trash2, Check } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { CATEGORIES } from '../../constants/appConstants'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../Button/Button'
import { Product } from '../Products/Products'

type UpdateProduct = Omit<Product, '_id'>

export function ProductsList({ products }: { products: Product[] }) {
	const [productsData, setProductsData] = useState<Product[]>([])
	const { dashboardId } = useParams()
	const [editedProduct, setEditedProduct] = useState('')
	const [nameValue, setNameValue] = useState('')
	const [categoryValue, setCategoryValue] = useState('')
	const [unitValue, setUnitValue] = useState('')
	const [priceValue, setPriceValue] = useState(0)
	const [tagsValue, setTagsValue] = useState('')
	const { accessToken } = useAuth()

	const productData = { name: nameValue, category: categoryValue, unit: unitValue, price: priceValue, tags: tagsValue }

	useEffect(() => {
		setProductsData(products)
	}, [products])

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
			const result = await res.json()
			setProductsData(prevData =>
				prevData.map(p => {
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

	if (!products) {
		return null
	}

	return (
		<div className='products-list'>
			{productsData && productsData.length > 0 && (
				<>
					<div className='w-100 overflow-x-auto'>
						<table className='min-w-500px' cellSpacing={0}>
							<thead>
								<tr className='border-top border-bottom border-light bg-lighter text-bold'>
									<td style={{ width: '40px' }}></td>
									<td>NAME</td>
									<td>CATEGORY</td>
									<td>UNIT</td>
									<td>PRICE</td>
									<td className='d-none d-table-cell-sm'>TAGS</td>
									<td style={{ width: '85px' }}></td>
								</tr>
							</thead>
							<tbody>
								{productsData.map(p => (
									<tr key={p._id} className='product-row'>
										<td>
											<Button variant='text' onClick={() => handleUpdate(p._id, { isFavourite: !p.isFavourite })}>
												<Star size={20} color={p.isFavourite ? 'gold' : 'gray'} />
											</Button>
										</td>
										{p._id === editedProduct ? (
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
												<td>{p.name}</td>
												<td>{p.category}</td>
												<td>{p.unit}</td>
												<td>{p.price}</td>
												<td className='d-none d-table-cell-sm'>{p.tags}</td>
											</>
										)}
										<td>
											<div className='d-flex gap-1'>
												{p._id === editedProduct ? (
													<Button onlyIcon={true} variant='success' onClick={() => handleUpdate(p._id, productData)}>
														<Check size={16} />
													</Button>
												) : (
													<Button onlyIcon={true} onClick={() => handleEditProduct(p._id)}>
														<Edit size={16} />
													</Button>
												)}
												<Button onlyIcon={true} variant='danger' onClick={() => handleDelete(p._id)}>
													<Trash2 size={16} />
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	)
}
