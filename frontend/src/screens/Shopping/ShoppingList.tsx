import { Plus } from 'react-feather'
import { useLoaderData, useParams, useRevalidator } from 'react-router-dom'
import { API_URL } from '../../config'
import { Alert } from '../../components/Alert/Alert'
import { useModalContext } from '../../contexts/ModalContext'
import { ShoppingProduct } from '../../components/ShoppingProduct/ShoppingProduct'
import { Product } from './Products'
import { getLocaleDateTime } from '../../utils/helpers'
import { Button } from '../../components/Button/Button'
import { useApi } from '../../contexts/ApiContext'

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
	const { fetchData } = useApi()

	const openAddItemModal = () => {
		const modalData = {
			name: 'addShoppingItem',
			title: 'Add shopping item',
		}
		setActiveModal(modalData)
	}

	const handleUpdateListItem = async (id: string, data: ShoppingItem | IsShoppingPurchased) => {
		const url = `${API_URL}dashboards/${dashboardId}/shoppingLists/${shoppingListId}/shopping-items/${id}`
		const options = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		}
		const response = await fetchData<ShoppingList>(url, options)

		if (response.error) {
			console.error('Failed to update shopping list:', response.status, response.error)
			return
		}

		revalidate()
	}

	const handleDeleteListItem = async (id: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/shoppingLists/${shoppingListId}/shopping-items/${id}`
		const options = {
			method: 'DELETE',
		}

		const response = await fetchData<ShoppingList>(url, options)

		if (response.error) {
			console.error('Failed to delete item:', response.status, response.error)
			return
		}

		revalidate()
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

	if (!data) {
		return (
			<Alert>
				<div>Your shopping list is empty.</div>
			</Alert>
		)
	}

	return (
		<>
			<div className='mt-4 mb-4 d-flex gap-2 justify-between align-center'>
				<div className='d-flex flex-column gap-1'>
					<div>
						Left to buy: {productsToBuy} {`${productsToBuy === 1 ? 'product' : 'products'}`}
					</div>
					<div className='text-gray fs-sm'>Last update: {getLocaleDateTime(data.updatedAt)}</div>
				</div>
				<Button className='btn-mobile-icon text-nowrap' onClick={openAddItemModal}>
					<Plus size={16} />
					Add item
				</Button>
			</div>
			{data.list && data.list.length > 0 ? (
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
							{data.list.map(p => (
								<ShoppingProduct
									key={p._id}
									data={p}
									onListItemUpdate={handleUpdateListItem}
									onListItemDelete={handleDeleteListItem}
								/>
							))}
						</tbody>
						<tfoot>
							<tr className='bg-lighter border-top border-light text-bold'>
								<td colSpan={2} className='px-2'>
									Summary:
								</td>
								<td className='text-end'>Products Value:</td>
								<td colSpan={3}>{calculateSum()}</td>
							</tr>
						</tfoot>
					</table>
				</div>
			) : (
				<div className='mx-n4 mb-n4 border-top border-light'>
					<Alert>
						<div>Your shopping list is empty. Add an item to see it on the table.</div>
					</Alert>
				</div>
			)}
		</>
	)
}
