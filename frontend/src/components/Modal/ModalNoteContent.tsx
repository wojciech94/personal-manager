import { useState, useEffect, ChangeEvent } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Folder } from '../../screens/Notes/types'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'
import { NoteProps, NoteType } from '../Note/types'
import { DataProps } from './types'

export const ModalNoteContent = ({ modalData }: { modalData: DataProps }) => {
	const [noteName, setNoteName] = useState('')
	const [noteContent, setNoteContent] = useState('')
	const [categoryNames, setCategoryNames] = useState<string[]>([])
	const [selectedCategory, setSelectedCategory] = useState('')
	const [isFavourite, setIsFavourite] = useState(false)
	const [selectedFolder, setSelectedFolder] = useState('')
	const [folderNames, setFolderNames] = useState<Folder[]>([])
	const [expiredDate, setExpiredDate] = useState('')
	const [noteTags, setNoteTags] = useState('')
	const { dashboardId } = useParams()
	const { fetchData } = useApi()
	const { t } = useTranslation()

	useEffect(() => {
		fetchNotesCategories()
	}, [])

	useEffect(() => {
		fetchFolders()
	}, [])

	useEffect(() => {
		const noteId = modalData.id
		if (noteId) {
			const fetchNoteData = async () => {
				const url = `${API_URL}notes/${noteId}`
				const response = await fetchData<NoteType>(url)

				if (response.error) {
					console.error('Failed to fetch note:', response.status, response.error)
					return
				}

				if (response.data) {
					const { title, content, category, tags, folder_id, is_favourite, expired_at } = response.data
					setNoteName(title)
					setNoteContent(content)
					setSelectedCategory(category)
					setNoteTags(tags.join(','))
					setSelectedFolder(folder_id)
					setIsFavourite(is_favourite)
					setExpiredDate(expired_at?.split('T')[0] || '')
				}
			}
			fetchNoteData()
		}
	}, [])

	async function fetchNotesCategories() {
		const url = `${API_URL}dashboards/${dashboardId}/note-categories`
		const response = await fetchData<string[]>(url)

		if (response.error) {
			console.error('Failed to fetch note categories:', response.status, response.error)
			return
		}

		if (response.data) {
			setCategoryNames(response.data)
		}
	}

	async function fetchFolders() {
		const url = `${API_URL}dashboards/${dashboardId}/folders`
		const response = await fetchData<Folder[]>(url)

		if (response.error) {
			console.error('Failed to fetch folders:', response.status, response.error)
			return
		}

		if (response.data) {
			setFolderNames(response.data)
		}
	}

	const handleUpdateNote = () => {
		if (modalData.action && modalData.action.length === 8) {
			const action = modalData.action as (
				title: string,
				content: string,
				category: string,
				tags: string | string[],
				folder_id: string,
				is_favourite: boolean,
				expired_at: string | null,
				note_id: string | null
			) => Promise<void>
			action(
				noteName,
				noteContent,
				selectedCategory,
				noteTags,
				selectedFolder,
				isFavourite,
				expiredDate,
				modalData.id ?? null
			)
			reset()
		}
	}

	const handleNoteTagsChanged = (e: ChangeEvent<HTMLInputElement>) => {
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

	const handleCategoryChange = (value: string) => {
		const categoryName = value
		setSelectedCategory(categoryName)
	}

	const handleFolderChange = (value: string) => {
		setSelectedFolder(value)
	}

	return (
		<>
			<div className='card-content flex flex-col gap-3'>
				<FormRow label={t('title')}>
					<input
						className='w-100'
						type='text'
						name='noteName'
						id='noteName'
						value={noteName}
						onChange={e => setNoteName(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('content')}>
					<textarea
						className='w-100'
						name='noteContent'
						id='noteContent'
						value={noteContent}
						onChange={e => setNoteContent(e.target.value)}
					/>
				</FormRow>
				<FormRow label={t('category')}>
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
				<FormRow label={t('tags')}>
					<input
						className='w-100'
						type='text'
						name='noteTags'
						id='noteTags'
						value={noteTags}
						onChange={handleNoteTagsChanged}
					/>
				</FormRow>
				<FormRow label={t('folder')}>
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
				<FormRow label={t('is_favourite')}>
					<input
						checked={isFavourite}
						type='checkbox'
						name='isFavourite'
						id='isFavourite'
						onChange={() => setIsFavourite(prevFav => !prevFav)}
					/>
				</FormRow>
				<FormRow label={t('expire_at')}>
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
				<Button variant='success' className='w-100' onClick={handleUpdateNote}>
					{modalData.actionName}
				</Button>
			</div>
		</>
	)
}
