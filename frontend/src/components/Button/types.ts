import { ButtonHTMLAttributes } from 'react'

export type ButtonVariant =
	| 'primary'
	| 'light'
	| 'secondary'
	| 'danger'
	| 'success'
	| 'warning'
	| 'link'
	| 'text'
	| 'white'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
	isLoading?: boolean
	onlyIcon?: boolean
}
