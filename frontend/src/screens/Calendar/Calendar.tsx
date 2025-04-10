import { NavLink, Outlet, useParams } from 'react-router-dom'
import { useTranslation } from '../../contexts/TranslationContext'
import { getWeekNumber } from '../../utils/datetime'

export interface Event {
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

export const Calendar = () => {
	const { dashboardId, year, month, week, day } = useParams()
	const { t } = useTranslation()

	const currentYear = year ? year : new Date().getFullYear()
	const currentMonth = month ? month : (new Date().getMonth() + 1).toString().padStart(2, '0')
	const currentDay = day ? day : new Date().getDate().toString().padStart(2, '0')
	const currentWeek = week ? week : getWeekNumber(new Date())

	const basePath = `/dashboards/${dashboardId}/calendar`

	const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
		isActive ? 'text-sky-700 font-semibold' : 'text-gray-900 hover:text-sky-800'

	return (
		<div className='flex flex-1 flex-col gap-4 mb-6'>
			<div className='flex gap-4'>
				<div className='flex gap-4 items-center scroll-x-auto'>
					<NavLink className={getNavLinkClass} to={`${basePath}/month/${currentYear}/${currentMonth}`}>
						{t('month')}
					</NavLink>
					<NavLink className={getNavLinkClass} to={`${basePath}/week/${currentYear}/${currentWeek}`}>
						{t('week')}
					</NavLink>
					<NavLink className={getNavLinkClass} to={`${basePath}/day/${currentYear}/${currentMonth}/${currentDay}`}>
						{t('day')}
					</NavLink>
				</div>
			</div>
			<Outlet />
		</div>
	)
}
