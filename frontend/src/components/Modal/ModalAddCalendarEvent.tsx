import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'
import { useEffect, useState } from 'react'
import { API_URL } from '../../config'
import { useParams } from 'react-router-dom'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { TimePicker } from '../TimePicker/TimePicker'
import { TaskType, TodoGroup } from '../Task/types'

export const ModalAddCalendarEvent = ({ modalData }: { modalData: DataProps }) => {
	const [title, setTitle] = useState('')
	const [hour, setHour] = useState('12:00')
	const [description, setDescription] = useState('')
	const [addToTodos, setAddToTodos] = useState(false)
	const [priorityValue, setPriorityValue] = useState('medium')
	const [expiredDate, setExpiredDate] = useState('')
	const [taskGroup, setTaskGroup] = useState<string>('')
	const [groups, setGroups] = useState<TodoGroup[]>([])
	const { t } = useTranslation()
	const { dashboardId } = useParams()
	const { fetchData } = useApi()
	const { setActiveModal } = useModalContext()

	useEffect(() => {
		const fetchTodoGroups = async () => {
			const url = `${API_URL}dashboards/${dashboardId}/tasks-groups`
			const response = await fetchData<TodoGroup[]>(url)

			if (response.error) {
				console.error('Failed to fetch dashboard tasks group', response.status, response.error)
				setGroups([])
				return
			}

			if (response.data) {
				setGroups(response.data)
				setTaskGroup(response.data[0]._id)
			}
		}

		fetchTodoGroups()
	}, [dashboardId])

	const handleTimeChange = (time: string) => {
		setHour(time)
	}

	const addEvent = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/events`
		const dateTime = `${modalData.dateData?.date}T${hour}:00`
		const fullStartDate = new Date(dateTime)
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title: title,
				description: description,
				startDate: fullStartDate,
			}),
		}

		setActiveModal(null)
		const response = await fetchData<[]>(url, options)
		if (response.error) {
			console.error('Failed to create event:', response.status, response.error)
			return
		}

		if (modalData.fetchAction && typeof modalData.fetchAction === 'function' && modalData.fetchAction.length === 0) {
			const action = modalData.fetchAction as () => Promise<void>
			action()
		}

		if (addToTodos) {
			const url = `${API_URL}dashboards/${dashboardId}/add-task`
			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					content: title,
					priority: priorityValue,
					groupId: taskGroup,
					expirationDate: expiredDate,
				}),
			}
			const response = await fetchData<TaskType>(url, options)

			if (response.error) {
				console.error('Failed to add task:', response.status, response.error)
			}

			if (response.data) {
				if (modalData?.action && modalData.action.length === 0) {
					const action = modalData.action as () => Promise<void>
					action()
				} else {
					console.error('Unexpected function type: arugments not passed')
				}
			}
		}
	}

	return (
		<>
			<div className='p-4 flex flex-col gap-2 border-t border-zinc-300'>
				<FormRow label={t('title')} required>
					<input
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						type='text'
						value={title}
						onChange={e => setTitle(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('date')}>
					<div className='font-medium'>{modalData.dateData?.date}</div>
				</FormRow>
				<FormRow label={t('hour')}>
					<TimePicker onTimeChange={handleTimeChange} />
				</FormRow>
				<FormRow className='!items-start' label={t('description')}>
					<textarea
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y'
						value={description}
						onChange={e => setDescription(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('add_to_todos')}>
					<input
						type='checkbox'
						className='w-4 h-4 bg-gray-100 border-gray-300'
						checked={addToTodos}
						onChange={e => setAddToTodos(e.target.checked)}
					/>
				</FormRow>
				{addToTodos && (
					<>
						<FormRow label={t('priority')}>
							<select
								className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 align-self-start'
								name='prioritySelect'
								value={priorityValue}
								id='prioritySelect'
								onChange={e => setPriorityValue(e.target.value)}>
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
						</FormRow>
						<FormRow label={t('group')}>
							<select
								className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 align-self-start'
								name='taskSelect'
								id='taskSelect'
								value={taskGroup}
								onChange={e => setTaskGroup(e.target.value)}>
								{groups &&
									groups.length > 0 &&
									groups.map(g => (
										<option className='text-gray-800 bg-white hover:bg-gray-100' key={g._id} value={g._id}>
											{g.name}
										</option>
									))}
							</select>
						</FormRow>
						<FormRow label={t('deadline')} className='mb-2'>
							<input
								className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 align-self-start'
								type='date'
								value={expiredDate}
								onChange={e => setExpiredDate(e.target.value)}
							/>
						</FormRow>
					</>
				)}
			</div>
			<div className='py-4 px-6 border-t border-slate-300 bg-zinc-200 rounded-b-2xl'>
				<Button variant='success' className='w-full' onClick={addEvent}>
					{t('add_event')}
				</Button>
			</div>
		</>
	)
}
