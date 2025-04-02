import React, { useEffect, useState } from 'react'

interface TimePickerProps {
	onTimeChange: (time: string) => void
	initTime?: string
}

export const TimePicker = ({ onTimeChange, initTime }: TimePickerProps) => {
	const [hours, setHours] = useState('12')
	const [minutes, setMinutes] = useState('00')

	useEffect(() => {
		if (initTime) {
			setHours(initTime.split(':')[0])
			setMinutes(initTime?.split(':')[1])
		}
	}, [initTime])

	const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		const numValue = Number(value)
		if (value === '' || (/^\d{0,2}$/.test(value) && numValue <= 23)) {
			setHours(value)
			if (value !== '') onTimeChange(`${value.padStart(2, '0')}:${minutes}`)
		}
	}

	const handleHoursBlur = () => {
		const numValue = Number(hours)
		if (hours !== '' && numValue <= 23) {
			setHours(String(numValue).padStart(2, '0'))
			onTimeChange(`${String(numValue).padStart(2, '0')}:${minutes}`)
		} else if (hours === '') {
			setHours('00')
			onTimeChange(`00:${minutes}`)
		}
	}

	const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		const numValue = Number(value)
		if (value === '' || (/^\d{0,2}$/.test(value) && numValue <= 59)) {
			setMinutes(value)
			if (value !== '') onTimeChange(`${hours}:${value.padStart(2, '0')}`)
		}
	}

	const handleMinutesBlur = () => {
		const numValue = Number(minutes)
		if (minutes !== '' && numValue <= 59) {
			setMinutes(String(numValue).padStart(2, '0'))
			onTimeChange(`${hours}:${String(numValue).padStart(2, '0')}`)
		} else if (minutes === '') {
			setMinutes('00')
			onTimeChange(`${hours}:00`)
		}
	}

	return (
		<div className='flex items-center gap-2'>
			<input
				type='number'
				value={hours}
				onChange={handleHoursChange}
				onBlur={handleHoursBlur}
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
				onBlur={handleMinutesBlur}
				min='0'
				max='59'
				className='w-16 p-2 text-center bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
				placeholder='MM'
			/>
		</div>
	)
}
