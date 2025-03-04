import { Info } from 'react-feather'
import { AlertProps } from './types'

export function Alert({ variant, children, className }: AlertProps) {
	return (
		<div className={`alert alert-${variant ? variant : 'primary'} ${className ? className : ''}`}>
			<Info size={24} color='dodgerblue' />
			{children}
		</div>
	)
}
