import { NavLink, useParams } from 'react-router-dom'
import { useTranslation } from '../../contexts/TranslationContext'

export const Menu = () => {
	const { dashboardId } = useParams()
	const { t } = useTranslation()
	const basePath = `/dashboards/${dashboardId}`

	const menuItems = [
		{ name: 'details', path: `${basePath}` },
		{ name: 'calendar', path: `${basePath}/calendar` },
		{ name: 'todo_list', path: `${basePath}/todo` },
		{ name: 'notes', path: `${basePath}/folders/notes` },
		{ name: 'shopping', path: `${basePath}/shopping` },
		{ name: 'community', path: `${basePath}/posts` },
	]

	return (
		<div className='flex rounded-xl border border-zinc-300 overflow-x-auto shadow-md sm:w-[150px] sm:flex-col sm:self-start sm:flex-shrink-0 sm:overflow-hidden'>
			{menuItems.map(item => (
				<NavLink
					key={item.name}
					className={({ isActive }) =>
						`flex-1 relative p-3 bg-sky-50 transition-colors whitespace-nowrap text-center sm:text-start hover:text-blue-500 ${
							isActive ? 'font-semibold text-blue-500 bg-white' : ''
						}`
					}
					to={item.path}
					end={item.name === 'details'}>
					{t(item.name as keyof typeof t)}
				</NavLink>
			))}
		</div>
	)
}
