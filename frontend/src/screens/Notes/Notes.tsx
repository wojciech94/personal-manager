import { useState, useEffect, useCallback, ChangeEvent } from 'react'
import { useLoaderData, useParams, useRevalidator } from 'react-router-dom'
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
import { useTranslation } from '../../contexts/TranslationContext'

export const Notes = () => {
	const data = useLoaderData() as NoteType[]
	const [notes, setNotes] = useState<NoteType[]>([])
	const [filteredNotes, setFilteredNotes] = useState<NoteType[]>([])
	const [categoryNames, setCategoryNames] = useState<string[]>([])
	const [filterCategory, setFilterCategory] = useState('')
	const [isFavourite, setIsFavourite] = useState(false)
	const [sortBy, setSortBy] = useState('')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
	const [filterOrRule, setFilterOrRule] = useState(true)
	const [searchValue, setSearchValue] = useState('')
	const { setActiveModal } = useModalContext()
	const { dashboardId, folderId } = useParams()
	const { revalidate } = useRevalidator()
	const { fetchData } = useApi()
	const { t } = useTranslation()

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
		const url = `${API_URL}dashboards/${dashboardId}/note-categories`
		const response = await fetchData<string[]>(url)

		if (response.error) {
			console.error('Failed to fetch Notes Categories:', response.status, response.error)
			return
		}

		if (response.data) {
			const categoryNames: string[] = response.data
			setCategoryNames(categoryNames)
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
		const options = {
			method: `${noteId ? 'PATCH' : 'POST'}`,
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ title, content, category, noteTags, folder_id, is_favourite, expired_at }),
		}
		const response = await fetchData<NoteType[]>(url, options)
		if (response.error) {
			console.error('Failed to update note: ', response.status, response.error)
			return
		}

		revalidate()
		setActiveModal(null)
	}

	const newNoteModal = {
		name: 'createNote',
		data: {
			action: updateNote,
			actionName: t('create_note'),
		},
		title: t('add_note'),
	}

	const categoryModal = {
		name: 'addNoteCategory',
		title: t('add_note_category'),
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
						placeholder={t('search_note')}
						value={searchValue}
						onChange={onSearchInputChange}
					/>
					<ToggleBox>
						<div className='d-flex justify-between align-center gap-2'>
							<div className='toggle-subtitle'>{t('settings')}</div>
							<Button variant='success' size='xs' onClick={handleChangeOptions}>
								{t('save')}
							</Button>
						</div>
						<div className='toggle-title'>{t('filter')}</div>
						<div className='toggle-subtitle'>{t('filter_rule')}</div>
						<div className='d-flex gap-4 align-center'>
							<div className='d-flex gap-2 align-center'>
								<input
									checked={filterOrRule}
									type='radio'
									name='filterRadio'
									id='filterRuleOr'
									onChange={() => setFilterOrRule(true)}
								/>
								<label htmlFor='filterRuleOr'>{t('or')}</label>
							</div>
							<div className='d-flex gap-2 align-center'>
								<input
									checked={!filterOrRule}
									type='radio'
									name='filterRadio'
									id='filterRuleAnd'
									onChange={() => setFilterOrRule(false)}
								/>
								<label htmlFor='filterRuleAnd'>{t('and')}</label>
							</div>
						</div>
						<div className='toggle-separator'></div>
						<div className='toggle-subtitle'>{t('category')}</div>
						<select
							name='filterCategory'
							id='filterCategory'
							value={filterCategory}
							onChange={e => setFilterCategory(e.target.value)}>
							<option value=''>{t('choose_category')}</option>
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
							<label htmlFor='isFav'>{t('is_favourite')}</label>
						</div>
						<div className='toggle-title'>{t('sorting')}</div>
						<div className='toggle-subtitle'>{t('sort_by')}</div>
						<select name='sortBy' id='sortBy' value={sortBy} onChange={e => setSortBy(e.target.value)}>
							<option value=''>{t('sort_by')}</option>
							<option value='creationate'>{t('creation_date')}</option>
							<option value='updateDate'>{t('update_date')}</option>
							<option value='deadlineDate'>{t('deadline_date')}</option>
						</select>
						<div className='toggle-subtitle'>{t('sorting_order')}</div>
						<select
							name='sortOrder'
							id='sortOrder'
							value={sortOrder}
							onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}>
							<option value='asc'>{t('ascending')}</option>
							<option value='desc'>{t('descending')}</option>
						</select>
					</ToggleBox>
				</div>
				<div className='d-flex gap-2 align-center'>
					<Button onClick={() => setActiveModal(newNoteModal)}>
						<Plus size={16} />
						<span>{t('add_note')}</span>
					</Button>
					<ExpandableMenu
						items={[
							{
								label: t('add_note_category'),
								action: () => setActiveModal(categoryModal),
							},
						]}></ExpandableMenu>
				</div>
			</div>
			{filteredNotes && filteredNotes.length > 0 ? (
				<div className='d-flex flex-column gap-4'>
					{filteredNotes.map(n => (
						<Note key={n._id} note={n} updateNote={updateNote} fetchNotes={revalidate} />
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
