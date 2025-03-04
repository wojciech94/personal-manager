import { ButtonVariant } from '../Button/types'

export type CardProps = {
	title?: string
	footer?: React.ReactNode
	children?: React.ReactNode
	headerComponent?: React.ReactNode
	className?: string
	contentClass?: string
}

export type HeaderDataProps = {
	label: string
	btnVariant?: ButtonVariant
	icon?: React.ReactNode
	action: () => void
}

export type HeaderProps = {
	title: string
	data?: HeaderDataProps[]
	className?: string
}
