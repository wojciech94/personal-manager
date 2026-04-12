import { NavLink, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'react-feather'
import { useTranslation } from '../../contexts/TranslationContext'
import { getDaysArrayForWeek, getHoursInWeekWithEvents } from '../../utils/datetime'
import { useCallback, useEffect, useState } from 'react'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { Event } from './Calendar'

export const CalendarWeek = () => {
	const [events, setEvents] = useState<Event[]>([])
	const { dashboardId, year, week } = useParams()
	const { t } = useTranslation()
	const { fetchData } = useApi()

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

	const daysOfWeek = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')]
	const shortDaysOfWeek = [t('mo'), t('tu'), t('we'), t('th'), t('fr'), t('sa'), t('su')]

	const hours = []
	for (let i = 0; i <= 24; i++) {
		let h = i.toString().padStart(2, '0') + ':00'
		hours.push(h)
	}

	const days = getDaysArrayForWeek(Number(year), Number(week))

	const weekNum = Number(week) || 1
	const prevWeek = weekNum > 1 ? weekNum - 1 : 53
	const nextWeek = weekNum < 53 ? weekNum + 1 : 1
	const prevYear = weekNum > 1 ? Number(year) : Number(year) - 1
	const nextYear = weekNum < 53 ? Number(year) : Number(year) + 1

	const hoursArr = getHoursInWeekWithEvents(Number(year), Number(week), events)

	return (
		<div className='flex flex-col flex-1 bg-white border border-zinc-400 p-1 sm:px-6 sm:py-4 rounded-lg text-xs sm:text-sm'>
			<div className='flex justify-between items-center mb-2 sm:mb-4 '>
				<NavLink
					to={`/dashboards/${dashboardId}/calendar/week/${prevYear}/${prevWeek}`}
					className={
						'flex justify-center items-center w-6 h-6 p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer'
					}>
					<ChevronLeft size={16} />
				</NavLink>
				<div className='font-medium text-lg'>{`${t('week')} ${week}`}</div>
				<NavLink
					to={`/dashboards/${dashboardId}/calendar/week/${nextYear}/${nextWeek}`}
					className={
						'flex justify-center items-center w-6 h-6 p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer'
					}>
					<ChevronRight size={16} />
				</NavLink>
			</div>
			<div className='ml-6 sm:ml-8 grid grid-cols-7 gap-1'>
				{daysOfWeek.map((day, index) => (
					<div
						key={day}
						className='hidden sm:flex sm:flex-col bg-gray-100 text-center font-medium items-center justify-center'>
						<span>{days[index]}</span>
						<span>{day}</span>
					</div>
				))}
				{shortDaysOfWeek.map((day, index) => (
					<div
						key={day}
						className='sm:hidden bg-gray-100 text-center font-medium flex flex-col items-center justify-center'>
						<span>{days[index]}</span>
						<span>{day}</span>
					</div>
				))}
			</div>
			<div className='flex flex-1'>
				<div className='grid grid-cols-1 gap-[2px] grid-rows-[repeat(25, minmax(0, 1fr))] py-2 sm:py-4 w-6 sm:w-8 text-xs'>
					{hours &&
						hours.map(h => (
							<div key={h} className='min-h-16'>
								{h}
							</div>
						))}
				</div>
				<div className={`grid grid-cols-7 grid-rows-[repeat(25, minmax(0, 1fr))] gap-[2px] flex-1 py-2 sm:py-4`}></div>
			</div>
		</div>
	)
}
