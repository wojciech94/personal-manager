import React, { useState } from 'react'

interface TimePickerProps {
	onTimeChange: (time: string) => void
}

export const TimePicker = ({ onTimeChange }: TimePickerProps) => {
	const [hours, setHours] = useState('12')
	const [minutes, setMinutes] = useState('00')

	const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		const numValue = Number(value)
		if (value === '' || (/^\d{0,2}$/.test(value) && numValue <= 23)) {
			setHours(value.padStart(2, '0'))
			onTimeChange(`${value.padStart(2, '0')}:${minutes}`)
		}
	}

	const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		const numValue = Number(value)
		if (value === '' || (/^\d{0,2}$/.test(value) && numValue <= 59)) {
			setMinutes(value.padStart(2, '0'))
			onTimeChange(`${hours}:${value.padStart(2, '0')}`)
		}
	}

	return (
		<div className='flex items-center gap-2 p-4 bg-gray-100 rounded-lg shadow-md'>
			<input
				type='number'
				value={hours}
				onChange={handleHoursChange}
				min='0'
				max='23'
				className='w-16 p-2 text-center bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
				placeholder='HH'
			/>
			<span className='text-xl font-bold'>:</span>
			<input
				type='number'
				value={minutes}
				onChange={handleMinutesChange}
				min='0'
				max='59'
				className='w-16 p-2 text-center bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
				placeholder='MM'
			/>
		</div>
	)
}
