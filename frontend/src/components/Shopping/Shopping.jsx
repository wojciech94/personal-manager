import { NavLink, Outlet } from 'react-router-dom'
import { Card } from '../Card/Card'

export function Shopping() {
	return (
		<>
			<div className='d-flex gap-3 align-center mb-4'>
				<NavLink to={'list'} className='btn btn-link'>
					List
				</NavLink>
				<NavLink to={'products'} className='btn btn-link'>
					Products
				</NavLink>
				<NavLink to={'receipts'} className='btn btn-link'>
					Receipts
				</NavLink>
			</div>
			<Card contentClass='border-none'>{<Outlet />}</Card>
		</>
	)
}
