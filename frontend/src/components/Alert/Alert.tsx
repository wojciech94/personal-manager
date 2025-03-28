import { Info, X } from 'react-feather'
import { Button } from '../Button/Button'
import { AlertProps } from './types'

export function Alert({ variant = 'primary', children, className, onHideAction }: AlertProps) {
	const variantStyles = {
		primary: 'bg-blue-100 text-blue-500 border-blue-300',
		success: 'bg-green-100 text-green-500 border-green-300',
		danger: 'bg-red-100 text-red-500 border-red-300',
		warning: 'bg-yellow-100 text-yellow-500 border-yellow-300',
		info: 'bg-gray-100 text-gray-500 border-gray-300',
	}
	return (
		<div className={`flex items-center gap-3 p-4 m-4 border rounded-lg ${variantStyles[variant]} ${className || ''}`}>
			<Info size={24} className='text-blue-500' />
			<div className='flex-1'>{children}</div>
			{onHideAction && (
				<Button variant='text' className='!text-blue-500 hover:!text-blue-700 !p-0' onClick={onHideAction}>
					<X size={24} />
				</Button>
			)}
		</div>
	)
}
