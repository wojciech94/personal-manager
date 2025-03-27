import clsx from 'clsx'
import { ButtonProps, ButtonSize, ButtonVariant } from './types'

export function Button({
	variant = 'primary',
	size = 'md',
	isLoading = false,
	onlyIcon = false,
	children,
	className,
	disabled,
	...props
}: ButtonProps) {
	const sizeStyles: Record<ButtonSize, string> = {
		xs: 'text-xs px-1.5 py-0.5',
		sm: 'text-sm px-2 py-1',
		md: 'text-base px-3 py-2',
		lg: 'text-lg px-4 py-3',
		xl: 'text-xl px-5 py-4',
	}

	const variantStyles: Record<ButtonVariant, string> = {
		primary: 'bg-blue-500 text-white hover:bg-blue-600',
		secondary: 'bg-gray-500 text-white hover:bg-gray-600',
		danger: 'bg-red-500 text-white hover:bg-red-600',
		light: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
		success: 'bg-green-500 text-white hover:bg-green-600',
		warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
		link: 'bg-transparent text-blue-500 hover:underline',
		text: 'bg-transparent text-gray-800 hover:text-gray-900',
		white: 'bg-white text-gray-800 border border-gray-400 hover:bg-gray-200',
	}

	const classes = clsx(
		'flex gap-1 items-center justify-center rounded-lg transition-colors',
		sizeStyles[size],
		variantStyles[variant],
		onlyIcon && '!p-0 w-8 h-8',
		disabled && 'opacity-75 cursor-not-allowed',
		isLoading && 'opacity-75 cursor-progress',
		className
	)

	return (
		<button disabled={disabled || isLoading} className={classes} {...props}>
			{isLoading && (
				<span className='animate-spin inline-block w-4 h-4 border-2 border-t-transparent rounded-full mr-1'></span>
			)}
			{children}
		</button>
	)
}
