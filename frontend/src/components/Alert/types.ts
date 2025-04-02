import React from 'react'

export interface AlertProps {
	variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info'
	children?: React.ReactNode
	className?: string
	onHideAction?: () => void
}
