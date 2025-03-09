import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'

import { FormRow } from '../FormRow/FormRow'
import { TodoGroup } from '../Task/types'
import { DataProps } from './types'

export function ModalAddTask({ modalData }: { modalData: DataProps }) {
	const [taskGroup, setTaskGroup] = useState<string>('')
	const [groups, setGroups] = useState<TodoGroup[]>([])
	const [contentValue, setContentValue] = useState('')
	const [priorityValue, setPriorityValue] = useState('medium')
	const [expiredDate, setExpiredDate] = useState('')
	const { dashboardId } = useParams()
	const { setActiveModal } = useModalContext()
	const { accessToken } = useApi()
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
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/add-task`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
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
			await res.json()
			if (modalData?.action && modalData.action.length === 0) {
				const action = modalData.action as () => Promise<void>
				action()
			} else {
				console.error('Unexpected function type: arugments not passed')
			}
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
		setActiveModal(null)
	}

	return (
		<>
			<div className='card-content d-flex flex-column gap-3'>
				<FormRow label={t('content')}>
					<input
						required
						className=''
						type='text'
						value={contentValue}
						onChange={e => setContentValue(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('priority')}>
					<select
						className='align-self-start'
						name='prioritySelect'
						value={priorityValue}
						id='prioritySelect'
						onChange={e => setPriorityValue(e.target.value)}>
						<option value='low'>{t('low')}</option>
						<option value='medium'>{t('medium')}</option>
						<option value='high'>{t('high')}</option>
					</select>
				</FormRow>
				<FormRow label={t('group')}>
					<select
						className='align-self-start'
						name='taskSelect'
						id='taskSelect'
						value={taskGroup}
						onChange={e => setTaskGroup(e.target.value)}>
						{groups &&
							groups.length > 0 &&
							groups.map(g => (
								<option key={g._id} value={g._id}>
									{g.name}
								</option>
							))}
					</select>
				</FormRow>
				<FormRow label={t('deadline')} className='mb-2'>
					<input
						className='align-self-start'
						type='date'
						value={expiredDate}
						onChange={e => setExpiredDate(e.target.value)}
					/>
				</FormRow>
			</div>
			{modalData?.actionName && (
				<div className='card-footer'>
					<Button variant='success' className='w-100' onClick={handleAddTask}>
						{modalData.actionName}
					</Button>
				</div>
			)}
		</>
	)
}
