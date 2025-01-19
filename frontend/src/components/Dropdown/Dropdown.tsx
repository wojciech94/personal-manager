import { useState } from 'react'
import { User } from 'react-feather'

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
			<button className='dropdown-btn' onClick={() => setExpanded(prevState => !prevState)}>
				<div className='dropdown-avatar'>
					<User size={20} />
				</div>
			</button>
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
		<button className='dropdown-item' onClick={handleAction}>
			{name}
		</button>
	)
}
