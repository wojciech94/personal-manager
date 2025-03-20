import { useEffect, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import underconstruction from '../../assets/underconstruction.json'
import { JsonAnimation } from '../../components/JsonAnimation/JsonAnimation'
import { useModalContext } from '../../contexts/ModalContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { ModalDataProps, DataProps } from '../../components/Modal/types'
import { Button } from '../../components/Button/Button'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { ChevronLeft, ChevronRight, X } from 'react-feather'

interface Event {
	_id: string
	title: string
	description: string
	startDate: string
	endDate: string | null
	location: string | null
	allDay: boolean
	tags: string[]
	createdAt: string
	updatedAt: string
}

export interface DateData {
	date: string
	day: number
	isCurrentMonth: boolean
	events: Event[]
}

export const CalendarMonth = () => {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [events, setEvents] = useState<Event[]>([])
	const [currentDate, setCurrentDate] = useState(new Date())
	const { setActiveModal } = useModalContext()
	const { t } = useTranslation()
	const { fetchData } = useApi()
	const { dashboardId, year, month } = useParams()

	const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thurstday', 'Friday', 'Saturday', 'Sunday']

	useEffect(() => {
		fetchEvents()
	}, [])

	useEffect(() => {
		setCurrentDate(new Date(parseInt(year ?? '2023'), parseInt(month ?? '1') - 1))
	}, [year, month])

	const fetchEvents = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/events`
		const response = await fetchData<Event[]>(url)

		if (response.error) {
			console.error('Failed to fetch events: ', response.status, response.error)
			return
		}

		if (response.data) {
			const data = response.data
			setEvents(data)
		}
	}

	const deleteEvent = async (eventId: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/events/${eventId}`
		const options = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		}

		const response = await fetchData<[]>(url, options)

		if (response.error) {
			console.error('Failed to remove event: ', response.status, response.error)
			return
		}

		await fetchEvents()
	}

	const getPreviousMonth = () => {
		const previousMonth = new Date(currentDate)
		previousMonth.setMonth(previousMonth.getMonth() - 1)
		setCurrentDate(previousMonth)
	}

	const getNextMonth = () => {
		const nextMonth = new Date(currentDate)
		nextMonth.setMonth(nextMonth.getMonth() + 1)
		setCurrentDate(nextMonth)
	}

	const getDaysInMonthWithEvents = () => {
		if (!year || !month) {
			return []
		}
		const yearNum = Number(year)
		const monthNum = Number(month)
		const daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate()
		const firstDayOfMonth = new Date(yearNum, monthNum, 1).getDay()
		const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

		const calendarDays = []

		const prevMonthDays = startingDay
		const lastMonthLastDay = new Date(yearNum, monthNum, 0).getDate()

		for (let i = 0; i < prevMonthDays; i++) {
			const day = lastMonthLastDay - prevMonthDays + i + 1
			const prevMonth = monthNum === 0 ? 11 : monthNum - 1
			const prevMonthYear = monthNum === 0 ? yearNum - 1 : year
			const date = `${prevMonthYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${(
				lastMonthLastDay -
				prevMonthDays +
				i +
				1
			)
				.toString()
				.padStart(2, '0')}`

			calendarDays.push({
				date,
				day,
				isCurrentMonth: false,
				events: events.filter(event => event.startDate.slice(0, 10) === date),
			})
		}

		for (let i = 1; i <= daysInMonth; i++) {
			const date = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`
			calendarDays.push({
				date,
				day: i,
				isCurrentMonth: true,
				events: events.filter(event => event.startDate.slice(0, 10) === date),
			})
		}

		while (calendarDays.length % 7 !== 0) {
			const nextMonthDay: number = calendarDays.length - daysInMonth - prevMonthDays + 1
			const nextMonth = monthNum === 11 ? 0 : monthNum + 1
			const nextMonthYear = monthNum === 11 ? yearNum + 1 : yearNum
			const date = `${nextMonthYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${nextMonthDay
				.toString()
				.padStart(2, '0')}`

			calendarDays.push({
				date,
				day: nextMonthDay,
				isCurrentMonth: false,
				events: events.filter(event => event.startDate.slice(0, 10) === date),
			})
		}

		return calendarDays
	}

	const formatMonth = (date: Date) => {
		return date.toLocaleString('en-EN', { month: 'long', year: 'numeric' })
	}

	const days: DateData[] = getDaysInMonthWithEvents()

	const handleSetSelectedDay = (day: number | null) => {
		if (!day) {
			setSelectedDate(null)
		}
	}

	const addEventModalData: ModalDataProps = {
		name: 'addCalendarEvent',
		title: t('add_event'),
	}

	const handleSetModal = (data: DateData) => {
		const dataProps: DataProps = {
			dateData: data,
			fetchAction: fetchEvents,
		}
		addEventModalData.data = dataProps
		setActiveModal(addEventModalData)
	}

	const goToPrevMonth = () => {
		if (year && month) {
			const monthNum = Number(month)
			if (monthNum > 0) {
				return `${year}/${(monthNum - 1).toString().padStart(2, '0')}`
			} else {
				const yearNum = Number(year)
				return `${yearNum - 1}/11`
			}
		} else {
			console.error('Year and month are a required params')
		}
	}

	const goToNextMonth = () => {
		if (year && month) {
			const monthNum = Number(month)
			if (monthNum < 12) {
				return `${year}/${(monthNum + 1).toString().padStart(2, '0')}`
			} else {
				const yearNum = Number(year)
				return `${yearNum + 1}/01`
			}
		} else {
			console.error('Year and month are required params')
		}
	}

	return (
		<div className='flex flex-1'>
			<div className='flex flex-1 flex-col gap-2'>
				<div className='flex flex-col flex-1 bg-white border border-slate-500 px-6 py-4 rounded-lg'>
					<div className='flex justify-between items-center mb-4 '>
						<NavLink
							to={`/dashboards/${dashboardId}/calendar/month/${goToPrevMonth()}`}
							className={
								'flex justify-center items-center w-6 h-6 p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer'
							}>
							<ChevronLeft size={16} />
						</NavLink>
						<div className='font-medium'>{formatMonth(currentDate)}</div>
						<NavLink
							to={`/dashboards/${dashboardId}/calendar/month/${goToNextMonth()}`}
							className={
								'flex justify-center items-center w-6 h-6 p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer'
							}>
							<ChevronRight size={16} />
						</NavLink>
					</div>
					<div className='grid grid-cols-7 gap-1'>
						{daysOfWeek.map(day => (
							<div key={day} className='bg-gray-100 text-center font-medium text-sm flex items-center justify-center'>
								{day}
							</div>
						))}
					</div>
					<div className='grid grid-cols-7 gap-1 flex-1 items-stretch py-4'>
						{days.map((d, index) => {
							return (
								<div
									key={index}
									className='group flex flex-col justify-start border border-gray-400 rounded-md p-1 min-h-[87px] max-h-[135px] overflow-hidden'>
									<div
										className={`flex items-center justify-center text-sm rounded-full ${
											d.day === null ? 'invisible' : 'cursor-pointer'
										} ${!d.isCurrentMonth ? 'text-gray-500' : ''} 
              `}
										onClick={() => handleSetSelectedDay(d.day)}>
										{d.day}
									</div>
									{d.events &&
										d.events.length > 0 &&
										d.events.map(e => {
											return (
												<div className='flex justify-between items-center gap-1 text-sm' key={e.title}>
													<div>{e.title}</div>
													<X
														className='cursor-pointer hover:text-rose-700'
														size={14}
														onClick={() => deleteEvent(e._id)}
													/>
												</div>
											)
										})}
									<Button
										className='mt-1 opacity-0 group-hover:opacity-100 transition-all! duration-300 px-2 py-1 group-hover:cursor-pointer'
										onClick={() => handleSetModal(d)}>
										{t('add_event')}
									</Button>
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}
