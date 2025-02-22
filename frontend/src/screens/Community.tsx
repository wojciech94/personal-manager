import { NavLink, Outlet } from 'react-router-dom'

export const Community = () => {
	return (
		<div className='d-flex flex-column gap-4'>
			<div className='text-lg d-flex gap-3 align-center'>
				<NavLink to={'posts'}>Posts</NavLink>
				<NavLink to={'polls'}>Polls</NavLink>
			</div>
			{<Outlet />}
		</div>
	)
}
