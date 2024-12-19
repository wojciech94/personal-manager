import { useContext } from 'react'
import { useState, useEffect } from 'react'
import { Check, Edit, X } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { ModalContext } from '../../contexts/ModalContext'

export function ModalModifyShoppingLists({ modalData }) {
	const [shoppingLists, setShoppingLists] = useState([])
	const [editedListId, setEditedListId] = useState(null)
	const [nameValue, setNameValue] = useState('')
	const [, setActiveModal] = useContext(ModalContext)
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

	const updateShoppingList = async id => {
		if (token) {
			const res = await fetch(`${API_URL}shopping-lists/${id}`, {
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
					if (modalData?.action) {
						modalData.action()
					}
					setActiveModal(null)
					navigate(`dashboards/${dashboardId}/shopping/list/${id}`, { replace: true })
				}
			} else {
				const errorData = await res.json()
				console.error(errorData.message)
			}
			setEditedListId(null)
		}
	}

	const deleteShoppingList = async id => {
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
				if (modalData?.action) {
					modalData.action()
				}
			}
		}
	}

	const setEditedList = id => {
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
						<div className='d-flex gap-2 justify-between align-center'>
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
