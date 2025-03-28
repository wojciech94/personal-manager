import { NavLink } from 'react-router-dom'
import { NavigationProps } from '../../types/dashboard'
import React from 'react'

export const Dashboards: React.FC<NavigationProps> = ({ dashboards }) => {
	return (
		<nav className='flex flex-1 gap-5 justify-center items-center py-1'>
			{dashboards &&
				dashboards.length > 0 &&
				dashboards.map(d => (
					<NavLink
						className={({ isActive }) => `font-semibold text-lg transition-colors ${isActive ? 'text-blue-500' : ''}`}
						key={d._id}
						to={`/dashboards/${d._id}`}>
						{d.name}
					</NavLink>
				))}
		</nav>
	)
}
