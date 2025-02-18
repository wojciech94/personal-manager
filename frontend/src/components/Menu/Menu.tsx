import { NavLink, useParams } from 'react-router-dom'

export const Menu = () => {
	const { dashboardId } = useParams()

	return (
		<div className='menu'>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
				to={`/dashboards/${dashboardId}`}
				end>
				Details
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
				to={`/dashboards/${dashboardId}/shopping`}>
				Shopping
			</NavLink>
			<NavLink
				className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
				to={`/dashboards/${dashboardId}/community`}>
				Community
			</NavLink>
		</div>
	)
}
