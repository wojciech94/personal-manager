import { useState, useEffect } from 'react'
import { Plus } from 'react-feather'
import { NavLink, Outlet, useMatch, useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { ExpandableMenu } from '../../components/ExpandableMenu/ExpandableMenu'
import { useTranslation } from '../../contexts/TranslationContext'
import { ShoppingListsType } from './types'

export function ShoppingLists() {
	const [shoppingLists, setShoppingLists] = useState<ShoppingListsType>([])
	const isExactMatch = useMatch('/dashboards/:dashboardId/shopping/list')
	const { dashboardId } = useParams()
	const { setActiveModal } = useModalContext()
	const { fetchData } = useApi()
	const navigate = useNavigate()
	const { t } = useTranslation()

	useEffect(() => {
		fetchShoppingLists()
	}, [])

	const fetchShoppingLists = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/shopping-lists`
		const response = await fetchData<ShoppingListsType>(url)

		if (response.error) {
			console.error('Failed to fetch shopping lists:', response.status, response.error)
			return
		}

		if (response.data) {
			const data: ShoppingListsType = response.data
			setShoppingLists(data)
			if (isExactMatch && data.length > 0) {
				navigate(`/dashboards/${dashboardId}/shopping/list/${data[0]._id}`)
			} else if (!isExactMatch && data.length === 0) {
				navigate(`/dashboards/${dashboardId}/shopping/list`)
			}
		}
	}

	const modifyShoppingListsModal = () => {
		const modifyShoppingListModal = {
			name: 'modifyShoppingLists',
			data: {
				action: fetchShoppingLists,
			},
			title: t('modify_shopping_lists'),
		}
		setActiveModal(modifyShoppingListModal)
	}

	const openCreateShoppingListModal = () => {
		const modalData = {
			name: 'createShoppingList',
			data: {
				action: fetchShoppingLists,
			},
			title: t('create_shopping_list'),
		}
		setActiveModal(modalData)
	}

	const menuItems = [
		{
			label: t('modify_shopping_lists'),
			action: modifyShoppingListsModal,
			disabled: !shoppingLists || shoppingLists.length === 0,
		},
	]

	return (
		<>
			<div className='flex gap-3 justify-between items-center'>
				<div className='font-semibold text-lg'>{t('shopping_list')}</div>
				<div className='flex gap-2 items-center'>
					<Button className={`text-nowrap sm:inline-flex p-2`} onClick={openCreateShoppingListModal}>
						<Plus size={16} />
						<span className='hidden sm:inline'>{t('create_shopping_list')}</span>
					</Button>
					<ExpandableMenu items={menuItems} />
				</div>
			</div>
			{shoppingLists && shoppingLists.length > 0 ? (
				<>
					<div className='bg-zinc-200 flex gap-3 -mx-4 mt-4 border-zinc-400 border-t border-b px-4 py-2'>
						{shoppingLists.map(l => (
							<NavLink
								key={l._id}
								to={`${l._id}`}
								className={({ isActive }) =>
									`font-semibold hover:text-blue-500 focus:outline-none ${isActive ? 'text-blue-500' : 'text-zinc-800'}`
								}>
								{l.name}
							</NavLink>
						))}
					</div>
				</>
			) : (
				<div className='mt-4 -mb-4 -mx-4 border-t border-light'>
					<Alert variant='primary'>{t('create_your_first_shopping_list')}</Alert>
				</div>
			)}
			<Outlet />
		</>
	)
}
