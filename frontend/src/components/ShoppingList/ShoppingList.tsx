import { Plus } from 'react-feather'
import { useLoaderData, useParams, useRevalidator } from 'react-router-dom'
import { API_URL } from '../../config'
import { Alert } from '../Alert/Alert'
import { useModalContext } from '../../contexts/ModalContext'
import { ShoppingProduct } from '../ShoppingProduct/ShoppingProduct'
import { ApiError } from '../../main'
import { Product } from '../Products/Products'
import { getLocaleDateTime } from '../../utils/helpers'
import { Button } from '../Button/Button'

export type ShoppingItem = {
	productId: Product
	quantity: number
	notes: string
	customUnit: string
	customPrice: number
	isPurchased: boolean
	_id: string
}

export type IsShoppingPurchased = {
	isPurchased: boolean
}

export type ShoppingList = {
	_id: string
	name: string
	list: ShoppingItem[]
	updatedAt: string
}

export function ShoppingList() {
	const data: ShoppingList = useLoaderData() as ShoppingList
	const { setActiveModal } = useModalContext()
	const { shoppingListId, dashboardId } = useParams()
	const productsToBuy = data.list.filter(p => p.isPurchased === false).length
	const { revalidate } = useRevalidator()

	const openAddItemModal = () => {
		const modalData = {
			name: 'addShoppingItem',
			title: 'Add shopping item',
		}
		setActiveModal(modalData)
	}

	const handleUpdateListItem = async (id: string, data: ShoppingItem | IsShoppingPurchased) => {
		const token = localStorage.getItem('token')
		if (!token) {
			console.warn('Token not available')
			return
		}
		const res = await fetch(
			`${API_URL}dashboards/${dashboardId}/shoppingLists/${shoppingListId}/shopping-items/${id}`,
			{
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			}
		)
		if (!res.ok) {
			const errorData: ApiError = await res.json()
			console.error(errorData.message)
		} else {
			revalidate()
		}
	}

	const handleDeleteListItem = async (id: string) => {
		const token = localStorage.getItem('token')
		if (token) {
			const res = await fetch(
				`${API_URL}dashboards/${dashboardId}/shoppingLists/${shoppingListId}/shopping-items/${id}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			if (!res.ok) {
				const errorData = await res.json()
				console.error(errorData.message)
			} else {
				revalidate()
			}
		}
	}

	const calculateSum = () => {
		if (!data || !Array.isArray(data.list)) {
			return 0
		}

		return data.list
			.reduce((acc, currentVal) => {
				return acc + currentVal.customPrice * currentVal.quantity
			}, 0)
			.toFixed(2)
	}

	return (
		<>
			{data ? (
				<>
					<div className='mt-4 mb-4 d-flex gap-2 justify-between align-center'>
						<div className='d-flex flex-column gap-1'>
							<div>
								Left to buy: {productsToBuy} {`${productsToBuy === 1 ? 'product' : 'products'}`}
							</div>
							<div className='text-gray fs-sm'>Last update: {getLocaleDateTime(data.updatedAt)}</div>
						</div>
						<Button onClick={openAddItemModal}>
							<Plus size={16} />
							Add item
						</Button>
					</div>
					<div className='mx-n4 mb-n4'>
						<table cellSpacing={0} className='overflow-hidden rounded-bottom-3'>
							<thead className='bg-lighter'>
								<tr className='border-top border-bottom border-light'>
									<th style={{ width: '30px' }}></th>
									<th>Name</th>
									<th>{'Quantity [unit]'}</th>
									<th>Price per unit</th>
									<th>Notes</th>
									<th style={{ width: '85px' }}></th>
								</tr>
							</thead>
							<tbody>
								{data.list &&
									data.list.length > 0 &&
									data.list.map(p => (
										<ShoppingProduct
											key={p._id}
											data={p}
											onListItemUpdate={handleUpdateListItem}
											onListItemDelete={handleDeleteListItem}
										/>
									))}
							</tbody>
							{data.list && data.list.length > 0 && (
								<tfoot>
									<tr className='bg-lighter border-top border-light text-bold'>
										<td colSpan={2} className='px-2'>
											Summary:
										</td>
										<td className='text-end'>Products Value:</td>
										<td colSpan={3}>{calculateSum()}</td>
									</tr>
								</tfoot>
							)}
						</table>
					</div>
				</>
			) : (
				<Alert>
					<div>Your shopping list is empty.</div>
				</Alert>
			)}
		</>
	)
}
