import { Info } from 'react-feather'

export function Alert({ variant, children }) {
	return (
		<div className={`alert alert-${variant}`}>
			<Info size={24} color='dodgerblue' />
			{children}
		</div>
	)
}
