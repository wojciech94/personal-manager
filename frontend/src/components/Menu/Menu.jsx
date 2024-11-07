import { NavLink, useParams } from 'react-router-dom'

export const Menu = () => {
	const { dashboardId } = useParams()

	return (
		<div className='menu'>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
				to={`/dashboard/${dashboardId}/todo`}>
				To do list
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
				to={`/dashboard/${dashboardId}/notes`}>
				Notes
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
				to={`/dashboard/${dashboardId}/shoppinglist`}>
				Shopping list
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
				to={`/dashboard/${dashboardId}/linktree`}>
				linktree
			</NavLink>
		</div>
	)
}
