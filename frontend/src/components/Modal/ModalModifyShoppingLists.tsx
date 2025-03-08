import { useState, useEffect } from 'react'
import { Check, Edit, X } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { Button } from '../Button/Button'
import { ShoppingLists } from '../../screens/Shopping/ShoppingLists'
import { DataProps } from './types'
import { ApiError } from '../../types/global'

export function ModalModifyShoppingLists({ modalData }: { modalData: DataProps }) {
	const [shoppingLists, setShoppingLists] = useState<ShoppingLists>([])
	const [editedListId, setEditedListId] = useState<string | null>(null)
	const [nameValue, setNameValue] = useState('')
	const { setActiveModal } = useModalContext()
	const { dashboardId } = useParams()
	const navigate = useNavigate()
	const { accessToken } = useApi()

	useEffect(() => {
		fetchShoppingLists()
	}, [])

	const fetchShoppingLists = async () => {
		if (accessToken) {
			const res = await fetch(`${API_URL}dashboards/${dashboardId}/shopping-lists`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			if (res.ok) {
				const data = await res.json()
				if (data) {
					setShoppingLists(data)
				}
			}
		}
	}

	const updateShoppingList = async (id: string) => {
		if (accessToken) {
			const res = await fetch(`${API_URL}dashboards/${dashboardId}/shopping-lists/${id}`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name: nameValue }),
			})
			if (res.ok) {
				const data = await res.json()
				if (data) {
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
			} else {
				const errorData: ApiError = await res.json()
				console.error(errorData.message)
			}
			setEditedListId(null)
		}
	}

	const deleteShoppingList = async (id: string) => {
		if (accessToken) {
			const res = await fetch(`${API_URL}dashboards/${dashboardId}/delete/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			if (!res.ok) {
				const errorData = await res.json()
				console.error(errorData.message)
			} else {
				setShoppingLists(prevList => prevList.filter(l => l._id !== id))
				if (modalData.action && typeof modalData.action === 'function' && modalData.action.length === 0) {
					const action = modalData.action as () => Promise<void>
					action()
				}
			}
		}
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
				<div className='card-content d-flex flex-column gap-2'>
					{shoppingLists.map(l => (
						<div key={l._id} className='d-flex gap-2 justify-between align-center'>
							{editedListId && editedListId === l._id ? (
								<input
									type='text'
									value={nameValue}
									placeholder='Type list name...'
									onChange={e => setNameValue(e.target.value)}
								/>
							) : (
								<div className='text-bold'>{l.name}</div>
							)}
							<div className='d-flex gap-2 '>
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
