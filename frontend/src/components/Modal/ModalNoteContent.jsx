import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export const ModalNoteContent = ({ modalData }) => {
	const [noteName, setNoteName] = useState('')
	const [noteContent, setNoteContent] = useState('')
	const [categoryNames, setCategoryNames] = useState([])
	const [selectedCategory, setSelectedCategory] = useState('')
	const [isFavourite, setIsFavourite] = useState(false)
	const [expiredDate, setExpiredDate] = useState('')
	const { dashboardId } = useParams()

	useEffect(() => {
		fetchNotesCategories()
	}, [])

	useEffect(() => {
		const noteId = modalData.id
		if (noteId) {
			const token = localStorage.getItem('token')
			const fetchNoteData = async () => {
				const response = await fetch(`http://localhost:5000/notes/${noteId}`, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				})
				if (response.ok) {
					const note = await response.json()
					const { title, content, category, is_favourite, expired_at } = note
					console.log(note)
					setNoteName(title)
					setNoteContent(content)
					setSelectedCategory(category)
					setIsFavourite(is_favourite)
					setExpiredDate(expired_at?.split('T')[0] || '')
				} else {
					const errorStatus = response.status
					console.error('Failed to fetch note data', errorStatus)
				}
			}
			fetchNoteData()
		}
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

	const handleUpdateNote = () => {
		if (modalData.action) {
			modalData.action(noteName, noteContent, selectedCategory, isFavourite, expiredDate, modalData.id)
			reset()
		}
	}

	const reset = () => {
		setNoteName('')
		setNoteContent('')
		setCategoryNames([])
		setSelectedCategory('')
		setIsFavourite(false)
		setExpiredDate('')
	}

	const handleCategoryChange = value => {
		const categoryName = value
		setSelectedCategory(categoryName)
	}

	return (
		<div className={`d-flex flex-column p-3 gap-2`}>
			<div className='d-flex gap-2'>
				<label htmlFor='noteName'>Title</label>
				<input type='text' name='noteName' id='noteName' value={noteName} onChange={e => setNoteName(e.target.value)} />
			</div>
			<div className='d-flex gap-2'>
				<label htmlFor='noteContent'>Content</label>
				<textarea
					className='w-100'
					type='text'
					name='noteContent'
					id='noteContent'
					value={noteContent}
					onChange={e => setNoteContent(e.target.value)}
				/>
			</div>
			<div className='d-flex gap-2'>
				<label htmlFor='noteCategory'>Category</label>
				<select
					name='noteCategory'
					id='noteCategory'
					value={selectedCategory}
					onChange={e => handleCategoryChange(e.target.value)}>
					{categoryNames.map(category => (
						<option key={category}>{category}</option>
					))}
				</select>
			</div>
			<div className='d-flex gap-2'>
				<label htmlFor='isFavourite'>Is favourite</label>
				<input
					checked={isFavourite}
					type='checkbox'
					name='isFavourite'
					id='isFavourite'
					onChange={() => setIsFavourite(prevFav => !prevFav)}
				/>
			</div>
			<div className='d-flex gap-2 mb-4'>
				<label htmlFor='expiredDate'>Expired at</label>
				<input
					type='date'
					name='expiredDate'
					id='expiredDate'
					value={expiredDate}
					onChange={e => setExpiredDate(e.target.value)}
				/>
			</div>
			<button className='btn btn-primary' onClick={handleUpdateNote}>
				{modalData.actionName}
			</button>
		</div>
	)
}
