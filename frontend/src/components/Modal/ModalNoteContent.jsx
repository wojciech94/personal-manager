import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FormRow } from '../FormRow/FormRow'

export const ModalNoteContent = ({ modalData }) => {
	const [noteName, setNoteName] = useState('')
	const [noteContent, setNoteContent] = useState('')
	const [categoryNames, setCategoryNames] = useState([])
	const [selectedCategory, setSelectedCategory] = useState('')
	const [isFavourite, setIsFavourite] = useState(false)
	const [selectedFolder, setSelectedFolder] = useState('')
	const [folderNames, setFolderNames] = useState([])
	const [expiredDate, setExpiredDate] = useState('')
	const [noteTags, setNoteTags] = useState('')
	const { dashboardId } = useParams()

	useEffect(() => {
		fetchNotesCategories()
	}, [])

	useEffect(() => {
		fetchFolders()
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
					const { title, content, category, tags, folder_id, is_favourite, expired_at } = note
					setNoteName(title)
					setNoteContent(content)
					setSelectedCategory(category)
					setNoteTags(tags.join(','))
					setSelectedFolder(folder_id)
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
		const token = localStorage.getItem('token')

		const response = await fetch(`http://localhost:5000/dashboards/${dashboardId}/note-categories`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (response.ok) {
			const categoryNames = await response.json()
			setCategoryNames(categoryNames)
		} else {
			console.error('Failed to fetch category names', response.status)
		}
	}

	async function fetchFolders() {
		const token = localStorage.getItem('token')

		const response = await fetch(`http://localhost:5000/dashboards/${dashboardId}/folders`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (response.ok) {
			const folderNames = await response.json()
			setFolderNames(folderNames)
		} else {
			console.error('Failed to fetch folders', response.status)
		}
	}

	const handleUpdateNote = () => {
		if (modalData.action) {
			modalData.action(
				noteName,
				noteContent,
				selectedCategory,
				noteTags,
				selectedFolder,
				isFavourite,
				expiredDate,
				modalData.id
			)
			reset()
		}
	}

	const handleNoteTagsChanged = e => {
		setNoteTags(e.target.value)
	}

	const reset = () => {
		setNoteName('')
		setNoteContent('')
		setCategoryNames([])
		setSelectedCategory('')
		setIsFavourite(false)
		setSelectedFolder('')
		setFolderNames([])
		setExpiredDate('')
		setNoteTags('')
	}

	const handleCategoryChange = value => {
		const categoryName = value
		setSelectedCategory(categoryName)
	}

	const handleFolderChange = value => {
		setSelectedFolder(value)
	}

	return (
		<>
			<div className='card-content d-flex flex-column gap-3'>
				<FormRow label='Title'>
					<input
						className='w-100'
						type='text'
						name='noteName'
						id='noteName'
						value={noteName}
						onChange={e => setNoteName(e.target.value)}
					/>
				</FormRow>
				<FormRow label='Content'>
					<textarea
						className='w-100'
						type='text'
						name='noteContent'
						id='noteContent'
						value={noteContent}
						onChange={e => setNoteContent(e.target.value)}
					/>
				</FormRow>
				<FormRow label='Category'>
					<select
						name='noteCategory'
						id='noteCategory'
						value={selectedCategory}
						onChange={e => handleCategoryChange(e.target.value)}>
						{categoryNames.map(category => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>
				</FormRow>
				<FormRow label='Tags'>
					<input
						className='w-100'
						type='text'
						name='noteTags'
						id='noteTags'
						value={noteTags}
						onChange={handleNoteTagsChanged}
					/>
				</FormRow>
				<FormRow label='folder'>
					<select
						name='noteFolder'
						id='noteFolder'
						value={selectedFolder}
						onChange={e => handleFolderChange(e.target.value)}>
						<option value=''>-</option>
						{folderNames.map(folder => (
							<option key={folder._id} value={folder._id}>
								{folder.name}
							</option>
						))}
					</select>
				</FormRow>
				<FormRow label='Is favourite'>
					<input
						checked={isFavourite}
						type='checkbox'
						name='isFavourite'
						id='isFavourite'
						onChange={() => setIsFavourite(prevFav => !prevFav)}
					/>
				</FormRow>
				<FormRow label='Expired at'>
					<input
						type='date'
						name='expiredDate'
						id='expiredDate'
						value={expiredDate}
						onChange={e => setExpiredDate(e.target.value)}
					/>
				</FormRow>
			</div>
			<div className='card-footer'>
				<button className='btn btn-success d-block w-100' onClick={handleUpdateNote}>
					{modalData.actionName}
				</button>
			</div>
		</>
	)
}
