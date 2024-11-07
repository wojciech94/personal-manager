import { useState, useEffect, useCallback } from 'react'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { ModalContext } from '../../contexts/ModalContext'
import { Plus, Edit, Clock, X } from 'react-feather'
import { debounce } from '../../utils/helpers'
import { ToggleBox } from '../ToggleBox/ToggleBox'

export const Notes = () => {
	const [, setActiveModal] = useContext(ModalContext)
	const [notes, setNotes] = useState([])
	const [filteredNotes, setFilteredNotes] = useState([])
	const [categoryNames, setCategoryNames] = useState([])
	const [filterCategory, setFilterCategory] = useState('')
	const [isFavourite, setIsFavourite] = useState(false)
	const [sortBy, setSortBy] = useState('')
	const [filterOrRule, setFilterOrRule] = useState(true)
	const [searchValue, setSearchValue] = useState('')
	const { dashboardId } = useParams()

	const debouncedSearchFilter = useCallback(
		debounce(val => searchFilter(val), 500),
		[]
	)

	useEffect(() => {
		fetchNotesCategories()
	}, [])

	useEffect(() => {
		fetchNotes()
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
		const token = localStorage.getItem('token')

		const response = await fetch(`http://localhost:5000/dashboards/${dashboardId}/notes`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		})

		if (response.ok) {
			let notes = await response.json()
			setNotes(notes)
			setFilteredNotes(notes)
		} else {
			console.error('Failed to fetch notes:', response.status)
		}
	}

	//Dodawanie lub aktualizacja notatki
	const updateNote = async (title, content, category, is_favourite, expired_at, noteId) => {
		const url = !noteId
			? `http://localhost:5000/dashboards/${dashboardId}/add-note`
			: `http://localhost:5000/notes/${noteId}`
		const response = await fetch(url, {
			method: `${noteId ? 'PATCH' : 'POST'}`,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			body: JSON.stringify({ title, content, category, is_favourite, expired_at }),
		})
		if (response.ok) {
			const updatedNote = await response.json()
			console.log(`Note ${noteId ? 'updated' : 'created'}`, updatedNote)
			fetchNotes()
		}
		setActiveModal(null)
	}

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

	const newModal = {
		name: 'createNote',
		data: {
			action: updateNote,
			actionName: 'Create note',
		},
	}

	const editModal = id => {
		return {
			name: 'editNote',
			data: {
				action: updateNote,
				actionName: 'Update note',
				id: id,
			},
		}
	}

	const searchFilter = val => {
		const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(val.toLowerCase()))
		setFilteredNotes(filteredNotes)
	}

	const onSearchInputChange = e => {
		const value = e.target.value
		console.log(value)
		setSearchValue(value)
		debouncedSearchFilter(value)
	}

	const handleChangeOptions = () => {
		const newNotes = notes.filter(n => {
			let condition
			switch (filterOrRule) {
				case true:
					condition = n.category === filterCategory || n.is_favourite === isFavourite
					break
				case false:
					condition = n.category === filterCategory && n.is_favourite === isFavourite
					break
			}
			return condition
		})
		setFilteredNotes(newNotes)
	}

	return (
		<>
			<div className='w-100 d-flex justify-between mb-4'>
				<div className='d-flex gap-2 flex-1'>
					<input
						className='w-50'
						type='text'
						placeholder='Search note'
						value={searchValue}
						onChange={onSearchInputChange}
					/>
					<ToggleBox>
						<div className='d-flex justify-between align-center gap-2'>
							<div>Settings</div>
							<button className='btn' onClick={handleChangeOptions}>
								Save
							</button>
						</div>
						<div>Filter</div>
						<div>Filter rule</div>
						<div className='d-flex gap-4 align-center'>
							<div className='d-flex gap-2 align-center'>
								<input
									checked={filterOrRule}
									type='radio'
									name='filterRadio'
									id='filterRuleOr'
									onChange={() => setFilterOrRule(true)}
								/>
								<label htmlFor='filterRuleOr'>OR</label>
							</div>
							<div className='d-flex gap-2 align-center'>
								<input
									checked={!filterOrRule}
									type='radio'
									name='filterRadio'
									id='filterRuleAnd'
									onChange={() => setFilterOrRule(false)}
								/>
								<label htmlFor='filterRuleAnd'>AND</label>
							</div>
						</div>
						<div>Category</div>
						<select
							name='filterCategory'
							id='filterCategory'
							value={filterCategory}
							onChange={e => setFilterCategory(e.target.value)}>
							<option value=''>Choose category...</option>
							{categoryNames &&
								categoryNames.length > 0 &&
								categoryNames.map(cat => <option value={cat}>{cat}</option>)}
						</select>
						<div className='d-flex gap-2 align-center'>
							<input
								type='checkbox'
								name='favNote'
								id='isFav'
								value={isFavourite}
								onChange={() => setIsFavourite(prevState => !prevState)}
							/>
							<label htmlFor='isFav'>Is favourite</label>
						</div>
						<div>Sorting</div>
						<div>Sort by</div>
						<select name='sortBy' id='sortBy' value={sortBy} onChange={e => setSortBy(e.target.value)}>
							<option value=''>Sort by...</option>
							<option value='Creation date'>Creation date</option>
							<option value='Update date'>Update date</option>
							<option value='Deadline date'>Deadline date</option>
						</select>
					</ToggleBox>
				</div>
				<button className='btn btn-primary d-flex align-center gap-2' onClick={() => setActiveModal(newModal)}>
					<Plus size={16} />
					<span>Add note</span>
				</button>
			</div>
			{filteredNotes && filteredNotes.length > 0 && (
				<div className='d-flex flex-column gap-4'>
					{filteredNotes.map(n => (
						<div key={n._id} className={`note ${n.is_favourite ? 'favourite' : ''}`}>
							<div className='d-flex justify-between gap-3'>
								<div className='d-flex gap-3 align-center'>
									<div className='note-title'>{n.title}</div>
									<div className='badge'>{n.category}</div>
								</div>
								<div className='d-flex gap-2 align-center'>
									<button className='btn btn-icon btn-primary' onClick={() => setActiveModal(() => editModal(n._id))}>
										<Edit size={16} />
									</button>
									<button className='btn btn-icon btn-light' onClick={() => removeNote(n._id)}>
										<X size={16} />
									</button>
								</div>
							</div>
							{n.tags && n.tags.length > 0 && (
								<div className='d-flex gap-2'>{n.tags && n.tags.map(t => <div className='tag'>{t}</div>)}</div>
							)}
							<div>{n.content}</div>
							<div className='d-flex gap-3 justify-between border-top mx-n3 px-3 pt-2'>
								<div className='d-flex gap-2 align-center'>
									<Edit size={20} /> {n.updated_at.replace('T', ' ').replace('Z', '')}
								</div>
								{n.expired_at ? (
									<div className='d-flex gap-2 align-center text-gray'>
										<Clock size={20} /> {n.expired_at.split('T')[0]}
									</div>
								) : (
									''
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</>
	)
}
