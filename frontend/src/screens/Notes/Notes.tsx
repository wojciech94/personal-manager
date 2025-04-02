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
import { SortDirection } from '../../types/global'

export const Notes = () => {
	const data = useLoaderData() as NoteType[]
	const [notes, setNotes] = useState<NoteType[]>([])
	const [filteredNotes, setFilteredNotes] = useState<NoteType[]>([])
	const [categoryNames, setCategoryNames] = useState<string[]>([])
	const [filterCategory, setFilterCategory] = useState('')
	const [isFavourite, setIsFavourite] = useState(false)
	const [sortBy, setSortBy] = useState('')
	const [sortOrder, setSortOrder] = useState<SortDirection>('asc')
	const [filterOrRule, setFilterOrRule] = useState(true)
	const [searchValue, setSearchValue] = useState('')
	const [showFoldersInfo, setShowFoldersInfo] = useState(true)
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
		const showInfo = localStorage.getItem('folders-info')

		if (showInfo) {
			try {
				const state = JSON.parse(showInfo)
				setShowFoldersInfo(state)
			} catch (error) {
				console.error('Błąd parsowania JSON:', error)
				setShowFoldersInfo(false)
			}
		} else {
			localStorage.setItem('folders-info', JSON.stringify(true))
			setShowFoldersInfo(true)
		}

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

	const handleHideFoldersInfo = () => {
		localStorage.setItem('folders-info', JSON.stringify(false))
		setShowFoldersInfo(false)
	}

	return (
		<>
			<div className='w-full flex justify-between items-center'>
				<div className='flex gap-2 flex-1'>
					<input
						className='w-1/2 min-w-[125px] px-4 py-2 text-gray-800 placeholder-gray-500 bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
						type='text'
						placeholder={t('search_note')}
						value={searchValue}
						onChange={onSearchInputChange}
					/>
					<ToggleBox>
						<div className='flex justify-between items-center gap-2'>
							<div className='font-semibold'>{t('settings')}</div>
							<Button variant='success' size='sm' onClick={handleChangeOptions}>
								{t('save')}
							</Button>
						</div>
						<div className='font-semibold -mx-4 py-1 px-4 bg-zinc-100 border  border-y-zinc-300'>{t('filter')}</div>
						<div className='font-semibold'>{t('filter_rule')}</div>
						<div className='flex gap-4 items-center'>
							<div className='flex gap-2 items-center'>
								<input
									checked={filterOrRule}
									type='radio'
									name='filterRadio'
									id='filterRuleOr'
									className='w-4 h-4 bg-gray-100 border-gray-300'
									onChange={() => setFilterOrRule(true)}
								/>
								<label htmlFor='filterRuleOr'>{t('or')}</label>
							</div>
							<div className='flex gap-2 items-center'>
								<input
									checked={!filterOrRule}
									type='radio'
									name='filterRadio'
									id='filterRuleAnd'
									className='w-4 h-4 bg-gray-100 border-gray-300'
									onChange={() => setFilterOrRule(false)}
								/>
								<label htmlFor='filterRuleAnd'>{t('and')}</label>
							</div>
						</div>
						<div className='my-1 -mx-4 border-b border-b-zinc-300'></div>
						<div className='font-semibold'>{t('category')}</div>
						<select
							name='filterCategory'
							id='filterCategory'
							value={filterCategory}
							className='px-3 py-1 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							onChange={e => setFilterCategory(e.target.value)}>
							<option value=''>{t('choose_category')}</option>
							{categoryNames &&
								categoryNames.length > 0 &&
								categoryNames.map(cat => (
									<option className='text-gray-800 bg-white hover:bg-gray-100' key={cat} value={cat}>
										{cat}
									</option>
								))}
						</select>
						<div className='my-1 -mx-4 border-b border-b-zinc-300'></div>
						<div className='flex gap-2 items-center'>
							<input
								type='checkbox'
								name='favNote'
								id='isFav'
								className='w-4 h-4 bg-gray-100 border-gray-300'
								checked={isFavourite}
								onChange={() => setIsFavourite(prevState => !prevState)}
							/>
							<label htmlFor='isFav'>{t('is_favourite')}</label>
						</div>
						<div className='font-semibold -mx-4 py-1 px-4 bg-zinc-100 border  border-y-zinc-300'>{t('sorting')}</div>
						<div className='font-semibold'>{t('sort_by')}</div>
						<select
							name='sortBy'
							id='sortBy'
							className='px-3 py-1 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							value={sortBy}
							onChange={e => setSortBy(e.target.value)}>
							<option className='text-gray-800 bg-white hover:bg-gray-100' value=''>
								{t('sort_by')}
							</option>
							<option className='text-gray-800 bg-white hover:bg-gray-100' value='creationate'>
								{t('creation_date')}
							</option>
							<option className='text-gray-800 bg-white hover:bg-gray-100' value='updateDate'>
								{t('update_date')}
							</option>
							<option className='text-gray-800 bg-white hover:bg-gray-100' value='deadlineDate'>
								{t('deadline_date')}
							</option>
						</select>
						<div className='font-semibold'>{t('sorting_order')}</div>
						<select
							name='sortOrder'
							id='sortOrder'
							value={sortOrder}
							className='px-3 py-1 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							onChange={e => setSortOrder(e.target.value as SortDirection)}>
							<option className='text-gray-800 bg-white hover:bg-gray-100' value='asc'>
								{t('ascending')}
							</option>
							<option className='text-gray-800 bg-white hover:bg-gray-100' value='desc'>
								{t('descending')}
							</option>
						</select>
					</ToggleBox>
				</div>
				<div className='flex gap-2 items-center'>
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
			{showFoldersInfo && (
				<Alert className='!m-0' onHideAction={handleHideFoldersInfo}>
					{t('add_folders_info')}
				</Alert>
			)}
			{filteredNotes && filteredNotes.length > 0 ? (
				<div className='flex flex-col gap-4'>
					{filteredNotes.map(n => (
						<Note key={n._id} note={n} updateNote={updateNote} fetchNotes={revalidate} />
					))}
				</div>
			) : (
				<Alert className='!m-0'>{`${t('you_dont_have_any_notes')} ${folderId ? t('in_this_folder') : ''}.`}</Alert>
			)}
		</>
	)
}
