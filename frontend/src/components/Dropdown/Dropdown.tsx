import React, { useState } from 'react'
import { User } from 'react-feather'
import { Button } from '../Button/Button'
import { DropdownProps, ItemsProps } from './types'

export const Dropdown: React.FC<DropdownProps> = ({ items, hasNotifications }): React.JSX.Element => {
	const [expanded, setExpanded] = useState(false)

	const handleSetAction = (action: () => void): void => {
		setExpanded(false)
		action()
	}

	return (
		<div className='relative p-1 bg-blue-500 rounded-full z-50'>
			<Button variant='text' className='gap-2 !p-0' onClick={() => setExpanded(prevState => !prevState)}>
				<div className='relative	bg-white rounded-full p-2	transition-colors'>
					<User size={20} />
					{hasNotifications && (
						<div
							title='You have any notifications'
							className='absolute w-4 h-4 -bottom-2 -left-2 rounded-full green-500'></div>
					)}
				</div>
			</Button>
			{expanded && (
				<div className='absolute top-14 border border-zinc-300 right-0 bg-white rounded-lg shadow-lg overflow-hidden'>
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
		<Button
			variant='text'
			className='w-full p-2 transition-colors text-nowrap hover:bg-blue-100'
			onClick={handleAction}>
			{name}
		</Button>
	)
}
