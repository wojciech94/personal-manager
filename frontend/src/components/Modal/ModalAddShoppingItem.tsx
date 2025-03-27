import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Product, ShoppingItem } from '../../screens/Shopping/types'
import { Button } from '../Button/Button'

export function ModalAddShoppingItem(): JSX.Element {
	const [products, setProducts] = useState<Product[]>([])
	const [activeProductId, setActiveProductId] = useState<Product | null>(null)
	const { dashboardId, shoppingListId } = useParams()
	const [unitValue, setUnitValue] = useState<string>('')
	const [priceValue, setPriceValue] = useState<string>('0')
	const [quantityValue, setQuantityValue] = useState<string>('1')
	const [notesValue, setNotesValue] = useState<string>('')
	const { setActiveModal } = useModalContext()
	const navigate = useNavigate()
	const { fetchData } = useApi()
	const { t } = useTranslation()

	const fetchProducts = async (): Promise<void> => {
		const url = `${API_URL}dashboards/${dashboardId}/products?sort_by=name&direction=asc`

		const response = await fetchData<Product[]>(url)

		if (response.error) {
			console.error('Failed to fetch products:', response.status, response.error)
			return
		}

		if (response.data) {
			const data = response.data
			setProducts(data)
			setActiveProductId(data[0] || null)
			setUnitValue(data[0].unit || '')
			setPriceValue(data[0].price.toString() || '0')
		}
	}

	const addShoppingItem = async (): Promise<void> => {
		const url = `${API_URL}dashboards/${dashboardId}/shoppingLists/${shoppingListId}/shopping-items`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				productId: activeProductId,
				quantity: quantityValue,
				notes: notesValue,
				customUnit: unitValue,
				customPrice: priceValue,
			}),
		}

		const response = await fetchData<ShoppingItem>(url, options)

		if (response.error) {
			console.error('Failed to add shopping item:', response.status, response.error)
			return
		}

		if (response.data) {
			setActiveModal(null)
			navigate(window.location.pathname, { replace: true })
		}
	}

	const handleSelectItem = (id: string): void => {
		const activeProduct = products.find(p => p._id === id)
		setActiveProductId(activeProduct || null)
		setUnitValue(activeProduct?.unit || '')
		setPriceValue(activeProduct?.price || '0')
	}

	useEffect(() => {
		fetchProducts()
	}, [])

	return (
		<>
			<div className='card-content'>
				<div className='flex justify-between gap-4 flex-wrap'>
					{products && products.length > 0 && (
						<div className='flex flex-col gap-1'>
							<div>{t('product')}</div>
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
					<div className='flex flex-col gap-1'>
						<div>{t('quantity')}</div>
						<input
							value={quantityValue}
							onChange={e => {
								const inputValue = e.target.value
								if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
									setQuantityValue(inputValue)
								}
							}}
						/>
					</div>
					<div className='flex flex-col gap-1'>
						<div>{t('unit')}</div>
						<input type='text' value={unitValue} onChange={e => setUnitValue(e.target.value)} />
					</div>
					<div className='flex flex-col gap-1'>
						<div>{t('price')}</div>
						<input value={priceValue} onChange={e => setPriceValue(e.target.value)} />
					</div>
					<div className='flex flex-col flex-1 gap-1 w-100'>
						<div>{t('notes')}</div>
						<textarea className='max-w-100' value={notesValue} onChange={e => setNotesValue(e.target.value)} />
					</div>
				</div>
			</div>
			<div className='card-footer'>
				<Button variant='success' className='w-100' onClick={addShoppingItem}>
					{t('add_item')}
				</Button>
			</div>
		</>
	)
}
