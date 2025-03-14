import { useEffect, useState } from 'react'
import { Check, Edit, X } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useModalContext } from '../../contexts/ModalContext'
import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'
import { Button } from '../Button/Button'
import { useApi } from '../../contexts/ApiContext'
import { Folder } from '../../screens/Notes/types'
import { useTranslation } from '../../contexts/TranslationContext'

export function ModalFolderContent({ modalData }: { modalData: DataProps }) {
	const [folders, setFolders] = useState<Folder[]>([])
	const [addInputValue, setAddInputValue] = useState('')
	const { dashboardId } = useParams()
	const { setActiveModal } = useModalContext()
	const { fetchData } = useApi()
	const { t } = useTranslation()

	useEffect(() => {
		fetchFolders()
	}, [])

	const fetchFolders = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/folders`

		const response = await fetchData<Folder[]>(url)

		if (response.error) {
			console.error('Failed to fetch folders:', response.status, response.error)
			return
		}

		if (response.data) {
			const data = response.data
			setFolders(data)
		}
	}

	const modalAction = () => {
		if (modalData.action && typeof modalData.action === 'function' && modalData.action.length === 0) {
			const action = modalData.action as () => Promise<void>
			action()
			setActiveModal(null)
		}
	}

	const handleAddFolderAction = () => {
		if (modalData.addAction && typeof modalData.addAction === 'function' && modalData.addAction.length === 1) {
			const action = modalData.addAction as (arg: string) => Promise<void>
			action(addInputValue)
		}
	}

	return (
		<>
			<div className='card-content d-flex flex-column gap-3 pt-0'>
				{dashboardId && folders && folders.length > 0 && (
					<>
						<div className='card-subtitle'>{t('edit_folders')}</div>
						{folders.map(f => (
							<FolderRow key={f.name} folder={f} action={modalAction} dashboardId={dashboardId} />
						))}
					</>
				)}
				{modalData?.addAction && (
					<>
						<div className='card-subtitle'>{t('add_folder')}</div>
						<FormRow label={t('folder_name')}>
							<input type='text' value={addInputValue} onChange={e => setAddInputValue(e.target.value)} />
						</FormRow>
					</>
				)}
			</div>
			{modalData?.addAction && (
				<div className='card-footer border-light'>
					<Button variant='success' className='w-100' onClick={handleAddFolderAction}>
						{t('add_folder')}
					</Button>
				</div>
			)}
		</>
	)
}

type FolderRowProps = {
	folder: Folder
	action: () => void
	dashboardId: string
	className?: string
}

function FolderRow({ folder, action, dashboardId }: FolderRowProps) {
	const [isEdit, setIsEdit] = useState(false)
	const [inputValue, setInputValue] = useState(folder.name)
	const { fetchData } = useApi()
	const { t } = useTranslation()

	const handleSave = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/folders/${folder._id}`
		const options = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name: inputValue }),
		}

		const response = await fetchData<Folder>(url, options)

		if (response.error) {
			console.error('Failed to update folder:', response.status, response.error)
			return
		}

		if (response.data) {
			action()
		}
	}

	const handleRemove = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/folders/${folder._id}`
		const options = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		}

		const response = await fetchData<Folder>(url, options)

		if (response.error) {
			console.error('Failed to remove folder:', response.status, response.error)
			return
		}

		if (response.data) {
			action()
		}
	}

	return (
		<div className='d-flex justify-between align-center gap-2 px-4'>
			{isEdit ? (
				<div className='d-flex gap-2'>
					<input type={'text'} value={inputValue} onChange={e => setInputValue(e.target.value)} />
					<Button size='sm' variant='success' onClick={handleSave}>
						<Check size={16} />
					</Button>
				</div>
			) : (
				<div>{folder.name}</div>
			)}
			<div className='d-flex gap-2'>
				<Button size='sm' onClick={() => setIsEdit(prevEdit => !prevEdit)}>
					<Edit size={16} /> {t('edit')}
				</Button>
				<Button size='sm' variant='danger' onClick={handleRemove}>
					<X size={16} /> {t('remove')}
				</Button>
			</div>
		</div>
	)
}
