import { Info } from 'react-feather'

interface AlertProps {
	variant?: string
	children?: React.ReactNode
	className?: string
}

export function Alert({ variant, children, className }: AlertProps) {
	return (
		<div className={`alert alert-${variant ? variant : 'primary'} ${className ? className : ''}`}>
			<Info size={24} color='dodgerblue' />
			{children}
		</div>
	)
}
