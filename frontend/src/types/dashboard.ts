import { LogsObject } from '../screens/Logs/types'

export type User = {
	_id: string
	name: string
}

export type DashboardType = {
	_id: string
	name: string
	isOwner: boolean
	creatorId: User
	userIds: User[]
	created_at: string
	logsId: LogsObject
}

export type DashboardsProps = {
	name: string
	_id: string
}

export type NavigationProps = {
	dashboards: DashboardsProps[]
}
