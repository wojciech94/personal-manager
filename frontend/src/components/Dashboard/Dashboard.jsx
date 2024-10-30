import { useParams } from 'react-router-dom'
import { Menu } from '../Menu/Menu'
import { Outlet } from 'react-router-dom'

export const Dashboard = () => {
	return (
		<div className='d-flex justify-between gap-5'>
			<Menu />
			<div className='flex-1 max-w-1200px mx-auto p-5'>
				<Outlet />
			</div>
		</div>
	)
}
