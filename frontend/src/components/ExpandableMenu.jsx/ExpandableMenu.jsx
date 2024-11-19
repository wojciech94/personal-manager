import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'react-feather'
import styles from './ExpandableMenu.module.css'
export const ExpandableMenu = ({ title, items }) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const expandableRef = useRef(null)

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside)

		return () => {
			document.removeEventListener('mouseDown', handleClickOutside)
		}
	}, [])

	const handleClickOutside = e => {
		if (expandableRef.current && !expandableRef.current.contains(e.target)) {
			setIsExpanded(false)
		}
	}

	const handleAction = action => {
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
