type Props = {
	title?: string
	footer?: React.ReactNode
	children?: React.ReactNode
	headerComponent?: React.ReactNode
	className?: string
	contentClass?: string
}

type HeaderDataProps = {
	label: string
	btnClass?: string
	icon?: React.ReactNode
	action: () => void
}

type HeaderProps = {
	title: string
	data: HeaderDataProps[]
	className?: string
}

export const Card: React.FC<Props> = ({ title, footer, children, headerComponent, className, contentClass }) => {
	return (
		<div className={`card ${className ? className : ''}`}>
			{headerComponent && headerComponent}
			{title && <div className='card-title'>{title}</div>}
			{children && <div className={`card-content ${contentClass ? contentClass : ''}`}>{children}</div>}
			{footer && <div className='card-footer'>{footer}</div>}
		</div>
	)
}

export const CardHeader: React.FC<HeaderProps> = ({ title, data, className }) => {
	return (
		<div className={`card-header ${className ? className : ''}`}>
			<div className='card-title flex-1'>{title}</div>
			{data && data.length > 0 && (
				<div className='d-flex gap-2 align-center flex-wrap'>
					{data.map(d => (
						<button key={d.label} className={`btn d-flex gap-2 align-center ${d.btnClass}`} onClick={d.action}>
							{d.icon}
							{d.label}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
