import { useContext } from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ModalContext } from '../../contexts/ModalContext'

import { FormRow } from '../FormRow/FormRow'
export function ModalAddTask({ modalData }) {
	const [taskGroup, setTaskGroup] = useState(modalData.initValue || modalData.groups[0]._id)
	const [groups, setGroups] = useState(modalData.groups)
	const [contentValue, setContentValue] = useState('')
	const [priorityValue, setPriorityValue] = useState('medium')
	const [expiredDate, setExpiredDate] = useState('')
	const token = localStorage.getItem('token')
	const { dashboardId } = useParams()
	const [, setActiveModal] = useContext(ModalContext)

	useEffect(() => {
		if (modalData.initValue) {
			setTaskGroup(modalData.initValue)
		}
	}, [modalData])

	const handleAddTask = async () => {
		console.log(taskGroup)
		const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}/add-task`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				content: contentValue,
				priority: priorityValue,
				groupId: taskGroup,
				expirationDate: expiredDate,
			}),
		})
		if (res.ok) {
			const data = await res.json()
			console.log(data)
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
		setActiveModal(null)
	}

	return (
		<div className='p-4 d-flex flex-column gap-2'>
			<FormRow label='Content'>
				<input required className='' type='text' value={contentValue} onChange={e => setContentValue(e.target.value)} />
			</FormRow>
			<FormRow label='Priority'>
				<select
					className='align-self-start'
					name='prioritySelect'
					value={priorityValue}
					id='prioritySelect'
					onChange={e => setPriorityValue(e.target.value)}>
					<option value='low'>Low</option>
					<option value='medium'>Medium</option>
					<option value='high'>Heigh</option>
				</select>
			</FormRow>
			<FormRow label='Group'>
				<select
					className='align-self-start'
					name='taskSelect'
					id='taskSelect'
					value={taskGroup}
					onChange={e => setTaskGroup(e.target.value)}>
					{groups && groups.length > 0 && groups.map(g => <option value={g._id}>{g.name}</option>)}
				</select>
			</FormRow>
			<FormRow label='Deadline' className='mb-2'>
				<input
					className='align-self-start'
					type='date'
					value={expiredDate}
					onChange={e => setExpiredDate(e.target.value)}
				/>
			</FormRow>
			{modalData?.actionName && (
				<>
					<hr />{' '}
					<button className='btn btn-success mt-2' onClick={handleAddTask}>
						{modalData.actionName}
					</button>
				</>
			)}
		</div>
	)
}
