import { useContext } from 'react'
import { Plus } from 'react-feather'
import { useLoaderData, useParams, useRevalidator } from 'react-router-dom'
import { API_URL } from '../../config'
import { ModalContext } from '../../contexts/ModalContext'
import { ShoppingProduct } from '../ShoppingProduct/ShoppingProduct'

export function ShoppingList() {
	const data = useLoaderData()
	const [, setActiveModal] = useContext(ModalContext)
	const { shoppingListId } = useParams()
	const productsToBuy = data?.list.filter(p => p.isPurchased === false).length
	const { revalidate } = useRevalidator()

	const openAddItemModal = () => {
		const modalData = {
			name: 'addShoppingItem',
			data: {
				action: () => console.log('addShoppingItem'),
			},
			title: 'Add shopping item',
		}
		setActiveModal(modalData)
	}

	const handleUpdateListItem = async (id, data) => {
		const token = localStorage.getItem('token')
		if (!token) {
			console.warning('Token not available')
			return
		}
		const res = await fetch(`${API_URL}shopping-items/${id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
		if (!res.ok) {
			const errorData = res.json()
			console.error(errorData.message)
		} else {
			revalidate()
		}
	}

	const handleDeleteListItem = async id => {
		const token = localStorage.getItem('token')
		if (token) {
			const res = await fetch(`${API_URL}shoppingLists/${shoppingListId}/shopping-items/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			if (!res.ok) {
				const errorData = await res.json()
				console.error(errorData.message)
			} else {
				revalidate()
			}
		}
	}

	return (
		<>
			{data && (
				<>
					<div className='mt-4 mb-4 d-flex gap-2 justify-between align-center'>
						<div className='d-flex flex-column gap-1'>
							<div>
								Left to buy: {productsToBuy} {`${productsToBuy === 1 ? 'product' : 'products'}`}
							</div>
							<div className='text-gray fs-sm'>Last update: {data.updatedAt.split('.')[0].replace('T', ' ')}</div>
						</div>
						<button className='btn btn-primary d-flex align-center gap-2' onClick={openAddItemModal}>
							<Plus size={16} />
							Add item
						</button>
					</div>
					<div className='mx-n4 mb-n4'>
						<table cellSpacing={0}>
							<thead className='bg-lighter'>
								<tr className='border-top border-bottom border-light'>
									<th style={{ width: '30px' }}></th>
									<th>Name</th>
									<th>{'Quantity [unit]'}</th>
									<th>Price</th>
									<th>Notes</th>
									<th style={{ width: '85px' }}></th>
								</tr>
							</thead>
							<tbody>
								{data.list &&
									data.list.length > 0 &&
									data.list.map(p => (
										<ShoppingProduct
											data={p}
											onListItemUpdate={handleUpdateListItem}
											onListItemDelete={handleDeleteListItem}
										/>
									))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</>
	)
}
