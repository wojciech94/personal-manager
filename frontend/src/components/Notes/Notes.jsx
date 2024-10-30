import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { ModalContext } from '../../contexts/ModalContext'

export const Notes = () => {
	const [, setActiveModal] = useContext(ModalContext)
	const [notes, setNotes] = useState([])
	const [categoryNames, setCategoryNames] = useState([])
	const { dashboardId } = useParams()

	useEffect(() => {
		fetchNotes()
		fetchNotesCategories()
	}, [])

	async function fetchNotesCategories() {
		const token = localStorage.getItem('token') // Upewnij się, że token jest przechowywany po zalogowaniu

		const response = await fetch(`http://localhost:5000/dashboards/${dashboardId}/note-categories`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		})

		if (response.ok) {
			const categoryNames = await response.json()
			setCategoryNames(categoryNames)
		} else {
			console.error('Failed to fetch category names', response.status)
		}
	}

	async function fetchNotes() {
		const token = localStorage.getItem('token') // Upewnij się, że token jest przechowywany po zalogowaniu

		const response = await fetch(`http://localhost:5000/dashboards/${dashboardId}/notes`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		})

		if (response.ok) {
			const notes = await response.json()
			setNotes(notes)
		} else {
			console.error('Failed to fetch notes:', response.status)
		}
	}

	const createNote = async (title, content) => {
		const response = await fetch(`http://localhost:5000/dashboards/${dashboardId}/add-note`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`, // Dodaj token w nagłówkach
			},
			body: JSON.stringify({ title, content }),
		})
		if (response.ok) {
			const newNote = await response.json()
			console.log('Note created', newNote)
			setActiveModal(null)
			fetchNotes()
		}
	}

	const newModal = {
		name: 'createNote',
		data: {
			action: createNote,
			actionName: 'Create note',
		},
	}

	return (
		<>
			<div className='w-100 d-flex justify-end mb-4'>
				<button className='btn btn-primary' onClick={() => setActiveModal(newModal)}>
					+ Add note
				</button>
			</div>
			{notes && notes.length > 0 && (
				<div className='d-flex flex-column gap-4'>
					{notes.map(n => (
						<div className={`note ${n.is_favourite ? 'favourite' : ''}`}>
							<div className='d-flex gap-3'>
								{n.title} {n.category}
							</div>
							<div className='d-flex gap-2'>{n.tags && n.tags.map(t => <div className='tag'>{t}</div>)}</div>
							<div>{n.content}</div>
							<div className='d-flex gap-2 justify-between'>
								{n.updated_at.replace('T', ' ').replace('Z', '')}
								{n.expired_at}
							</div>
						</div>
					))}
				</div>
			)}
		</>
	)
}
