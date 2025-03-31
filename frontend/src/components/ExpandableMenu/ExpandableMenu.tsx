import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'react-feather'
import { Button } from '../Button/Button'
import { ExpandableMenuProps } from './types'

export const ExpandableMenu: React.FC<ExpandableMenuProps> = ({ title, items }): React.JSX.Element => {
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
		<div ref={expandableRef} className={`relative`}>
			<Button variant='light' onlyIcon={!title} onClick={() => setIsExpanded(prevState => !prevState)}>
				{title ? <>{title}</> : <MoreVertical size={16} />}
			</Button>
			{items && items.length > 0 && isExpanded && (
				<div className={`absolute right-0 border border-zinc-300 top-[calc(100%+.5rem)] z-10 bg-white shadow-md rounded-lg flex flex-col gap-1`}>
					{items.map(i => (
						<Button
							disabled={i.disabled}
							variant='text'
							className='whitespace-nowrap transition-colors py-2 px-3 text-nowrap hover:bg-sky-100'
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
