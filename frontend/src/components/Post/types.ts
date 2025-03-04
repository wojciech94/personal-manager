export type Comment = {
	_id: string
	author: { _id: string; name: string }
	content: string
	updatedAt: string
	isEdit: boolean
}

export type CommentDataType = {
	commentId?: string
}

export type PostType = {
	_id: string
	content: string
	author: { _id: string; name: string }
	likes: string[]
	updatedAt: string
	isEdit: boolean
	comments: Comment[]
}
