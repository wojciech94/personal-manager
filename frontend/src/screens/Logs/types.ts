import { User } from '../../types/dashboard'

export type LogsObject = {
	logs: Log[]
}

export type Log = {
	timestamps: string
	initiatorId: User
	message: string
	_id: string
}
