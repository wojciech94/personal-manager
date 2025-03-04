export type ItemsProps = {
	label: string
	action: () => void
	disabled?: boolean
}

export type ExpandableMenuProps = {
	title?: string
	items: ItemsProps[]
}
