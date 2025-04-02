import { useEffect, useState } from 'react'
import { Check, Clock, Edit, Trash2 } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'
import { TaskPriorities, TaskProps, TaskType } from './types'

export function Task({ task, fetchTasks, tasksSettings, isArchive }: TaskProps) {
	const [taskData, setTaskData] = useState(task)
	const [contentValue, setContentValue] = useState(task.content || '')
	const [priorityValue, setPriorityValue] = useState<TaskPriorities>(task.priority || 'medium')
	const [expirationValue, setExpirationValue] = useState(task.expired_at || '')
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

	const priorityClass = (priority: TaskPriorities): string => {
		switch (priority) {
			case 'low' as TaskPriorities:
				return 'bg-green-600'
			case 'medium' as TaskPriorities:
				return 'bg-yellow-500'
			case 'high' as TaskPriorities:
				return 'bg-red-600'
			default:
				return 'bg-yellow-500'
		}
	}

	return (
		<div className='flex justify-between items-center gap-8 py-2 px-4 border-b border-gray-200 overflow-x-auto'>
			<div className='flex-1 flex-wrap sm:flex-nowrap flex items-center gap-1'>
				<div className='flex-1 flex items-center gap-3'>
					<div className={`w-[5px] h-5 rounded-sm flex-shrink-0 ${priorityClass(priorityValue)}`}></div>
					{isEdit ? (
						<div className='flex gap-3 flex-1 items-center'>
							<div className='flex flex-col gap-1 text-gray flex-1'>
								<label className='text-zinc-600' htmlFor={`contentInput-${task._id}`}>
									{t('content')}
								</label>
								<input
									id={`contentInput-${task._id}`}
									className='px-3 py-1 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									type='text'
									value={contentValue}
									onChange={e => setContentValue(e.target.value)}
								/>
							</div>
							<div className='flex flex-col gap-1'>
								<label className='text-zinc-600' htmlFor='prioritySelect'>
									{t('priority')}
								</label>
								<select
									name='prioritySelect'
									id='prioritySelect'
									className='px-3 py-1 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									value={taskData.priority}
									onChange={e => setPriorityValue(e.target.value as TaskPriorities)}>
									<option className='text-gray-800 bg-white hover:bg-gray-100' value='low'>
										{t('low')}
									</option>
									<option className='text-gray-800 bg-white hover:bg-gray-100' value='medium'>
										{t('medium')}
									</option>
									<option className='text-gray-800 bg-white hover:bg-gray-100' value='high'>
										{t('high')}
									</option>
								</select>
							</div>
							<div className='flex flex-col gap-1 text-zinc-600'>
								<label className='text-zinc-600' htmlFor='expirationDate'>
									{t('expire_at')}
								</label>
								<input
									className='px-3 py-1 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									type='date'
									value={expirationValue}
									onChange={e => setExpirationValue(e.target.value)}
								/>
							</div>
						</div>
					) : (
						<>
							<input
								type='checkbox'
								id={`task-${taskData._id}`}
								checked={taskData.is_done}
								className='w-4 h-4 bg-gray-100 border-gray-300 flex-shrink-0'
								onChange={() => updateTask('toggle')}
							/>
							<label
								htmlFor={`task-${taskData._id}`}
								className={`${taskData.is_done ? 'line-through text-zinc-400' : ''}`}>
								{taskData.content}
							</label>
						</>
					)}
				</div>
				{tasksSettings && tasksSettings.showDeadline && expirationValue && !isEdit && (
					<div className='flex gap-2 items-center text-zinc-600 flex-shrink-0'>
						<Clock size={16} />
						{expirationValue}
					</div>
				)}
			</div>
			<div className='flex gap-2 items-center'>
				{isEdit && (
					<Button variant='success' onlyIcon={true} onClick={() => updateTask('update')}>
						<Check size={16} />
					</Button>
				)}
				{!isEdit && !isArchive && (
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
