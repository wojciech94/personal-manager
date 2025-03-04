import { useEffect, useState } from 'react'
import { Check, Edit, Trash } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useAuth } from '../../contexts/AuthContext'
import { useModalContext } from '../../contexts/ModalContext'
import { Button } from '../Button/Button'
import { DataProps } from './types'
import { InputDynamicObject } from '../../types/global'
import { TodoGroup } from '../Task/types'

export function ModalModifyTodoGroup({ modalData }: { modalData: DataProps }) {
	const { setActiveModal } = useModalContext()
	const [inputVal, setInputVal] = useState('')
	const [groups, setGroups] = useState<TodoGroup[]>([])
	const [inputValues, setInputValues] = useState<InputDynamicObject>({})
	const { accessToken } = useAuth()
	const { dashboardId } = useParams()

	useEffect(() => {
		if (modalData.groups) {
			initGroups(modalData.groups)
		}
	}, [modalData])

	const initGroups = (groups: TodoGroup[]) => {
		const dataToEdit = groups.map(g => {
			g.isEdit = false
			return g
		})
		setGroups(dataToEdit)
	}

	const addTodoGroup = () => {
		setActiveModal(null)
		if (modalData.action && typeof modalData.action === 'function' && modalData.action.length === 1) {
			const action = modalData.action as (arg: string) => Promise<void>
			action(inputVal)
		}
	}

	const removeTodoGroup = async (id: string) => {
		if (!id || !accessToken) {
			return
		}

		const res = await fetch(`${API_URL}dashboards/${dashboardId}/tasks-groups`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id }),
		})
		if (res.ok) {
			const data = await res.json()
			if (data) {
				initGroups(data)
				if (modalData.fetchAction && typeof modalData.action === 'function' && modalData.action.length === 0) {
					const action = modalData.action as () => Promise<void>
					action()
				}
			}
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
	}

	const setEdit = (id: string, val: string) => {
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

	const saveInput = async (id: string, val: string) => {
		if (id && val && accessToken && dashboardId) {
			const res = await fetch(`${API_URL}dashboards/${dashboardId}/tasks-groups`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${accessToken}`,
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
				if (
					modalData.fetchAction &&
					typeof modalData.fetchAction === 'function' &&
					modalData.fetchAction.length === 0
				) {
					const action = modalData.fetchAction as () => Promise<void>
					action()
				}
			} else {
				const errorData = await res.json()
				console.error(errorData.message)
			}
		}
	}

	const handleInputChange = (id: string, value: string) => {
		setInputValues(prevValues => ({ ...prevValues, [id]: value }))
	}

	return (
		<>
			<div className='card-content d-flex flex-column gap-3 pt-0'>
				{groups && groups.length > 0 && (
					<>
						<div className='card-subtitle border-top-none'>Update groups</div>
						{groups.map(g => (
							<div key={g._id} className='px-2 d-flex justify-between align-center gap-2'>
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
										<Button
											size='sm'
											onlyIcon={true}
											variant='success'
											onClick={() => saveInput(g._id, inputValues[g._id])}>
											<Check size={16} />
										</Button>
									) : (
										<Button size='sm' onlyIcon={true} onClick={() => setEdit(g._id, g.name)}>
											<Edit size={16} />
										</Button>
									)}
									<Button size='sm' onlyIcon={true} variant='danger' onClick={() => removeTodoGroup(g._id)}>
										<Trash size={16} />
									</Button>
								</div>
							</div>
						))}
					</>
				)}
				<div className='card-subtitle'>Add new group</div>
				<div className='px-2'>
					<input
						type='text'
						value={inputVal}
						placeholder='Type group name...'
						onChange={e => setInputVal(e.target.value)}
					/>
				</div>
			</div>
			<div className='card-footer'>
				<Button variant='success' className='w-100' onClick={addTodoGroup}>
					{modalData.actionName}
				</Button>
			</div>
		</>
	)
}
