import { NavLink, useParams } from 'react-router-dom'
import { useTranslation } from '../../contexts/TranslationContext'

export const Menu = () => {
	const { dashboardId } = useParams()
	const { t } = useTranslation()

	return (
		<div className='menu'>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active font-semibold' : ''}`}
				to={`/dashboards/${dashboardId}`}
				end>
				{t('details')}
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active font-semibold' : ''}`}
				to={`/dashboards/${dashboardId}/calendar`}>
				{t('calendar')}
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active font-semibold' : ''}`}
				to={`/dashboards/${dashboardId}/todo`}>
				{t('todo_list')}
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active font-semibold' : ''}`}
				to={`/dashboards/${dashboardId}/folders/notes`}>
				{t('notes')}
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active font-semibold' : ''}`}
				to={`/dashboards/${dashboardId}/shopping`}>
				{t('shopping')}
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active font-semibold' : ''}`}
				to={`/dashboards/${dashboardId}/posts`}>
				{t('community')}
			</NavLink>
		</div>
	)
}
