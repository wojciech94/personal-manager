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

export const ModalUpdateCalendarEvent = ({ modalData }: { modalData: DataProps }) => {
	const [title, setTitle] = useState('')
	const [date, setDate] = useState(new Date().toLocaleDateString())
	const [hour, setHour] = useState('12:00')
	const [description, setDescription] = useState('')
	const { t } = useTranslation()
	const { dashboardId } = useParams()
	const { fetchData } = useApi()
	const { setActiveModal } = useModalContext()
	const eventId = modalData.eventData?._id

	useEffect(() => {
		if (modalData.eventData) {
			setTitle(modalData.eventData.title)
			setDescription(modalData.eventData.description)
			const eventDate = modalData.eventData.startDate.split('T')[0]
			setDate(eventDate)
			const startDate = new Date(modalData.eventData.startDate)
			const hours = startDate.getHours()
			const minutes = startDate.getMinutes()
			const localTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
			setHour(localTime)
		}
	}, [])

	const handleTimeChange = (time: string) => {
		setHour(time)
	}

	const updateEvent = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/events/${eventId}`
		const fullDate = `${date}T${hour}`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title,
				description,
				startDate: fullDate,
			}),
		}

		const response = await fetchData<Event>(url, options)

		setActiveModal(null)

		if (response.error) {
			console.error('Failed to update event: ', response.status, response.error)
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
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						type='text'
						value={title}
						onChange={e => setTitle(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('date')}>
					<input
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 align-self-start'
						type='date'
						value={date}
						onChange={e => setDate(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('hour')}>
					<TimePicker initTime={hour} onTimeChange={handleTimeChange} />
				</FormRow>
				<FormRow className='!items-start' label={t('description')}>
					<textarea
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y'
						value={description}
						onChange={e => setDescription(e.target.value)}
					/>
				</FormRow>
			</div>
			<div className='py-4 px-6 border-t border-slate-300 bg-zinc-200 rounded-b-2xl'>
				<Button variant='success' className='w-full' onClick={updateEvent}>
					{t('update_event')}
				</Button>
			</div>
		</>
	)
}
