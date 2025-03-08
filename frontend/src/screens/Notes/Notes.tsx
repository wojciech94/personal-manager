import { useState, useEffect, useCallback, ChangeEvent } from 'react'
import { useLoaderData, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useModalContext } from '../../contexts/ModalContext'
import { Plus } from 'react-feather'
import { debounce } from '../../utils/helpers'
import { ToggleBox } from '../../components/ToggleBox/ToggleBox'
import { Note } from '../../components/Note/Note'
import { ExpandableMenu } from '../../components/ExpandableMenu/ExpandableMenu'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { useApi } from '../../contexts/ApiContext'
import { NoteType } from '../../components/Note/types'
import { ApiError } from '../../types/global'

export const Notes = () => {
	const data = useLoaderData() as NoteType[] | ApiError
	const [notes, setNotes] = useState<NoteType[]>([])
	const { setActiveModal } = useModalContext()
	const [filteredNotes, setFilteredNotes] = useState<NoteType[]>([])
	const [categoryNames, setCategoryNames] = useState<string[]>([])
	const [filterCategory, setFilterCategory] = useState('')
	const [isFavourite, setIsFavourite] = useState(false)
	const [sortBy, setSortBy] = useState('')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
	const [filterOrRule, setFilterOrRule] = useState(true)
	const [searchValue, setSearchValue] = useState('')
	const { dashboardId, folderId } = useParams()
	const { accessToken } = useApi()

	const debouncedSearchFilter = useCallback(
		debounce((val: string) => searchFilter(val), 500),
		[notes]
	)

	useEffect(() => {
		fetchNotesCategories()
	}, [])

	useEffect(() => {
		if (Array.isArray(data)) {
			setNotes(data)
			setFilteredNotes(data)
		}
	}, [data])

	async function fetchNotesCategories() {
		const response = await fetch(`${API_URL}dashboards/${dashboardId}/note-categories`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
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
		let url = `${API_URL}dashboards/${dashboardId}/folders/notes`
		if (folderId) {
			url = url + `/${folderId}`
		}
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
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

	const updateNote = async (
		title: string,
		content: string,
		category: string,
		tags: string | string[],
		folder_id: string,
		is_favourite: boolean,
		expired_at: string | null,
		noteId: string | null
	) => {
		let noteTags
		if (typeof tags === 'string') {
			noteTags = tags.split(/[\s,]+/)
		} else {
			noteTags = tags
		}
		noteTags = noteTags.map(tag => tag.trim()).filter(tag => tag.length > 0)
		const url = !noteId
			? `${API_URL}dashboards/${dashboardId}/add-note`
			: `${API_URL}dashboards/${dashboardId}/notes/${noteId}`
		const response = await fetch(url, {
			method: `${noteId ? 'PATCH' : 'POST'}`,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify({ title, content, category, noteTags, folder_id, is_favourite, expired_at }),
		})
		if (response.ok) {
			const updatedNote = await response.json()
			console.log(`Note ${noteId ? 'updated' : 'created'}`, updatedNote)
			fetchNotes()
		}
		setActiveModal(null)
	}

	const newModal = {
		name: 'createNote',
		data: {
			action: updateNote,
			actionName: 'Create note',
		},
		title: 'Add note',
	}

	const categoryModal = {
		name: 'addNoteCategory',
		title: 'Add note category',
	}

	const searchFilter = (val: string) => {
		const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(val.toLowerCase()))
		setFilteredNotes(filteredNotes)
	}

	const onSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setSearchValue(value)
		debouncedSearchFilter(value)
	}

	const handleChangeOptions = () => {
		let newNotes = notes.filter(n => {
			let condition
			switch (filterOrRule) {
				case true:
					condition = filterCategory === '' || n.category === filterCategory || n.is_favourite === isFavourite
					break
				case false:
					condition = (filterCategory === '' || n.category === filterCategory) && n.is_favourite === isFavourite
					break
			}
			return condition
		})
		if (sortBy !== '') {
			switch (sortBy) {
				case 'updateDate':
					newNotes.sort((a, b) => {
						let val
						if (sortOrder === 'desc') {
							val = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
						} else {
							val = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
						}
						return val
					})
					break
				case 'deadlineDate':
					newNotes.sort((a, b) => {
						let val
						if (sortOrder === 'desc') {
							val = new Date(b.expired_at).getTime() - new Date(a.expired_at).getTime()
						} else {
							val = new Date(a.expired_at).getTime() - new Date(b.expired_at).getTime()
						}
						return val
					})
					break
				case 'creationDate':
				default:
					newNotes.sort((a, b) => {
						let val
						if (sortOrder === 'desc') {
							val = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
						} else {
							val = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
						}
						return val
					})
			}
		}
		setFilteredNotes(newNotes)
	}

	return (
		<>
			<div className='w-100 d-flex justify-between align-center'>
				<div className='d-flex gap-2 flex-1'>
					<input
						className='w-50 min-w-125px'
						type='text'
						placeholder='Search note'
						value={searchValue}
						onChange={onSearchInputChange}
					/>
					<ToggleBox>
						<div className='d-flex justify-between align-center gap-2'>
							<div className='toggle-subtitle'>Settings</div>
							<Button variant='success' size='xs' onClick={handleChangeOptions}>
								Save
							</Button>
						</div>
						<div className='toggle-title'>Filter</div>
						<div className='toggle-subtitle'>Filter rule</div>
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
						<div className='toggle-separator'></div>
						<div className='toggle-subtitle'>Category</div>
						<select
							name='filterCategory'
							id='filterCategory'
							value={filterCategory}
							onChange={e => setFilterCategory(e.target.value)}>
							<option value=''>Choose category...</option>
							{categoryNames &&
								categoryNames.length > 0 &&
								categoryNames.map(cat => (
									<option key={cat} value={cat}>
										{cat}
									</option>
								))}
						</select>
						<div className='toggle-separator'></div>
						<div className='d-flex gap-2 align-center'>
							<input
								type='checkbox'
								name='favNote'
								id='isFav'
								checked={isFavourite}
								onChange={() => setIsFavourite(prevState => !prevState)}
							/>
							<label htmlFor='isFav'>Is favourite</label>
						</div>
						<div className='toggle-title'>Sorting</div>
						<div className='toggle-subtitle'>Sort by</div>
						<select name='sortBy' id='sortBy' value={sortBy} onChange={e => setSortBy(e.target.value)}>
							<option value=''>Sort by...</option>
							<option value='creationate'>Creation date</option>
							<option value='updateDate'>Update date</option>
							<option value='deadlineDate'>Deadline date</option>
						</select>
						<div className='toggle-subtitle'>Sort by</div>
						<select
							name='sortOrder'
							id='sortOrder'
							value={sortOrder}
							onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}>
							<option value='asc'>Ascending</option>
							<option value='desc'>Descending</option>
						</select>
					</ToggleBox>
				</div>
				<div className='d-flex gap-2 align-center'>
					<Button onClick={() => setActiveModal(newModal)}>
						<Plus size={16} />
						<span>Add note</span>
					</Button>
					<ExpandableMenu
						items={[
							{
								label: 'Add note category',
								action: () => setActiveModal(categoryModal),
							},
						]}></ExpandableMenu>
				</div>
			</div>
			{filteredNotes && filteredNotes.length > 0 ? (
				<div className='d-flex flex-column gap-4'>
					{filteredNotes.map(n => (
						<Note key={n._id} note={n} updateNote={updateNote} fetchNotes={fetchNotes} />
					))}
				</div>
			) : (
				<Alert className='m-0' variant='primary'>{`You don't have any notes${
					folderId ? ' in this folder' : ''
				}.`}</Alert>
			)}
		</>
	)
}
