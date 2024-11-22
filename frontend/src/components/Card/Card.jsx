export const Card = ({ title, footer, children }) => {
	return (
		<div className='card'>
			{title && <div className='card-title'>{title}</div>}
			{children && <div className='card-content'>{children}</div>}
			{footer && <div className='card-footer'>{footer}</div>}
		</div>
	)
}

export const CardHeader = ({ title, data, className }) => {
	return (
		<div className={`card-header ${className ? className : ''}`}>
			<div className='card-title flex-1'>{title}</div>
			{data &&
				data.length > 0 &&
				data.map(d => (
					<button className='btn btn-primary' onClick={d.action}>
						{d.label}
					</button>
				))}
		</div>
	)
}
