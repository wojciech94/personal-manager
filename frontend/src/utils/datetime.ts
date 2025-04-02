import { DateData, Event } from '../screens/Calendar/Calendar'

export function getLocaleDateTime(date: string) {
	const newDate = new Date(date)
	const hours = newDate.getHours().toString().padStart(2, '0')
	const minutes = newDate.getMinutes().toString().padStart(2, '0')
	const dateTime = `${newDate.toLocaleDateString()} ${hours}:${minutes}`
	return dateTime
}

export const formatMonth = (date: Date) => {
	return date.toLocaleString('en-EN', { month: 'long', year: 'numeric' })
}

export const dateWithoutHours = (date: Date) => {
	const year = date.getFullYear()
	const month = (date.getMonth() + 1).toString().padStart(2, '0')
	const day = date.getDate().toString().padStart(2, '0')
	return `${year}-${month}-${day}`
}

export const getWeekNumber = (date: Date): number => {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
	const dayNum = d.getUTCDay() || 7
	d.setUTCDate(d.getUTCDate() + 4 - dayNum)
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
	const diffInMs = d.getTime() - yearStart.getTime()
	return Math.ceil((diffInMs / 86400000 + 1) / 7)
}

export const getWeeksArrayForMonth = (year: number, month: number): number[] => {
	const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1))
	const lastDayOfMonth = new Date(Date.UTC(year, month, 0))

	const startDate = new Date(firstDayOfMonth)
	while (startDate.getUTCDay() !== 1) {
		startDate.setUTCDate(startDate.getUTCDate() - 1)
	}

	const endDate = new Date(lastDayOfMonth)
	if (endDate.getUTCDay() !== 1) {
		while (endDate.getUTCDay() !== 1) {
			endDate.setUTCDate(endDate.getUTCDate() + 1)
		}
	}

	const weeksArray: number[] = []
	let currentDate = new Date(startDate)

	while (currentDate <= endDate) {
		const weekNum = getWeekNumber(currentDate)
		const weekStart = new Date(currentDate)
		const weekEnd = new Date(currentDate)
		weekEnd.setUTCDate(weekEnd.getUTCDate() + 6)

		const isInMonth =
			(weekStart.getUTCFullYear() === year && weekStart.getUTCMonth() === month - 1) ||
			(weekEnd.getUTCFullYear() === year && weekEnd.getUTCMonth() === month - 1) ||
			(weekStart < firstDayOfMonth && weekEnd >= firstDayOfMonth) ||
			(weekStart <= lastDayOfMonth && weekEnd > lastDayOfMonth)

		if (isInMonth) {
			weeksArray.push(weekNum)
		}
		currentDate.setUTCDate(currentDate.getUTCDate() + 7)
	}

	return weeksArray
}

export const getDaysInMonthWithEvents = (year: number, month: number, events: Event[] = []): DateData[] => {
	const currentDate = new Date()
	const yearNum = year || currentDate.getFullYear()
	const monthNum = month - 1

	const daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate()
	const firstDayOfMonth = new Date(yearNum, monthNum, 1).getDay()

	const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

	const calendarDays = []

	const prevMonthDays = startingDay
	const lastMonthLastDay = new Date(yearNum, monthNum, 0).getDate()

	for (let i = 0; i < prevMonthDays; i++) {
		const day = lastMonthLastDay - prevMonthDays + i + 1
		const prevMonth = monthNum === 0 ? 11 : monthNum - 1
		const prevMonthYear = monthNum === 0 ? yearNum - 1 : yearNum
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
		const date = `${yearNum}-${month.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`
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
