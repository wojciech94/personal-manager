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
			<div className='px-4 pb-4 flex flex-col gap-2'>
				{dashboardId && folders && folders.length > 0 && (
					<>
						<div className='-mx-4 min-h-[60px] flex items-center justify-between gap-4 font-semibold bg-zinc-200 py-2 px-4  border-zinc-300 border-y'>
							{t('edit_folders')}
						</div>
						{folders.map(f => (
							<FolderRow key={f.name} folder={f} action={modalAction} dashboardId={dashboardId} />
						))}
					</>
				)}
				{modalData?.addAction && (
					<>
						<div className='-mx-4 min-h-[60px] flex items-center justify-between gap-4 font-semibold bg-zinc-200 py-2 px-4  border-zinc-300 border-y'>
							{t('add_folder')}
						</div>
						<FormRow label={t('folder_name')}>
							<input
								className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
								type='text'
								value={addInputValue}
								onChange={e => setAddInputValue(e.target.value)}
							/>
						</FormRow>
					</>
				)}
			</div>
			{modalData?.addAction && (
				<div className='py-4 px-6 border-t border-slate-300 bg-zinc-200 rounded-b-2xl'>
					<Button variant='success' className='w-full' onClick={handleAddFolderAction}>
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
		<div className='flex justify-between items-center gap-2 px-4'>
			{isEdit ? (
				<div className='flex gap-2 items-center h-11'>
					<input
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						type={'text'}
						value={inputValue}
						onChange={e => setInputValue(e.target.value)}
					/>
					<Button onlyIcon={true} variant='success' onClick={handleSave}>
						<Check size={16} />
					</Button>
				</div>
			) : (
				<div className='flex items-center h-11'>{folder.name}</div>
			)}
			<div className='flex gap-2'>
				{!isEdit && (
					<Button size='sm' onClick={() => setIsEdit(prevEdit => !prevEdit)}>
						<Edit size={16} /> {t('edit')}
					</Button>
				)}
				<Button size='sm' variant='danger' onClick={handleRemove}>
					<X size={16} /> {t('remove')}
				</Button>
			</div>
		</div>
	)
}
