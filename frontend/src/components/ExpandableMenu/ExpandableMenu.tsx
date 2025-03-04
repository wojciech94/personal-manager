import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'react-feather'
import { Button } from '../Button/Button'
import styles from './ExpandableMenu.module.css'
import { ExpandableMenuProps } from './types'

export const ExpandableMenu: React.FC<ExpandableMenuProps> = ({ title, items }): JSX.Element => {
	const [isExpanded, setIsExpanded] = useState(false)
	const expandableRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleClickOutside = (e: MouseEvent) => {
		if (expandableRef.current && !expandableRef.current.contains(e.target as Node)) {
			setIsExpanded(false)
		}
	}

	const handleAction = (action?: () => void): void => {
		if (action) {
			setIsExpanded(false)
			action()
		}
	}

	return (
		<div ref={expandableRef} className={`${styles.expandable}`}>
			<Button variant='light' onlyIcon={!title} onClick={() => setIsExpanded(prevState => !prevState)}>
				{title ? <>{title}</> : <MoreVertical size={16} />}
			</Button>
			{items && items.length > 0 && isExpanded && (
				<div className={`${styles.expandableMenu}`}>
					{items.map(i => (
						<Button
							disabled={i.disabled}
							variant='text'
							className='dropdown-item text-nowrap'
							key={i.label}
							onClick={() => handleAction(i.action)}>
							{i.label}
						</Button>
					))}
				</div>
			)}
		</div>
	)
}
