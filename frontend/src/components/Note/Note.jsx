import { useContext } from 'react'
import { Edit, X, Clock } from 'react-feather'
import { useParams } from 'react-router-dom'
import { ModalContext } from '../../contexts/ModalContext'

export const Note = ({ note, updateNote, fetchNotes }) => {
	const [, setActiveModal] = useContext(ModalContext)
	const { dashboardId } = useParams()
	const removeNote = async id => {
		if (id) {
			const response = await fetch(`http://localhost:5000/dashboards/${dashboardId}/notes/remove`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`, // Dodaj token w nagłówkach
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

	const editModal = id => {
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
					<button className='btn btn-icon btn-primary' onClick={() => setActiveModal(() => editModal(note._id))}>
						<Edit size={16} />
					</button>
					<button className='btn btn-icon btn-light' onClick={() => removeNote(note._id)}>
						<X size={16} />
					</button>
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
			<div>{note.content}</div>
			<div className='d-flex gap-3 justify-between border-top mx-n3 px-3 pt-2'>
				<div className='d-flex gap-2 align-center'>
					<Edit size={20} /> {note.updated_at.replace('T', ' ').replace('Z', '')}
				</div>
				{note.expired_at ? (
					<div className='d-flex gap-2 align-center text-gray'>
						<Clock size={20} /> {note.expired_at.split('T')[0]}
					</div>
				) : (
					''
				)}
			</div>
		</div>
	)
}