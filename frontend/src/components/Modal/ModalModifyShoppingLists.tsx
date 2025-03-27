import { useState, useEffect } from 'react'
import { Check, Edit, X } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { Button } from '../Button/Button'
import { DataProps } from './types'
import { ShoppingListsType, ShoppingListType } from '../../screens/Shopping/types'

export function ModalModifyShoppingLists({ modalData }: { modalData: DataProps }) {
	const [shoppingLists, setShoppingLists] = useState<ShoppingListsType>([])
	const [editedListId, setEditedListId] = useState<string | null>(null)
	const [nameValue, setNameValue] = useState('')
	const { setActiveModal } = useModalContext()
	const { dashboardId } = useParams()
	const navigate = useNavigate()
	const { fetchData } = useApi()

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
			setShoppingLists(response.data)
		}
	}

	const updateShoppingList = async (id: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/shopping-lists/${id}`
		const options = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name: nameValue }),
		}

		const response = await fetchData<ShoppingListType>(url, options)

		if (response.error) {
			console.error('Failed to update shopping list:', response.status, response.error)
		}

		if (response.data) {
			const data = response.data
			setShoppingLists(prevList =>
				prevList.map(l => {
					if (l._id === id) {
						return data
					} else {
						return l
					}
				})
			)
			if (modalData.action && typeof modalData.action === 'function' && modalData.action.length === 0) {
				const action = modalData.action as () => Promise<void>
				action()
			}
			setActiveModal(null)
			navigate(`dashboards/${dashboardId}/shopping/list/${id}`, { replace: true })
		}
		setEditedListId(null)
	}

	const deleteShoppingList = async (id: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/delete/${id}`
		const options = {
			method: 'DELETE',
		}

		const response = await fetchData<ShoppingListsType>(url, options)

		if (response.error) {
			console.error('Failed to delete shopping list:', response.status, response.error)
			return
		}

		if (response.data) {
			setShoppingLists(prevList => prevList.filter(l => l._id !== id))
			if (modalData.action && typeof modalData.action === 'function' && modalData.action.length === 0) {
				const action = modalData.action as () => Promise<void>
				action()
			}
		}
		setActiveModal(null)
	}

	const setEditedList = (id: string) => {
		const list = shoppingLists.find(l => l._id === id)
		if (list) {
			setNameValue(list.name)
		}
		setEditedListId(id)
	}

	return (
		<>
			{shoppingLists && shoppingLists.length > 0 && (
				<div className='card-content flex flex-col gap-2'>
					{shoppingLists.map(l => (
						<div key={l._id} className='flex gap-2 justify-between items-center'>
							{editedListId && editedListId === l._id ? (
								<input
									type='text'
									value={nameValue}
									placeholder='Type list name...'
									onChange={e => setNameValue(e.target.value)}
								/>
							) : (
								<div className='font-semibold'>{l.name}</div>
							)}
							<div className='flex gap-2 '>
								{editedListId && editedListId === l._id ? (
									<Button size='sm' onlyIcon={true} variant='success' onClick={() => updateShoppingList(l._id)}>
										<Check size={16} />
									</Button>
								) : (
									<Button size='sm' onlyIcon={true} onClick={() => setEditedList(l._id)}>
										<Edit size={16} />
									</Button>
								)}
								<Button size='sm' onlyIcon={true} variant='danger' onClick={() => deleteShoppingList(l._id)}>
									<X size={16} />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</>
	)
}
