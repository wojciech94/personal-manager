/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { useModalContext } from '../../contexts/ModalContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { ModalDataProps, DataProps } from '../../components/Modal/types'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { ChevronLeft, ChevronRight, X } from 'react-feather'
import {
	dateWithoutHours,
	formatMonth,
	getWeekNumber,
	getDaysInMonthWithEvents,
	getWeeksArrayForMonth,
} from '../../utils/datetime'
import { DateData, Event } from './Calendar'
import { Button } from '../../components/Button/Button'

export const CalendarMonth = () => {
	const [events, setEvents] = useState<Event[]>([])
	const { setActiveModal } = useModalContext()
	const { t, language } = useTranslation()
	const { fetchData } = useApi()
	const { dashboardId, year, month } = useParams()
	const navigate = useNavigate()
	const currentDate = new Date()
	const currentWeek = getWeekNumber(currentDate)

	const daysOfWeek = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')]
	const shortDaysOfWeek = [t('mo'), t('tu'), t('we'), t('th'), t('fr'), t('sa'), t('su')]

	useEffect(() => {
		fetchEvents()
	}, [])

	const fetchEvents = useCallback(async () => {
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
	}, [])

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

	const handleSetSelectedDay = (date: string) => {
		const [yy, mm, dd] = dateWithoutHours(new Date(date)).split('-')
		navigate(`/dashboards/${dashboardId}/calendar/day/${yy}/${mm.padStart(2, '0')}/${dd.padStart(2, '0')}`)
	}

	const addEventModalData: ModalDataProps = {
		name: 'addCalendarEvent',
		title: t('add_event'),
	}

	const handleSetAddEventModal = (data: DateData) => {
		const dataProps: DataProps = {
			dateData: data,
			fetchAction: fetchEvents,
		}
		addEventModalData.data = dataProps
		setActiveModal(addEventModalData)
	}

	const handleSetUpdateEventModal = (e: React.MouseEvent<HTMLButtonElement>, event: Event) => {
		e.stopPropagation()
		const updateEventModalData: ModalDataProps = {
			name: 'updateCalendarEvent',
			title: t('update_event'),
			data: {
				eventData: event,
				fetchAction: fetchEvents,
			},
		}
		setActiveModal(updateEventModalData)
	}

	const goToPrevMonth = () => {
		if (year && month) {
			const monthNum = Number(month)
			if (monthNum > 1) {
				return `${year}/${(monthNum - 1).toString().padStart(2, '0')}`
			} else {
				const yearNum = Number(year)
				return `${yearNum - 1}/12`
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

	const currentMonth =
		year && month
			? formatMonth(new Date(Number(year), Number(month) - 1), language)
			: formatMonth(currentDate, language)

	const days: DateData[] = useMemo(
		() => getDaysInMonthWithEvents(Number(year), Number(month), events),
		[year, month, events]
	)

	const weeksInMonth = useMemo(() => getWeeksArrayForMonth(Number(year), Number(month)), [year, month])
	const weeksRowClass = weeksInMonth.length === 5 ? 'grid-rows-5' : 'grid-rows-6'

	return (
		<div className='flex flex-col flex-1 bg-white border border-zinc-400 p-1 sm:px-6 sm:py-4 rounded-lg text-xs sm:text-sm'>
			<div className='flex justify-between items-center mb-2 sm:mb-4 '>
				<NavLink
					to={`/dashboards/${dashboardId}/calendar/month/${goToPrevMonth()}`}
					className={
						'flex justify-center items-center w-6 h-6 p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer'
					}>
					<ChevronLeft size={16} />
				</NavLink>
				<div className='font-medium text-lg'>{currentMonth}</div>
				<NavLink
					to={`/dashboards/${dashboardId}/calendar/month/${goToNextMonth()}`}
					className={
						'flex justify-center items-center w-6 h-6 p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer'
					}>
					<ChevronRight size={16} />
				</NavLink>
			</div>
			<div className='ml-6 sm:ml-8 grid grid-cols-7 gap-1'>
				{daysOfWeek.map(day => (
					<div key={day} className='hidden sm:flex bg-gray-100 text-center font-medium   items-center justify-center'>
						{day}
					</div>
				))}
				{shortDaysOfWeek.map(day => (
					<div key={day} className='sm:hidden bg-gray-100 text-center font-medium flex items-center justify-center'>
						{day}
					</div>
				))}
			</div>
			<div className='flex flex-1'>
				<div className='grid grid-cols-1 gap-[2px] py-2 sm:py-4 w-6 sm:w-8'>
					{weeksInMonth &&
						weeksInMonth.length > 0 &&
						weeksInMonth.map(w => (
							<div key={w} className='flex flex-col align-center justify-center'>
								<Link
									className={`flex hover:bg-purple-300 duration-100 rounded-full size-5 sm:size-6 font-medium transition-colors items-center justify-center ${
										w === currentWeek ? 'bg-violet-200' : ''
									}`}
									to={`/dashboards/${dashboardId}/calendar/week/${year}/${w}`}>
									{w}
								</Link>
							</div>
						))}
				</div>
				<div className={`grid grid-cols-7 ${weeksRowClass} gap-[2px] flex-1 py-2 sm:py-4`}>
					{days.map((d, index) => {
						const tempDate = new Date(d.date)
						const isCurrentDay = dateWithoutHours(tempDate) === dateWithoutHours(currentDate)
						return (
							<div
								key={index}
								className='group flex flex-col justify-start border border-gray-400 rounded-md p-1 overflow-hidden'>
								<div
									className={`flex items-center justify-center w-6 h-6  rounded-full self-center cursor-pointer duration-100 bg-cyan hover:bg-purple-300 transition-colors ${
										isCurrentDay ? 'bg-violet-200 font-medium' : ''
									} ${!d.isCurrentMonth ? 'text-gray-500' : ''} 
              `}
									onClick={() => handleSetSelectedDay(d.date)}>
									{d.day}
								</div>
								<div className='flex-1 flex flex-col hover:cursor-pointer' onClick={() => handleSetAddEventModal(d)}>
									{d.events &&
										d.events.length > 0 &&
										d.events.map(event => {
											return (
												<div className='flex justify-between items-center gap-1 ' key={event.title}>
													<Button
														variant='text'
														title={event.title}
														className='overflow-hidden text-ellipsis text-nowrap !text-xs sm:!text-sm !justify-start !block !p-0'
														onClick={e => handleSetUpdateEventModal(e, event)}>
														{event.title}
													</Button>
													<X
														className='hidden sm:block flex-shrink-0 cursor-pointer hover:text-rose-700'
														size={14}
														onClick={() => deleteEvent(event._id)}
													/>
												</div>
											)
										})}
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
