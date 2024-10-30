import { useState } from 'react'

export const Dropdown = ({ title, items }) => {
	const [expanded, setExpanded] = useState(false)

	const handleSetAction = action => {
		if (action) {
			setExpanded(false)
			action()
		} else {
			console.warning('No dropdown action')
		}
	}

	return (
		<div className='dropdown'>
			<button className='dropdown-btn' onClick={() => setExpanded(prevState => !prevState)}>
				<div className='dropdown-title'>{title}</div>
				<div className='dropdown-avatar'></div>
			</button>
			{expanded && (
				<div className='dropdown-menu'>
					{items &&
						items.length > 0 &&
						items.map(i => <DropdownItem name={i.name} action={() => handleSetAction(i.action)}></DropdownItem>)}
				</div>
			)}
		</div>
	)
}

export const DropdownItem = ({ name, action }) => {
	const handleAction = () => {
		action()
	}

	return (
		<button className='dropdown-item' onClick={handleAction}>
			{name}
		</button>
	)
}
