import { useContext, useEffect, useState } from 'react'
import { Check, Edit, Trash } from 'react-feather'
import { useParams } from 'react-router-dom'
import { ModalContext } from '../../contexts/ModalContext'

export function ModalModifyTodoGroup({ modalData }) {
	const [, setActiveModal] = useContext(ModalContext)
	const [inputVal, setInputVal] = useState('')
	const [groups, setGroups] = useState([])
	const [inputValues, setInputValues] = useState(null)

	const token = localStorage.getItem('token')
	const { dashboardId } = useParams()

	useEffect(() => {
		if (modalData.groups) {
			initGroups(modalData.groups)
		}
	}, [modalData])

	const initGroups = groups => {
		const dataToEdit = groups.map(g => {
			g.isEdit = false
			return g
		})
		setGroups(dataToEdit)
	}

	const addTodoGroup = () => {
		setActiveModal(null)
		if (modalData.action) {
			modalData.action(inputVal)
		}
	}

	const removeTodoGroup = async id => {
		if (!id || !token) {
			return
		}

		const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}/tasks-groups`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id }),
		})
		if (res.ok) {
			const data = await res.json()
			if (data) {
				initGroups(data)
				if (modalData.fetchAction) {
					modalData.fetchAction()
				}
			}
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
	}

	const setEdit = (id, val) => {
		setGroups(prevGroups =>
			prevGroups.map(g => {
				if (g._id === id) {
					g.isEdit = !g.isEdit
				}
				return g
			})
		)
		setInputValues(prevValues => ({ ...prevValues, [id]: val }))
	}

	const saveInput = async (id, val) => {
		if (id && val && token && dashboardId) {
			const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}/tasks-groups`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id,
					name: val,
				}),
			})
			if (res.ok) {
				const data = await res.json()
				initGroups(data)
				console.log(data)
				if (modalData.fetchAction) {
					modalData.fetchAction()
				}
			} else {
				const errorData = await res.json()
				console.error(errorData.message)
			}
		}
	}

	const handleInputChange = (id, value) => {
		setInputValues(prevValues => ({ ...prevValues, [id]: value }))
	}

	return (
		<>
			<div className='card-content d-flex flex-column gap-3 pt-0'>
				{groups && groups.length > 0 && (
					<>
						<div className='card-subtitle border-top-none'>Update groups</div>
						{groups.map(g => (
							<div key={g._id} className='d-flex justify-between align-center gap-2'>
								{g.isEdit ? (
									<input
										type='text'
										value={inputValues[g._id] || ''}
										onChange={e => handleInputChange(g._id, e.target.value)}
									/>
								) : (
									<div>{g.name}</div>
								)}
								<div className='d-flex gap-2 align-center'>
									{g.isEdit ? (
										<button className='btn btn-icon btn-success' onClick={() => saveInput(g._id, inputValues[g._id])}>
											<Check size={16} />
										</button>
									) : (
										<button className='btn btn-icon btn-primary' onClick={() => setEdit(g._id, g.name)}>
											<Edit size={16} />
										</button>
									)}
									<button className='btn btn-icon btn-danger' onClick={() => removeTodoGroup(g._id)}>
										<Trash size={16} />
									</button>
								</div>
							</div>
						))}
					</>
				)}
				<div className='card-subtitle'>Add new group</div>
				<input
					type='text'
					value={inputVal}
					placeholder='Type group name...'
					onChange={e => setInputVal(e.target.value)}
				/>
			</div>
			<div className='card-footer'>
				<button className='btn btn-success d-block w-100' onClick={addTodoGroup}>
					{modalData.actionName}
				</button>
			</div>
		</>
	)
}
