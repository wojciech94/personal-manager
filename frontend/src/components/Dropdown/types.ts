export type ItemsProps = {
	name: string
	action: () => void
}

export type DropdownProps = {
	title?: string
	items: ItemsProps[]
	hasNotifications?: boolean
}
