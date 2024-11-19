export const Card = ({ title, footer, children }) => {
	return (
		<div className='card'>
			{title && <div className='card-title'>{title}</div>}
			{children && <div className='card-content'>{children}</div>}
			{footer && <div className='card-footer'>{footer}</div>}
		</div>
	)
}
