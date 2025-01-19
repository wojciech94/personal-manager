import { TasksSettings } from '../Task/Task'
import { TodoGroup } from '../Todos/Todos'

export type DataProps = {
	action?:
		| ((args: string) => Promise<void>)
		| (() => Promise<void>)
		| ((args: TasksSettings) => Promise<void>)
		| ((
				title: string,
				content: string,
				category: string,
				tags: string | string[],
				folder_id: string,
				is_favourite: boolean,
				expired_at: string | null,
				note_id: string | null
		  ) => Promise<void>)
	addAction?: ((args: string) => Promise<void>) | (() => Promise<void>)
	fetchAction?: ((args: string) => Promise<void>) | (() => Promise<void>)
	actionName?: string
	id?: string
	initValue?: string | TasksSettings
	groups?: TodoGroup[]
}

export type ModalDataProps = {
	name: string
	title?: string
	data?: DataProps
}
