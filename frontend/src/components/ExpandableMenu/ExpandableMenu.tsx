import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'react-feather'
import styles from './ExpandableMenu.module.css'

type ItemsProps = {
	label: string
	action: () => void
}

type Props = {
	title?: string
	items: ItemsProps[]
}

export const ExpandableMenu: React.FC<Props> = ({ title, items }): JSX.Element => {
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
			<button
				className={`btn btn-light ${!title ? 'btn-icon' : ''}`}
				onClick={() => setIsExpanded(prevState => !prevState)}>
				{title ? <>{title}</> : <MoreVertical size={16} />}
			</button>
			{items && items.length > 0 && isExpanded && (
				<div className={`${styles.expandableMenu}`}>
					{items.map(i => (
						<button key={i.label} className={`${styles.menuItem}`} onClick={() => handleAction(i.action)}>
							{i.label}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
