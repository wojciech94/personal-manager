import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import underconstruction from '../assets/underconstruction.json'
import { JsonAnimation } from '../components/JsonAnimation/JsonAnimation'
import { useTranslation } from '../contexts/TranslationContext'

const generateMockEvents = () => {
	return [
		{ title: 'Spotkanie zespołu', date: '2025-03-30', time: '10:00', description: 'Podsumowanie marca' },
		{ title: 'Dentysta', date: '2025-04-07', time: '15:30', description: 'Wizyta kontrolna' },
		{ title: 'Urodziny Anny', date: '2025-04-15', time: null, description: 'Kup prezent!' },
		{ title: 'Warsztaty React', date: '2025-04-21', time: '18:00', description: 'Nauka nowych hooków' },
		{ title: 'Wyjazd służbowy', date: '2025-04-25', time: '07:00', description: 'Lot do Berlina' },
		{ title: 'Majówka', date: '2025-05-01', time: null, description: 'Początek długiego weekendu' },
	]
}

export const Calendar = () => {
	const [currentDate, setCurrentDate] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const { dashboardId } = useParams()
	const { t } = useTranslation()

	const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thurstday', 'Friday', 'Saturday', 'Sunday']

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

	const getDaysInMonthWithEvents = (date: Date) => {
		const year = date.getFullYear()
		const month = date.getMonth()
		const daysInMonth = new Date(year, month + 1, 0).getDate()
		const firstDayOfMonth = new Date(year, month, 1).getDay()
		const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

		const mockEvents = generateMockEvents()
		const calendarDays = []

		const prevMonthDays = startingDay
		const lastMonthLastDay = new Date(year, month, 0).getDate()

		for (let i = 0; i < prevMonthDays; i++) {
			const day = lastMonthLastDay - prevMonthDays + i + 1
			const prevMonth = month === 0 ? 11 : month - 1
			const prevMonthYear = month === 0 ? year - 1 : year
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
				events: mockEvents.filter(event => event.date === date),
			})
		}

		for (let i = 1; i <= daysInMonth; i++) {
			const date = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`
			calendarDays.push({
				date,
				day: i,
				isCurrentMonth: true,
				events: mockEvents.filter(event => event.date === date),
			})
		}

		while (calendarDays.length % 7 !== 0) {
			const nextMonthDay: number = calendarDays.length - daysInMonth - prevMonthDays + 1
			const nextMonth = month === 11 ? 0 : month + 1
			const nextMonthYear = month === 11 ? year + 1 : year
			const date = `${nextMonthYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${nextMonthDay
				.toString()
				.padStart(2, '0')}`

			calendarDays.push({
				date,
				day: nextMonthDay,
				isCurrentMonth: false,
				events: mockEvents.filter(event => event.date === date),
			})
		}

		return calendarDays
	}

	const formatMonth = (date: Date) => {
		return date.toLocaleString('en-EN', { month: 'long', year: 'numeric' })
	}

	const days = getDaysInMonthWithEvents(currentDate)

	const handleSetSelectedDay = (day: number | null) => {
		if (!day) {
			setSelectedDate(null)
		}
	}

	// return <JsonAnimation data={underconstruction} />

	return (
		<div className='flex flex-1 flex-col gap-4 mb-6'>
			<div className='flex gap-4'>
				<div className='d-flex gap-4 align-center scroll-x-auto'>
					<NavLink
						className={({ isActive }) => (isActive ? 'text-sky-700 font-semibold' : 'text-gray-900 hover:text-sky-800')}
						to={`/dashboards/${dashboardId}/calendar`}>
						{t('month')}
					</NavLink>
					<NavLink
						className={({ isActive }) => (isActive ? 'text-sky-700' : 'text-gray-900 hover:text-sky-800')}
						to={`/dashboards/${dashboardId}/calendar/week`}>
						{t('week')}
					</NavLink>
					<NavLink
						className={({ isActive }) => (isActive ? 'text-sky-700' : 'text-gray-900 hover:text-sky-800')}
						to={`/dashboards/${dashboardId}/calendar/day`}>
						{t('day')}
					</NavLink>
				</div>
			</div>
			<div className='flex flex-1 flex-wrap gap-6'>
				<div className='flex flex-1 flex-col gap-2'>
					<div className='flex flex-col flex-1 bg-white border border-slate-500 p-6 rounded-lg'>
						<div className='flex justify-between items-center mb-4 '>
							<button
								type='button'
								onClick={getPreviousMonth}
								className='p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer'>
								{'<'}
							</button>
							<div className='font-medium'>{formatMonth(currentDate)}</div>
							<button
								type='button'
								onClick={getNextMonth}
								className='p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer'>
								{'>'}
							</button>
						</div>
						<div className='grid grid-cols-7 gap-1'>
							{daysOfWeek.map(day => (
								<div key={day} className='bg-gray-100 text-center font-medium text-sm flex items-center justify-center'>
									{day}
								</div>
							))}
						</div>
						<div className='grid grid-cols-7 gap-1 flex-1 items-stretch py-4'>
							{days.map(({ day, isCurrentMonth, events }, index) => {
								const isWeekend = index % 7 >= 5
								console.log(events)
								return (
									<div key={index} className='group flex flex-col gap-1 justify-between'>
										<div
											className={`
                      flex items-center justify-center justify-self-center text-sm rounded-full
                      ${day === null ? 'invisible' : 'cursor-pointer'}
                      ${!isCurrentMonth ? 'text-gray-500' : ''} 
                    `}
											onClick={() => handleSetSelectedDay(day)}>
											{day}
										</div>
										{events && events.length > 0 && events.map(e => <div>{e.title}</div>)}
										<div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-sky-900 text-sm text-white px-2 py-1  rounded group-hover:cursor-pointer'>
											{t('add_event')}
										</div>
									</div>
								)
							})}
						</div>
					</div>
				</div>
				{/* {selectedDay && !isClosed && (
					<div className='flex flex-col gap-2'>
						<h3 className='leading-none'>Time</h3>
						<div className='flex flex-wrap gap-2 sm:flex-col'>
							{times &&
								times.map((t, id) => (
									<TimeSlot
										key={id}
										time={times[id]}
										isSelected={times[id] === selectedTime}
										setSelectedTime={setSelectedTime}>
										{t}
									</TimeSlot>
								))}
						</div>
					</div>
				)} */}
			</div>
			{/* {holidayInfo && (
				<div className='flex gap-2 w-100'>
					<img width={18} src={Info} alt='Info icon'></img>
					<div className='text-sm'>{`It is ${holidayInfo}`}</div>
				</div>
			)} */}
		</div>
	)
}
