import { NavLink, Outlet } from 'react-router-dom'
import { Card } from '../Card/Card'

export function Shopping() {
	return (
		<>
			<div className='d-flex gap-3 align-center mb-4'>
				<NavLink to={'list'} className='btn btn-link'>
					Lists
				</NavLink>
				<NavLink to={'products'} className='btn btn-link'>
					Products
				</NavLink>
			</div>
			<Card contentClass='border-none'>{<Outlet />}</Card>
		</>
	)
}
