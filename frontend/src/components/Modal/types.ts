export type DataProps = {
	action?: ((args: string) => Promise<void>) | (() => Promise<void>)
	addAction?: ((args: string) => Promise<void>) | (() => Promise<void>)
	fetchAction?: ((args: string) => Promise<void>) | (() => Promise<void>)
	actionName?: string
	id?: string
	initValue?: unknown
	group?: unknown
}

export type ModalDataProps = {
	name: string
	title?: string
	data?: DataProps
}
