import { NavLink, useParams } from 'react-router-dom'

export const Menu = () => {
	const { dashboardId } = useParams()

	return (
		<div className='menu'>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
				to={`/dashboards/${dashboardId}`} end>
				Details
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
				to={`/dashboards/${dashboardId}/calendar`}>
				Calendar
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
				to={`/dashboards/${dashboardId}/todo`}>
				To do list
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
				to={`/dashboards/${dashboardId}/folders/notes`}>
				Notes
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
				to={`/dashboards/${dashboardId}/shoppinglist`}>
				Shopping list
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
				to={`/dashboards/${dashboardId}/linktree`}>
				linktree
			</NavLink>
		</div>
	)
}