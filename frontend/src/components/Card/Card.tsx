import React from 'react'
import { Button } from '../Button/Button'
import { CardProps, HeaderProps } from './types'

export const Card: React.FC<CardProps> = ({ title, footer, children, headerComponent, className, contentClass }) => {
	return (
		<div className={`flex flex-col border border-zinc-300 rounded-2xl shadow-xl ${className ? className : ''}`}>
			{headerComponent && headerComponent}
			{title && <div className='font-semibold text-lg'>{title}</div>}
			{children && <div className={`p-4 ${contentClass ? contentClass : ''}`}>{children}</div>}
			{footer && <div className=''>{footer}</div>}
		</div>
	)
}

export const CardHeader: React.FC<HeaderProps> = ({ title, data, className }) => {
	return (
		<div
			className={`flex justify-between items-center rounded-2xl rounded-b-none p-4 gap-4 flex-wrap border-b border-zinc-200 bg-white
 			${className ? className : ''}`}>
			<div className='font-semibold text-lg flex-1'>{title}</div>
			{data && data.length > 0 && (
				<div className='flex gap-2 items-center flex-wrap'>
					{data.map(d => (
						<Button disabled={d.disabled} key={d.label} variant={d.btnVariant} onClick={d.action}>
							{d.icon}
							{d.label}
						</Button>
					))}
				</div>
			)}
		</div>
	)
}
