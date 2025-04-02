import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'

import { FormRow } from '../FormRow/FormRow'
import { TaskType, TodoGroup } from '../Task/types'
import { DataProps } from './types'

export function ModalAddTask({ modalData }: { modalData: DataProps }) {
	const [taskGroup, setTaskGroup] = useState<string>('')
	const [groups, setGroups] = useState<TodoGroup[]>([])
	const [contentValue, setContentValue] = useState('')
	const [priorityValue, setPriorityValue] = useState('medium')
	const [expiredDate, setExpiredDate] = useState('')
	const { dashboardId } = useParams()
	const { setActiveModal } = useModalContext()
	const { fetchData } = useApi()
	const { t } = useTranslation()

	useEffect(() => {
		if (modalData.groups) {
			if (modalData.initValue && typeof modalData.initValue === 'string') {
				setTaskGroup(modalData.initValue)
			} else if (modalData.groups.length > 0) {
				setTaskGroup(modalData.groups[0]._id)
			}
			setGroups(modalData.groups)
		}
	}, [modalData])

	const handleAddTask = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/add-task`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				content: contentValue,
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
		setActiveModal(null)
	}

	return (
		<>
			<div className='p-4 flex flex-col gap-2 border-t border-zinc-300 '>
				<FormRow label={t('content')}>
					<input
						required
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						type='text'
						value={contentValue}
						onChange={e => setContentValue(e.target.value)}
					/>
				</FormRow>
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
			</div>
			{modalData?.actionName && (
				<div className='py-4 px-6 border-t border-slate-300 bg-zinc-200 rounded-b-2xl'>
					<Button variant='success' className='w-full' onClick={handleAddTask}>
						{modalData.actionName}
					</Button>
				</div>
			)}
		</>
	)
}
