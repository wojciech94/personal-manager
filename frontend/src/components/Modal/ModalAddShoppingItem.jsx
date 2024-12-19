import { useState, useEffect } from 'react'
import { useNavigate, useParams, useContext } from 'react-router-dom'
import { API_URL } from '../../config'
import { ModalContext } from '../../contexts/ModalContext'

export function ModalAddShoppingItem() {
	const [products, setProducts] = useState([])
	const [activeProductId, setActiveProductId] = useState('')
	const { dashboardId, shoppingListId } = useParams()
	const [unitValue, setUnitValue] = useState('')
	const [priceValue, setPriceValue] = useState(0)
	const [quantityValue, setQuantityValue] = useState(0)
	const [notesValue, setNotesValue] = useState('')
	const token = localStorage.getItem('token')
	const [, setActiveModal] = useContext(ModalContext)
	const navigate = useNavigate()

	const fetchProducts = async () => {
		if (token) {
			const res = await fetch(`${API_URL}dashboards/${dashboardId}/products`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			if (res.ok) {
				const data = await res.json()
				setProducts(data)
				setActiveProductId(data[0]._id || null)
				setUnitValue(data[0].unit || '')
				setPriceValue(data[0].price || 0)
			} else {
				const errorData = await res.json()
				console.error(errorData.message)
			}
		}
	}

	const addShoppingItem = async () => {
		if (token) {
			const res = await fetch(`${API_URL}shoppingLists/${shoppingListId}/shopping-items`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					productId: activeProductId,
					quantity: quantityValue,
					notes: notesValue,
					customUnit: unitValue,
					customPrice: priceValue,
				}),
			})
			if (res.ok) {
				const data = await res.json()
				if (data) {
					setActiveModal(null)
					navigate(`.`, { replace: true })
				}
			} else {
				const errorData = await res.json()
				console.error(errorData.message)
			}
		}
	}

	useEffect(() => {
		fetchProducts()
	}, [])

	return (
		<>
			<div className='card-content'>
				<div className='d-flex justify-between gap-4 flex-wrap'>
					{products && products.length > 0 && (
						<div className='d-flex flex-column gap-1'>
							<div>Product</div>
							<select name='productsSelect' id='productsSelect' onChange={e => setActiveProductId(e.target.value)}>
								{products.map(p => (
									<option value={p._id}>{p.name}</option>
								))}
							</select>
						</div>
					)}
					<div className='d-flex flex-column gap-1'>
						<div>Quantity</div>
						<input type='text' value={quantityValue} onChange={e => setQuantityValue(e.target.value)} />
					</div>
					<div className='d-flex flex-column gap-1'>
						<div>Unit</div>
						<input type='text' value={unitValue} onChange={e => setUnitValue(e.target.value)} />
					</div>
					<div className='d-flex flex-column gap-1'>
						<div>Price</div>
						<input type='text' value={priceValue} onChange={e => setPriceValue(e.target.value)} />
					</div>
					<div className='d-flex flex-column flex-1 gap-1'>
						<div>Notes</div>
						<textarea type='text' value={notesValue} onChange={e => setNotesValue(e.target.value)} />
					</div>
				</div>
			</div>
			<div className='card-footer'>
				<button className='btn btn-success d-block w-100' onClick={addShoppingItem}>
					Add item
				</button>
			</div>
		</>
	)
}
