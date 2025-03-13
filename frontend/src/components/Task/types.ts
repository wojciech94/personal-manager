export enum TaskPriorities {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
}

export enum SortMethods {
	CREATED_AT = 'created_at',
	EXPIRED_AT = 'expired_at',
	PRIORITY = 'priority',
}

export type TaskProps = {
	task: TaskType
	fetchTasks: () => void
	tasksSettings: TasksSettings
	isArchive: boolean
}

export type TaskType = {
	_id: string
	content: string
	priority: TaskPriorities
	is_done: boolean
	created_at: string
	expired_at: string
	archived_at: string
	removed_at: string
}

export type TasksSettings = {
	showDeadline: boolean
	archivizationTime: number
	removeTime: number
	sortMethod: SortMethods
	sortDirection: 'asc' | 'desc'
}

export type TodoGroup = {
	_id: string
	name: string
	tasks: TaskType[]
	isEdit: boolean
}
