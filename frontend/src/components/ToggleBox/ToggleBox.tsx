import { ReactNode, useState } from 'react'
import { Filter } from 'react-feather'
import { Button } from '../Button/Button'

export const ToggleBox = ({ children }: { children: ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className='toggle-box'>
			<Button variant='light' onlyIcon={true} onClick={() => setIsOpen(prevState => !prevState)}>
				<Filter size={16} />
			</Button>
			{isOpen && <div className='toggle-content'>{children}</div>}
		</div>
	)
}
