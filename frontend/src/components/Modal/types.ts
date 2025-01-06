export interface DataProps {
	action?: (args?: string) => Promise<void>
	addAction?: (args?: string) => Promise<void>
	fetchAction?: (args?: string) => Promise<void>
	actionName?: string
	id?: string
	initValue?: unknown
	group?: unknown
}

export interface ModalDataProps {
	name: string
	title?: string
	data?: DataProps
}
