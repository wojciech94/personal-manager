import { Info, X } from 'react-feather'
import { Button } from '../Button/Button'
import { AlertProps } from './types'

export function Alert({ variant, children, className, onHideAction }: AlertProps) {
	return (
		<div className={`alert alert-${variant ? variant : 'primary'} ${className ? className : ''}`}>
			<Info size={24} color='dodgerblue' />
			<div className='flex-1'>{children}</div>
			{onHideAction && (
				<Button variant='text' className='text-primary' onClick={onHideAction}>
					<X size={24} />
				</Button>
			)}
		</div>
	)
}
