import { Menu } from '../Menu/Menu'
import { Outlet } from 'react-router-dom'

export const PageWrapper = () => {
	return (
		<div className='page-wrapper'>
			<Menu />
			<div className='flex-1 content-container'>
				<Outlet />
			</div>
		</div>
	)
}
