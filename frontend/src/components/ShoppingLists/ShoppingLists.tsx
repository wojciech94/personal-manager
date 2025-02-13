import { useState, useEffect } from 'react'
import { Plus } from 'react-feather'
import { NavLink, Outlet, useMatch, useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useModalContext } from '../../contexts/ModalContext'
import { Alert } from '../Alert/Alert'
import { Button } from '../Button/Button'
import { ExpandableMenu } from '../ExpandableMenu/ExpandableMenu'
import { ShoppingList } from '../ShoppingList/ShoppingList'

export type ShoppingLists = ShoppingList[]

export function ShoppingLists() {
	const { setActiveModal } = useModalContext()
	const [shoppingLists, setShoppingLists] = useState<ShoppingLists>([])
	const token = localStorage.getItem('token')
	const { dashboardId } = useParams()
	const isExactMatch = useMatch('/dashboards/:dashboardId/shopping/list')
	const navigate = useNavigate()

	useEffect(() => {
		fetchShoppingLists()
	}, [])

	const fetchShoppingLists = async () => {
		if (token) {
			const res = await fetch(`${API_URL}dashboards/${dashboardId}/shopping-lists`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			if (res.ok) {
				const data: ShoppingLists = await res.json()
				if (data) {
					setShoppingLists(data)
					if (isExactMatch && data.length > 0) {
						navigate(`/dashboards/${dashboardId}/shopping/list/${data[0]._id}`)
					}
				}
			} else {
				const errorData = await res.json()
				console.error(errorData.message)
			}
		}
	}

	const modifyShoppingListsModal = () => {
		const modifyShoppingListModal = {
			name: 'modifyShoppingLists',
			data: {
				action: fetchShoppingLists,
			},
			title: 'Modify shopping lists',
		}
		setActiveModal(modifyShoppingListModal)
	}

	const openCreateShoppingListModal = () => {
		const modalData = {
			name: 'createShoppingList',
			data: {
				action: fetchShoppingLists,
			},
			title: 'Create shopping list',
		}
		setActiveModal(modalData)
	}

	const menuItems = [
		{
			label: 'Modify shopping lists',
			action: modifyShoppingListsModal,
		},
	]

	return (
		<>
			<div className='d-flex gap-3 justify-between align-center'>
				<div className='card-title'>Shopping list</div>
				<div className='d-flex gap-2 align-center'>
					<Button className={`text-nowrap btn-mobile-icon`} onClick={openCreateShoppingListModal}>
						<Plus size={16} />
						<span className='d-mobile-none'>Create shopping list</span>
					</Button>
					<ExpandableMenu items={menuItems} />
				</div>
			</div>
			{shoppingLists && shoppingLists.length > 0 ? (
				<>
					<div className='bg-light d-flex gap-3 mx-n4 mt-4 border-top border-bottom px-4 py-2'>
						{shoppingLists.map(l => (
							<NavLink key={l._id} to={`${l._id}`} className='btn btn-link link'>
								{l.name}
							</NavLink>
						))}
					</div>
				</>
			) : (
				<div className='mt-4 mb-n4 mx-n4 border-top border-light'>
					<Alert variant='primary'>Create your first shopping list to add products.</Alert>
				</div>
			)}
			<Outlet />
		</>
	)
}
