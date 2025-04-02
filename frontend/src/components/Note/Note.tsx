import { Edit, X, Clock } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { getLocaleDateTime } from '../../utils/datetime'
import { Button } from '../Button/Button'
import { NoteProps, NoteType } from './types'
import React from 'react'

export const Note: React.FC<NoteProps> = ({ note, updateNote, fetchNotes }): React.JSX.Element => {
	const { setActiveModal } = useModalContext()
	const { dashboardId } = useParams()
	const { fetchData } = useApi()
	const { t } = useTranslation()

	const removeNote = async (id: string): Promise<void> => {
		if (id) {
			const url = `${API_URL}dashboards/${dashboardId}/notes/remove`
			const options = {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id }),
			}
			const response = await fetchData<NoteType>(url, options)

			if (response.error) {
				console.error('Failed to remove note:', response.status, response.error)
				return
			}

			if (response.data) {
				fetchNotes()
			}
		} else {
			console.error('Cannot remove note: Missing or invalid Id')
		}
	}

	const editModal = (id: string) => {
		return {
			name: 'editNote',
			data: {
				action: updateNote,
				actionName: t('update_note'),
				id: id,
			},
			title: t('update_note'),
		}
	}

	return (
		<div
			key={note._id}
			className={`p-3 flex flex-col gap-2 border-2 shadow-md rounded-xl ${
				note.is_favourite ? 'border-yellow-300 shadow-md shadow-yellow-200' : 'border-zinc-300'
			}`}>
			<div className='flex justify-between gap-3'>
				<div className='flex gap-3 items-center'>
					<div className='text-lg font-medium'>{note.title}</div>
					<div className='inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-violet-600 rounded-full'>
						{note.category}
					</div>
				</div>
				<div className='flex gap-2 items-center'>
					<Button onlyIcon={true} onClick={() => setActiveModal?.(() => editModal(note._id))}>
						<Edit size={16} />
					</Button>
					<Button onlyIcon={true} variant='danger' onClick={() => removeNote(note._id)}>
						<X size={16} />
					</Button>
				</div>
			</div>
			{note.tags && note.tags.length > 0 && (
				<div className='flex gap-2'>
					{note.tags &&
						note.tags.map(t => (
							<div key={t} className='tag'>
								{t}
							</div>
						))}
				</div>
			)}
			<div className='-mx-3 px-3 py-3 border-t border-b border-light'>{note.content}</div>
			<div className='flex gap-3 justify-between -mx-3 px-3 pt-2'>
				<div className='flex gap-2 items-center text-zinc-600'>
					<Edit size={18} /> {getLocaleDateTime(note.updated_at)}
				</div>
				{note.expired_at ? (
					<div className='flex gap-2 items-center text-zinc-600'>
						<Clock size={18} /> {getLocaleDateTime(note.expired_at)}
					</div>
				) : (
					''
				)}
			</div>
		</div>
	)
}
