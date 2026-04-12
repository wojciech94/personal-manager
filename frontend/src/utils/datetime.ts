import { DateData, Event } from '../screens/Calendar/Calendar'
import { Language } from '../translations'

export function getLocaleDateTime(date: string) {
	const newDate = new Date(date)
	const hours = newDate.getHours().toString().padStart(2, '0')
	const minutes = newDate.getMinutes().toString().padStart(2, '0')
	const dateTime = `${newDate.toLocaleDateString()} ${hours}:${minutes}`
	return dateTime
}

export const formatMonth = (date: Date, language?: Language) => {
	const langCode = language === 'pl' ? 'pl-PL' : 'en-EN'
	return date.toLocaleString(langCode, { month: 'long', year: 'numeric' })
}

function formatDays(days: Date[]): { day: number; month: number; year: number }[] {
	return days.map(date => ({
		day: date.getUTCDate(),
		month: date.getUTCMonth() + 1,
		year: date.getUTCFullYear(),
	}))
}

export const dateWithoutHours = (date: Date) => {
	const year = date.getFullYear()
	const month = (date.getMonth() + 1).toString().padStart(2, '0')
	const day = date.getDate().toString().padStart(2, '0')
	return `${year}-${month}-${day}`
}

/**Calculates the calendar week number for a given date according to the ISO 8601 standard.
The week starts on Monday, and Week 1 is the week that contains January 4th of the year.*/
export const getCalendarWeekNumber = (date: Date): number => {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
	const dayNum = d.getUTCDay() || 7
	d.setUTCDate(d.getUTCDate() + 4 - dayNum)
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
	const diffInMs = d.getTime() - yearStart.getTime()
	return Math.ceil((diffInMs / 86400000 + 1) / 7)
}

/**
 * Calculates the week number of a given date, counting from the last Monday of the previous year.
 * Unlike ISO 8601 (where Week 1 contains January 4th), this function defines the first week as * the one starting from the last Monday of the previous year.
 */
export const getWeekNumberOfYear = (date: Date): number => {
	const year = date.getFullYear()

	const lastDayPrevYear = new Date(Date.UTC(year - 1, 11, 31))
	const dayOfWeek = lastDayPrevYear.getUTCDay() || 7
	const daysToLastMonday = dayOfWeek === 1 ? 0 : dayOfWeek - 1
	const lastMondayPrevYear = new Date(lastDayPrevYear)
	lastMondayPrevYear.setUTCDate(lastDayPrevYear.getUTCDate() - daysToLastMonday)

	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
	const diffInMs = d.getTime() - lastMondayPrevYear.getTime()
	const diffInDays = diffInMs / 86400000

	return Math.ceil(diffInDays / 7)
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
		const weekNum = getCalendarWeekNumber(currentDate)
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

export const getDaysArrayForWeek = (year: number, week: number): number[] => {
	const jan1 = new Date(Date.UTC(year, 0, 1))
	const jan1Day = jan1.getUTCDay() || 7

	const daysToFirstMonday = jan1Day === 1 ? 0 : 1 - jan1Day
	const firstMonday = new Date(jan1)
	firstMonday.setUTCDate(jan1.getUTCDate() + daysToFirstMonday)

	const weekStart = new Date(firstMonday)
	weekStart.setUTCDate(firstMonday.getUTCDate() + (week - 1) * 7)

	const days: number[] = []
	for (let i = 0; i < 7; i++) {
		const day = new Date(weekStart)
		day.setUTCDate(weekStart.getUTCDate() + i)
		days.push(day.getUTCDate())
	}

	return days
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

export const getHoursInWeekWithEvents = (year: number, week: number, events: Event[] = []): DateData[] => {
	console.log(events)

	return []
}
