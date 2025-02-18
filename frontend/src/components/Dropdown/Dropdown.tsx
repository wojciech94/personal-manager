import { useState } from 'react'
import { User } from 'react-feather'
import { Button } from '../Button/Button'

type ItemsProps = {
	name: string
	action: () => void
}

type DropdownProps = {
	title?: string
	items: ItemsProps[]
}

export const Dropdown: React.FC<DropdownProps> = ({ items }): JSX.Element => {
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

export const DropdownItem: React.FC<ItemsProps> = ({ name, action }): JSX.Element => {
	const handleAction = (): void => {
		action()
	}

	return (
		<Button variant='text' className='dropdown-item rounded-0' onClick={handleAction}>
			{name}
		</Button>
	)
}
