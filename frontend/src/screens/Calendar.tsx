import { useState } from 'react'
import underconstruction from '../assets/underconstruction.json'
import { JsonAnimation } from '../components/JsonAnimation/JsonAnimation'

export const Calendar = () => {
	const [currentDate, setCurrentDate] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)

	const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
	const times = ['12:00', '14:00', '16:30', '18:30', '20:00']

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

	const getDaysInMonth = (date: Date) => {
		const year = date.getFullYear()
		const month = date.getMonth()
		const daysInMonth = new Date(year, month + 1, 0).getDate()

		const firstDayOfMonth = new Date(year, month, 1).getDay()
		const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

		const calendarDays = []

		for (let i = 0; i < startingDay; i++) {
			calendarDays.push(null)
		}

		for (let i = 1; i <= daysInMonth; i++) {
			calendarDays.push(i)
		}

		return calendarDays
	}

	const formatMonth = (date: Date) => {
		return date.toLocaleString('en-EN', { month: 'long', year: 'numeric' })
	}

	const days = getDaysInMonth(currentDate)

	const handleSetSelectedDay = (day: number | null) => {
		if (!day) {
			setSelectedDate(null)
		}
	}

	return <JsonAnimation data={underconstruction} />

	return (
		<div className='flex flex-col gap-2 mb-6'>
			<div className='flex flex-wrap gap-6'>
				<div className='flex flex-1 flex-col gap-2'>
					<h3 className='leading-none text-custom-darkblue'>Date</h3>
					<div className='flex flex-col max-w-[326px] bg-white border border-custom-lightpurple p-6 rounded-lg'>
						<div className='flex justify-between items-center mb-4'>
							<button
								type='button'
								onClick={getPreviousMonth}
								className='p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer'>
								{'<'}
							</button>
							<div className='font-medium text-custom-darkblue'>{formatMonth(currentDate)}</div>
							<button
								type='button'
								onClick={getNextMonth}
								className='p-1 rounded-full text-gray-400 hover:bg-gray-100 rotate-180 cursor-pointer'>
								{'>'}
							</button>
						</div>

						<div className='grid grid-cols-7 gap-1'>
							{daysOfWeek.map(day => (
								<div
									key={day}
									className='text-center font-medium text-sm text-custom-darkblue h-8 flex items-center justify-center'>
									{day}
								</div>
							))}

							{days.map((day, index) => {
								const isSunday = (index + 1) % 7 === 0

								return (
									<div
										key={index}
										className={`
              h-8 w-8 text-center flex items-center justify-center justify-self-center text-sm rounded-full text-custom-darkblue
              ${day === null ? 'invisible' : 'cursor-pointer'}
              ${closed ? 'text-gray-400' : ''} 
            `}
										onClick={() => handleSetSelectedDay(day)}>
										{day}
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
					<div className='text-sm text-custom-darkblue'>{`It is ${holidayInfo}`}</div>
				</div>
			)} */}
		</div>
	)
}
