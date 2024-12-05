import { useEffect, useState } from 'react'
import { Check, Edit, Trash2 } from 'react-feather'
import { useParams } from 'react-router-dom'

export function Task({ task }) {
	const [taskData, setTaskData] = useState(task)
	const [contentValue, setContentValue] = useState(task.content)
	const [priorityValue, setPriorityValue] = useState(task.priority)
	const [isEdit, setIsEdit] = useState(false)
	const token = localStorage.getItem('token')
	const { dashboardId } = useParams()

	useEffect(() => {
		setTaskData(task)
	}, [task])

	const updateTask = async action => {
		let updatedTask
		switch (action) {
			case 'toggle':
				updatedTask = { ...taskData, is_done: !taskData.is_done }
				break
			case 'update':
			default:
				updatedTask = { ...taskData, content: contentValue, priority: priorityValue }
				break
		}
		const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}/task/${taskData._id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(updatedTask),
		})
		if (res.ok) {
			const data = await res.json()
			if (data) {
				console.log(data)
				setTaskData(data)
			}
            setIsEdit(false)
		}
	}

	return (
		<div className='task'>
			<div className='flex-1 d-flex align-center gap-3'>
				<div className={`task-priority ${priorityValue}`}></div>
				{isEdit ? (
					<div className='d-flex gap-3 flex-1 align-center'>
						<div className='d-flex flex-column gap-1 text-gray flex-1'>
							<label htmlFor={`contentInput-${task._id}`}>Content</label>
							<input
								id={`contentInput-${task._id}`}
								type='text'
								value={contentValue}
								onChange={e => setContentValue(e.target.value)}
							/>
						</div>
						<div className='d-flex flex-column gap-1 text-gray'>
							<label htmlFor='prioritySelect'>Priority</label>
							<select name='prioritySelect' id='prioritySelect' onChange={e => setPriorityValue(e.target.value)}>
								<option value='low'>Low</option>
								<option value='medium'>Medium</option>
								<option value='high'>High</option>
							</select>
						</div>
					</div>
				) : (
					<>
						<input
							type='checkbox'
							id={`task-${taskData._id}`}
							checked={taskData.is_done}
							onChange={() => updateTask('toggle')}
						/>
						<label
							htmlFor={`task-${taskData._id}`}
							className={`${taskData.is_done ? 'done' : ''}`}
							onClick={() => updateTask('toggle')}>
							{taskData.content}
						</label>
					</>
				)}
			</div>
			<div className='d-flex gap-2 align-center'>
				{isEdit ? (
					<button className='btn btn-success btn-icon' onClick={() => updateTask('update')}>
						<Check size={16} />
					</button>
				) : (
					<button className='btn btn-primary btn-icon' onClick={() => setIsEdit(true)}>
						<Edit size={16} />
					</button>
				)}
				<button className='btn btn-danger btn-icon'>
					<Trash2 size={16} />
				</button>
			</div>
		</div>
	)
}
