import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useModalContext } from '../../contexts/ModalContext'
import { Button } from '../Button/Button'

export function ModalAddShoppingItem(): JSX.Element {
	const [products, setProducts] = useState<Product[]>([])
	const [activeProductId, setActiveProductId] = useState<Product | null>(null)
	const { dashboardId, shoppingListId } = useParams()
	const [unitValue, setUnitValue] = useState<string>('')
	const [priceValue, setPriceValue] = useState<number>(0)
	const [quantityValue, setQuantityValue] = useState<number | null>(1)
	const [notesValue, setNotesValue] = useState<string>('')
	const token: string | null = localStorage.getItem('token')
	const { setActiveModal } = useModalContext()
	const navigate = useNavigate()

	type Product = {
		_id: string
		unit: string
		price: number
		name: string
	}

	const fetchProducts = async (): Promise<void> => {
		if (token) {
			const res = await fetch(`${API_URL}dashboards/${dashboardId}/products?sort_by=name&direction=asc`, {
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

	const addShoppingItem = async (): Promise<void> => {
		if (token) {
			const res = await fetch(`${API_URL}dashboards/${dashboardId}/shoppingLists/${shoppingListId}/shopping-items`, {
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
					navigate(window.location.pathname, { replace: true })
				}
			} else {
				const errorData = await res.json()
				console.error(errorData.message)
			}
		}
	}

	const handleSelectItem = (id: string): void => {
		const activeProduct = products.find(p => p._id === id)
		setActiveProductId(activeProduct || null)
		setUnitValue(activeProduct?.unit || '')
		setPriceValue(activeProduct?.price || 0)
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
							<select
								name='productsSelect'
								id='productsSelect'
								onChange={e => handleSelectItem(e.target.value)}
								value={activeProductId?._id}>
								{products.map(p => (
									<option key={p._id} value={p._id}>
										{p.name}
									</option>
								))}
							</select>
						</div>
					)}
					<div className='d-flex flex-column gap-1'>
						<div>Quantity</div>
						<input
							type='number'
							value={quantityValue === null ? '' : quantityValue}
							onChange={e => {
								const value = e.target.value === '' ? null : Number(e.target.value)
								setQuantityValue(value)
							}}
						/>
					</div>
					<div className='d-flex flex-column gap-1'>
						<div>Unit</div>
						<input type='text' value={unitValue} onChange={e => setUnitValue(e.target.value)} />
					</div>
					<div className='d-flex flex-column gap-1'>
						<div>Price</div>
						<input type='number' value={priceValue} onChange={e => setPriceValue(Number(e.target.value))} />
					</div>
					<div className='d-flex flex-column flex-1 gap-1 w-100'>
						<div>Notes</div>
						<textarea className='max-w-100' value={notesValue} onChange={e => setNotesValue(e.target.value)} />
					</div>
				</div>
			</div>
			<div className='card-footer'>
				<Button variant='success' className='w-100' onClick={addShoppingItem}>
					Add item
				</Button>
			</div>
		</>
	)
}
