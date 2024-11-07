import { useState } from 'react'
import { Settings } from 'react-feather'

export const ToggleBox = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className='toggle-box'>
			<button className='btn btn-light btn-icon' onClick={() => setIsOpen(prevState => !prevState)}>
				<Settings size={16} />
			</button>
			{isOpen && <div className='toggle-content'>{children}</div>}
		</div>
	)
}
