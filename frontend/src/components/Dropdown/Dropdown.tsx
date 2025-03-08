import { useState } from 'react'
import { User } from 'react-feather'
import { Button } from '../Button/Button'
import { DropdownProps, ItemsProps } from './types'

export const Dropdown: React.FC<DropdownProps> = ({ items, hasNotifications }): JSX.Element => {
	const [expanded, setExpanded] = useState(false)

	const handleSetAction = (action: () => void): void => {
		setExpanded(false)
		action()
	}

	return (
		<div className='dropdown'>
			<Button variant='text' className='dropdown-btn' onClick={() => setExpanded(prevState => !prevState)}>
				<div className='dropdown-avatar'>
					<User size={20} />
					{hasNotifications && <div title='You have any notifications' className='dropdown-status'></div>}
				</div>
			</Button>
			{expanded && (
				<div className='dropdown-menu'>
					{items &&
						items.length > 0 &&
						items.map((i, idx) => (
							<DropdownItem key={idx} name={i.name} action={() => handleSetAction(i.action)}></DropdownItem>
						))}
				</div>
			)}
		</div>
	)
}

export const DropdownItem: React.FC<ItemsProps> = ({ name, action }) => {
	const handleAction = () => {
		action()
	}

	return (
		<Button variant='text' className='dropdown-item rounded-0' onClick={handleAction}>
			{name}
		</Button>
	)
}
