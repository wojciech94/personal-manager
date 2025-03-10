import { useState, useEffect, ChangeEvent } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Folder } from '../../screens/Notes/types'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'
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
	const { accessToken } = useApi()
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
				const response = await fetch(`${API_URL}notes/${noteId}`, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${accessToken}`,
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
		const response = await fetch(`${API_URL}dashboards/${dashboardId}/note-categories`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
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
		const response = await fetch(`${API_URL}dashboards/${dashboardId}/folders`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
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
			<div className='card-content d-flex flex-column gap-3'>
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
