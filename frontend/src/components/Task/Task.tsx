import { useEffect, useState } from 'react'
import { Check, Clock, Edit, Trash2 } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'

enum TaskPriorities {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
}

export enum SortMethods {
	CREATED_AT = 'created_at',
	EXPIRED_AT = 'expired_at',
	PRIORITY = 'priority',
}

type Props = {
	task: Task
	fetchTasks: () => void
	tasksSettings: TasksSettings
}

export type Task = {
	_id: string
	content: string
	priority: TaskPriorities
	is_done: boolean
	created_at: string
	expired_at: string
	archived_at: string
	removed_at: string
}

export type TasksSettings = {
	showDeadline: boolean
	archivizationTime: number
	removeTime: number
	sortMethod: SortMethods
	sortDirection: 'asc' | 'desc'
}

export function Task({ task, fetchTasks, tasksSettings }: Props) {
	const [taskData, setTaskData] = useState(task)
	const [contentValue, setContentValue] = useState(task.content)
	const [priorityValue, setPriorityValue] = useState(task.priority)
	const [expirationValue, setExpirationValue] = useState(task.expired_at)
	const [isEdit, setIsEdit] = useState(false)
	const token = localStorage.getItem('token')
	const { dashboardId } = useParams()

	useEffect(() => {
		setTaskData(task)
		setContentValue(task.content)
		setPriorityValue(task.priority)
		if (task.expired_at) {
			const date = new Date(task.expired_at).toISOString().split('T')[0]
			setExpirationValue(date)
		}
	}, [task])

	const updateTask = async (action: string) => {
		let updatedTask
		switch (action) {
			case 'toggle': {
				let dataParams
				if (!taskData.is_done) {
					const now = new Date()
					const archivedAt = new Date(now.getTime() + tasksSettings.archivizationTime * 60 * 60 * 1000).toISOString()
					const removedAt = new Date(now.getTime() + tasksSettings.removeTime * 60 * 60 * 1000).toISOString()
					dataParams = { archived_at: archivedAt, removed_at: removedAt }
				} else {
					dataParams = { archived_at: null, removed_at: null }
				}
				updatedTask = { ...taskData, is_done: !taskData.is_done, ...dataParams }
				break
			}
			case 'delete':
				break
			case 'update':
			default: {
				updatedTask = { ...taskData, content: contentValue, priority: priorityValue, expired_at: expirationValue }
				break
			}
		}
		const config: RequestInit = {
			method: action === 'delete' ? 'DELETE' : 'PATCH',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		}

		if (action !== 'delete') {
			config.body = JSON.stringify(updatedTask)
		}

		const res = await fetch(`${API_URL}dashboards/${dashboardId}/task/${taskData._id}`, config)
		if (res.ok) {
			if (action === 'delete') {
				console.log('fetch')
				fetchTasks()
			} else {
				const data = await res.json()
				if (data) {
					setTaskData(data)
				}
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
							<select
								name='prioritySelect'
								id='prioritySelect'
								value={taskData.priority}
								onChange={e => setPriorityValue(e.target.value as TaskPriorities)}>
								<option value='low'>Low</option>
								<option value='medium'>Medium</option>
								<option value='high'>High</option>
							</select>
						</div>
						<div className='d-flex flex-column gap-1 text-gray'>
							<label htmlFor='expirationDate'>Expire at</label>
							<input type='date' value={expirationValue} onChange={e => setExpirationValue(e.target.value)} />
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
			{tasksSettings && tasksSettings.showDeadline && expirationValue && !isEdit && (
				<div className='d-flex gap-2 align-center text-gray'>
					<Clock size={16} />
					{expirationValue}
				</div>
			)}
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
				<button className='btn btn-danger btn-icon' onClick={() => updateTask('delete')}>
					<Trash2 size={16} />
				</button>
			</div>
		</div>
	)
}
