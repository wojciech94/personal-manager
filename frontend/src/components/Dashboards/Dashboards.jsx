import { NavLink } from 'react-router-dom'

export const Dashboards = ({ dashboards }) => {
	return (
		<div className='d-flex flex-1 gap-5 justify-center align-center'>
			{dashboards &&
				dashboards.length > 0 &&
				dashboards.map(d => (
					<NavLink className={({ isActive }) => (isActive ? 'active' : '')} key={d._id} to={`/dashboards/${d._id}`}>
						{d.name}
					</NavLink>
				))}
		</div>
	)
}
