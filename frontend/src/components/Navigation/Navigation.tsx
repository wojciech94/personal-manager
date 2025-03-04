import { NavLink } from 'react-router-dom'
import { NavigationProps } from '../../types/dashboard'

export const Dashboards: React.FC<NavigationProps> = ({ dashboards }) => {
	return (
		<nav className='d-flex flex-1 gap-5 justify-center align-center py-1'>
			{dashboards &&
				dashboards.length > 0 &&
				dashboards.map(d => (
					<NavLink
						className={({ isActive }) => `link text-bold fs-lg ${isActive ? 'active' : ''}`}
						key={d._id}
						to={`/dashboards/${d._id}`}>
						{d.name}
					</NavLink>
				))}
		</nav>
	)
}
