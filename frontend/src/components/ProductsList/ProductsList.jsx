import { useState, useEffect } from 'react'
import { Edit, Star, Trash2, Check } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { CATEGORIES } from '../../constants/appConstants'
import { Alert } from '../Alert/Alert'

export function ProductsList({ products }) {
	if (!products) {
		return
	}

	const [productsData, setProductsData] = useState([])
	const { dashboardId } = useParams()
	const [editedProduct, setEditedProduct] = useState(-1)
	const [nameValue, setNameValue] = useState('')
	const [categoryValue, setCategoryValue] = useState('')
	const [unitValue, setUnitValue] = useState('')
	const [priceValue, setPriceValue] = useState('')
	const [tagsValue, setTagsValue] = useState('')

	const productData = { name: nameValue, category: categoryValue, unit: unitValue, price: priceValue, tags: tagsValue }

	useEffect(() => {
		setProductsData(products)
	}, [products])

	const token = localStorage.getItem('token')

	const handleEditProduct = id => {
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

	const handleUpdate = async (id, data) => {
		if (!token) {
			console.error('No token found in local storage.')
		}

		const res = await fetch(`${API_URL}dashboards/${dashboardId}/products/${id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${token}`,
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
		setEditedProduct(-1)
	}

	const handleDelete = async id => {
		if (!token) {
			return
		}

		const res = await fetch(`${API_URL}dashboards/${dashboardId}/products/${id}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`,
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
		<div className='products-list mx-n4'>
			{productsData && productsData.length > 0 ? (
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
									<td>TAGS</td>
									<td style={{ width: '85px' }}></td>
								</tr>
							</thead>
							<tbody>
								{productsData.map(p => (
									<tr className='product-row'>
										<td>
											<button
												className='btn btn-icon'
												onClick={() => handleUpdate(p._id, { isFavourite: !p.isFavourite })}>
												<Star size={20} color={p.isFavourite ? 'gold' : 'gray'} />{' '}
											</button>
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
															<option value={c.value}>{c.name}</option>
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
														onChange={e => setPriceValue(e.target.value)}
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
												<td>{p.tags}</td>
											</>
										)}
										<td>
											<div className='d-flex gap-1'>
												{p._id === editedProduct ? (
													<button className='btn btn-icon btn-success' onClick={() => handleUpdate(p._id, productData)}>
														<Check size={16} />
													</button>
												) : (
													<button className='btn btn-icon btn-primary' onClick={() => handleEditProduct(p._id)}>
														<Edit size={16} />
													</button>
												)}
												<button className='btn btn-icon btn-danger' onClick={() => handleDelete(p._id)}>
													<Trash2 size={16} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			) : (
				<>
					<Alert variant='primary'>Empty products list!</Alert>
				</>
			)}
		</div>
	)
}
