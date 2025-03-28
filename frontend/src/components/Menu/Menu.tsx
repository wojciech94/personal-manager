import { NavLink, useParams } from 'react-router-dom'
import { useTranslation } from '../../contexts/TranslationContext'

export const Menu = () => {
	const { dashboardId } = useParams()
	const { t } = useTranslation()

	return (
		<div className='flex rounded-xl border border-zinc-300 overflow-x-auto shadow-md sm:w-[150px] sm:flex-col sm:self-start sm:flex-shrink-0 sm:overflow-hidden'>
			<NavLink
				className={({ isActive }) =>
					`fflex-1 relative p-3 bg-sky-50 transition-colors whitespace-nowrap text-center sm:text-start hover:text-blue-500 ${
						isActive ? 'font-semibold text-blue-500' : ''
					}`
				}
				to={`/dashboards/${dashboardId}`}
				end>
				{t('details')}
			</NavLink>
			<NavLink
				className={({ isActive }) =>
					`fflex-1 relative p-3 bg-sky-50 transition-colors whitespace-nowrap text-center sm:text-start hover:text-blue-500 ${
						isActive ? 'font-semibold text-blue-500' : ''
					}`
				}
				to={`/dashboards/${dashboardId}/calendar`}>
				{t('calendar')}
			</NavLink>
			<NavLink
				className={({ isActive }) =>
					`fflex-1 relative p-3 bg-sky-50 transition-colors whitespace-nowrap text-center sm:text-start hover:text-blue-500 ${
						isActive ? 'font-semibold text-blue-500' : ''
					}`
				}
				to={`/dashboards/${dashboardId}/todo`}>
				{t('todo_list')}
			</NavLink>
			<NavLink
				className={({ isActive }) =>
					`fflex-1 relative p-3 bg-sky-50 transition-colors whitespace-nowrap text-center sm:text-start hover:text-blue-500 ${
						isActive ? 'font-semibold text-blue-500' : ''
					}`
				}
				to={`/dashboards/${dashboardId}/folders/notes`}>
				{t('notes')}
			</NavLink>
			<NavLink
				className={({ isActive }) =>
					`fflex-1 relative p-3 bg-sky-50 transition-colors whitespace-nowrap text-center sm:text-start hover:text-blue-500 ${
						isActive ? 'font-semibold text-blue-500' : ''
					}`
				}
				to={`/dashboards/${dashboardId}/shopping`}>
				{t('shopping')}
			</NavLink>
			<NavLink
				className={({ isActive }) =>
					`fflex-1 relative p-3 bg-sky-50 transition-colors whitespace-nowrap text-center sm:text-start hover:text-blue-500 ${
						isActive ? 'font-semibold text-blue-500' : ''
					}`
				}
				to={`/dashboards/${dashboardId}/posts`}>
				{t('community')}
			</NavLink>
		</div>
	)
}
