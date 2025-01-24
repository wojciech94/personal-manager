import { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'light' | 'secondary' | 'danger' | 'success' | 'warning' | 'link' | 'text'

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
	isLoading?: boolean
	onlyIcon?: boolean
}

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
	const classes = `${styles.btn} ${styles[`btn--${size}`]} ${styles[`btn--${variant}`]} ${
		onlyIcon ? styles['btn--icon'] : ''
	} ${className ? className : ''} ${disabled ? styles.disabled : ''} ${isLoading ? styles.loading : ''}`

	return (
		<button disabled={disabled || isLoading} className={classes} {...props}>
			{isLoading && <span className={styles.spinner}></span>}
			{children}
		</button>
	)
}
