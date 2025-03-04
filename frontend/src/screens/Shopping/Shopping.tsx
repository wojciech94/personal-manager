import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card/Card'

export function Shopping() {
	const navigate = useNavigate()

	useEffect(() => {
		navigate('list')
	}, [])

	return (
		<>
			<div className='d-flex gap-3 align-center mb-4 text-lg'>
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
