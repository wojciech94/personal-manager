import { DateData } from '../../screens/Calendar/Calendar'
import { TodoGroup, TasksSettings } from './../Task/types'

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
	dateData?: DateData
}

export type ModalDataProps = {
	name: string
	title?: string
	data?: DataProps
}

export type ModalContextType = {
	activeModal: ModalDataProps | null
	setActiveModal: (modal: ModalDataProps | null) => void
}
