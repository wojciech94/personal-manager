import { Edit, X, Clock } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useAuth } from '../../contexts/AuthContext'
import { useModalContext } from '../../contexts/ModalContext'
import { getLocaleDateTime } from '../../utils/helpers'
import { Button } from '../Button/Button'

export type NoteProps = {
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

type Props = {
	note: NoteProps
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

export const Note: React.FC<Props> = ({ note, updateNote, fetchNotes }): JSX.Element => {
	const { setActiveModal } = useModalContext()
	const { dashboardId } = useParams()
	const { accessToken } = useAuth()

	const removeNote = async (id: string): Promise<void> => {
		if (id) {
			const response = await fetch(`${API_URL}dashboards/${dashboardId}/notes/remove`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({ id }),
			})

			if (response.ok) {
				const data = await response.json()
				console.log(data.message)
				fetchNotes()
			} else {
				const errorData = await response.json()
				console.error('Note removal failed:', errorData.message)
			}
		} else {
			console.error('Id not provided')
		}
	}

	const editModal = (id: string) => {
		return {
			name: 'editNote',
			data: {
				action: updateNote,
				actionName: 'Update note',
				id: id,
			},
			title: 'Update note',
		}
	}

	return (
		<div key={note._id} className={`note ${note.is_favourite ? 'favourite' : ''}`}>
			<div className='d-flex justify-between gap-3'>
				<div className='d-flex gap-3 align-center'>
					<div className='note-title'>{note.title}</div>
					<div className='badge'>{note.category}</div>
				</div>
				<div className='d-flex gap-2 align-center'>
					<Button onlyIcon={true} onClick={() => setActiveModal?.(() => editModal(note._id))}>
						<Edit size={16} />
					</Button>
					<Button onlyIcon={true} variant='danger' onClick={() => removeNote(note._id)}>
						<X size={16} />
					</Button>
				</div>
			</div>
			{note.tags && note.tags.length > 0 && (
				<div className='d-flex gap-2'>
					{note.tags &&
						note.tags.map(t => (
							<div key={t} className='tag'>
								{t}
							</div>
						))}
				</div>
			)}
			<div className='mx-n3 px-3 py-3 border-top border-bottom border-light'>{note.content}</div>
			<div className='d-flex gap-3 justify-between mx-n3 px-3 pt-2'>
				<div className='d-flex gap-2 align-center'>
					<Edit size={20} /> {getLocaleDateTime(note.updated_at)}
				</div>
				{note.expired_at ? (
					<div className='d-flex gap-2 align-center text-gray'>
						<Clock size={20} /> {getLocaleDateTime(note.expired_at)}
					</div>
				) : (
					''
				)}
			</div>
		</div>
	)
}
