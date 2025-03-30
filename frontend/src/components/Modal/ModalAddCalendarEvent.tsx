import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'
import { useState } from 'react'
import { API_URL } from '../../config'
import { useParams } from 'react-router-dom'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'

export const ModalAddCalendarEvent = ({ modalData }: { modalData: DataProps }) => {
	const [title, setTitle] = useState('')
	const [hour, setHour] = useState('')
	const [description, setDescription] = useState('')
	const { t } = useTranslation()
	const { dashboardId } = useParams()
	const { fetchData } = useApi()
	const { setActiveModal } = useModalContext()

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
	}

	return (
		<>
			<div className='p-4 flex flex-col gap-2 border-t border-zinc-300'>
				<FormRow label={t('title')} required>
					<input
						className='flex-1 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						type='text'
						value={title}
						onChange={e => setTitle(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('date')}>
					<div className='font-medium'>{modalData.dateData?.date}</div>
				</FormRow>
				<FormRow label={t('hour')}>
					<input
						className='flex-1 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						type='text'
						value={hour}
						onChange={e => setHour(e.target.value)}
					/>
				</FormRow>
				<FormRow className='!items-start' label={t('description')}>
					<textarea
						className='flex-1 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y'
						value={description}
						onChange={e => setDescription(e.target.value)}
					/>
				</FormRow>
			</div>
			<div className='py-4 px-6 border-t border-slate-300 bg-zinc-200 rounded-b-2xl'>
				<Button variant='success' className='w-full' onClick={addEvent}>
					{t('add_event')}
				</Button>
			</div>
		</>
	)
}
