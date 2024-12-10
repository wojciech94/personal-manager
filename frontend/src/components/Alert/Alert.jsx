import { Info } from 'react-feather'

export function Alert({ variant, children, className }) {
	return (
		<div className={`alert alert-${variant} ${className ? className : ''}`}>
			<Info size={24} color='dodgerblue' />
			{children}
		</div>
	)
}
