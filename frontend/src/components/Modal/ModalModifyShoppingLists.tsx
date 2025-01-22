import { useState, useEffect } from 'react'
import { Check, Edit, X } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useModalContext } from '../../contexts/ModalContext'
import { ApiError } from '../../main'
import { ShoppingLists } from '../ShoppingLists/ShoppingLists'
import { DataProps } from './types'

export function ModalModifyShoppingLists({ modalData }: { modalData: DataProps }) {
	const [shoppingLists, setShoppingLists] = useState<ShoppingLists>([])
	const [editedListId, setEditedListId] = useState<string | null>(null)
	const [nameValue, setNameValue] = useState('')
	const { setActiveModal } = useModalContext()
	const { dashboardId } = useParams()
	const token = localStorage.getItem('token')
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
				const data = await res.json()
				if (data) {
					setShoppingLists(data)
				}
			}
		}
	}

	const updateShoppingList = async (id: string) => {
		if (token) {
			const res = await fetch(`${API_URL}dashboards/${dashboardId}/shopping-lists/${id}`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
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
		if (token) {
			const res = await fetch(`${API_URL}dashboards/${dashboardId}/delete/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
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
									<button className='btn btn-icon btn-success' onClick={() => updateShoppingList(l._id)}>
										<Check size={16} />
									</button>
								) : (
									<button className='btn btn-icon btn-primary' onClick={() => setEditedList(l._id)}>
										<Edit size={16} />
									</button>
								)}

								<button className='btn btn-icon btn-danger' onClick={() => deleteShoppingList(l._id)}>
									<X size={16} />
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</>
	)
}
