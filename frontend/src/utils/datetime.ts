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

export const getWeekNumberForFirstDayOfMonth = (year: number, month: number): number => {
	const firstDayOfMonth = new Date(year, month, 1)

	const firstDayOfYear = new Date(year, 0, 1)

	const daysDifference = Math.floor((firstDayOfMonth.getTime() - firstDayOfYear.getTime()) / (1000 * 3600 * 24))

	const weekNumber = Math.ceil((daysDifference + 1) / 7)

	return weekNumber
}
