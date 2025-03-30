import React from 'react'
import { FormRowProps } from './types'

export const FormRow: React.FC<FormRowProps> = ({
	label,
	content,
	children,
	className,
	required,
}): React.JSX.Element => {
	return (
		<div className={`flex flex-wrap items-center ${className ? className : ''}`}>
			<div className={`py-1 px-2 text-end w-[calc(4/12*100%)] ${required ? 'required' : ''}`}>{label}</div>
			<div className='flex flex-wrap gap-2 items-flex-start w-[calc(8/12*100%)] py-1 px-2 font-medium'>
				{content}
				{children}
			</div>
		</div>
	)
}
