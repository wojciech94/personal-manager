import { useContext, useState, useEffect } from 'react'
import { Plus } from 'react-feather'
import { NavLink, Outlet, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { ModalContext } from '../../contexts/ModalContext'
import { ExpandableMenu } from '../ExpandableMenu/ExpandableMenu'

export function ShoppingLists() {
	const [, setActiveModal] = useContext(ModalContext)
	const [shoppingLists, setShoppingLists] = useState([])
	const token = localStorage.getItem('token')
	const { dashboardId } = useParams()

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
				const data = await res.json()
				if (data) {
					setShoppingLists(data)
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
					<button className='btn btn-primary d-flex gap-2 align-center' onClick={openCreateShoppingListModal}>
						<Plus size={16} /> Create shopping list
					</button>
					<ExpandableMenu items={menuItems} />
				</div>
			</div>
			{shoppingLists && shoppingLists.length > 0 && (
				<>
					<div className='bg-light d-flex gap-3 mx-n4 mt-4 border-top border-bottom px-4 py-2'>
						{shoppingLists.map(l => (
							<NavLink key={l._id} to={`${l._id}`} className='btn btn-link link'>
								{l.name}
							</NavLink>
						))}
					</div>
				</>
			)}
			<Outlet />
		</>
	)
}
