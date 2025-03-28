import { Menu } from '../Menu/Menu'
import { Outlet } from 'react-router-dom'

export const PageWrapper = () => {
	return (
		<div className='flex flex-col gap-4 p-5 sm:flex-row sm:justify-between'>
			<Menu />
			<div className='flex-1 sm:w-[calc(100%-200px-1.25rem)] max-w-[1200px] sm:mx-auto'>
				<Outlet />
			</div>
		</div>
	)
}
