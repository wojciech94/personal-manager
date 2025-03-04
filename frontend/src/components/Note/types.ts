export type NoteType = {
	_id: string
	title: string
	category: string
	is_favourite: boolean
	tags: string[]
	content: string
	updated_at: string
	created_at: string
	expired_at: string
}

export type NoteProps = {
	note: NoteType
	updateNote: (
		title: string,
		content: string,
		category: string,
		tags: string | string[],
		folder_id: string,
		is_favourite: boolean,
		expired_at: string | null,
		noteId: string
	) => void
	fetchNotes: () => void
}
