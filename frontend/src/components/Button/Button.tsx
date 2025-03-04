import styles from './Button.module.css'
import { ButtonProps } from './types'

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
