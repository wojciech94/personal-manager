import { NavLink, useParams } from 'react-router-dom'

export const Menu = () => {
	const { dashboardId } = useParams()

	return (
		<div className='w-300px d-flex flex-column gap-5 p-5'>
			<NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={`/dashboard/${dashboardId}/todo`}>
				To do list
			</NavLink>
			<NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={`/dashboard/${dashboardId}/notes`}>
				Notes
			</NavLink>
			<NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={`/dashboard/${dashboardId}/shoppinglist`}>
				Shopping list
			</NavLink>
			<NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={`/dashboard/${dashboardId}/linktree`}>
				linktree
			</NavLink>
		</div>
	)
}
