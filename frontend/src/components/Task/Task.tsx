import { useEffect, useState } from 'react'
import { Check, Clock, Edit, Trash2 } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'
import { TaskPriorities, TaskProps, TaskType } from './types'

export function Task({ task, fetchTasks, tasksSettings }: TaskProps) {
	const [taskData, setTaskData] = useState(task)
	const [contentValue, setContentValue] = useState(task.content)
	const [priorityValue, setPriorityValue] = useState(task.priority)
	const [expirationValue, setExpirationValue] = useState(task.expired_at)
	const [isEdit, setIsEdit] = useState(false)
	const { fetchData } = useApi()
	const { dashboardId } = useParams()
	const { t } = useTranslation()

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
		const options: {
			method: string
			headers: {
				'Content-Type': string
			}
			body?: string
		} = {
			method: action === 'delete' ? 'DELETE' : 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
		}

		if (action !== 'delete') {
			options.body = JSON.stringify(updatedTask)
		}

		const url = `${API_URL}dashboards/${dashboardId}/task/${taskData._id}`

		const response = await fetchData<TaskType>(url, options)

		if (response.error) {
			console.error('Failed to update Task:', response.status, response.error)
			return
		}

		if (response.data) {
			if (action === 'delete') {
				fetchTasks()
			} else {
				setTaskData(response.data)
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
							<label htmlFor={`contentInput-${task._id}`}>{t('content')}</label>
							<input
								id={`contentInput-${task._id}`}
								type='text'
								value={contentValue}
								onChange={e => setContentValue(e.target.value)}
							/>
						</div>
						<div className='d-flex flex-column gap-1 text-gray'>
							<label htmlFor='prioritySelect'>{t('priority')}</label>
							<select
								name='prioritySelect'
								id='prioritySelect'
								value={taskData.priority}
								onChange={e => setPriorityValue(e.target.value as TaskPriorities)}>
								<option value='low'>{t('low')}</option>
								<option value='medium'>{t('medium')}</option>
								<option value='high'>{t('high')}</option>
							</select>
						</div>
						<div className='d-flex flex-column gap-1 text-gray'>
							<label htmlFor='expirationDate'>{t('expire_at')}</label>
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
						<label htmlFor={`task-${taskData._id}`} className={`${taskData.is_done ? 'done' : ''}`}>
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
					<Button variant='success' onlyIcon={true} onClick={() => updateTask('update')}>
						<Check size={16} />
					</Button>
				) : (
					<Button onlyIcon={true} onClick={() => setIsEdit(true)}>
						<Edit size={16} />
					</Button>
				)}
				<Button onlyIcon={true} variant='danger' onClick={() => updateTask('delete')}>
					{' '}
					<Trash2 size={16} />
				</Button>
			</div>
		</div>
	)
}
