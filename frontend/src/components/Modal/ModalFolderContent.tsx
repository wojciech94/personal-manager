import { useEffect, useState } from 'react'
import { Check, Edit, X } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useModalContext } from '../../contexts/ModalContext'
import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'
import { Folder } from '../../screens/Notes/Folders'
import { Button } from '../Button/Button'
import { useAuth } from '../../contexts/AuthContext'

export function ModalFolderContent({ modalData }: { modalData: DataProps }) {
	const [folders, setFolders] = useState<Folder[]>([])
	const [addInputValue, setAddInputValue] = useState('')
	const { dashboardId } = useParams()
	const { setActiveModal } = useModalContext()
	const { accessToken } = useAuth()

	useEffect(() => {
		fetchFolders()
	}, [])

	const fetchFolders = async () => {
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/folders`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})

		if (res.ok) {
			const data = await res.json()
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
						<div className='card-subtitle'>Modify folders</div>
						{folders.map(f => (
							<FolderRow key={f.name} folder={f} action={modalAction} dashboardId={dashboardId} />
						))}
					</>
				)}
				{modalData?.addAction && (
					<>
						<div className='card-subtitle'>Add folder</div>
						<FormRow label='Folder name'>
							<input type='text' value={addInputValue} onChange={e => setAddInputValue(e.target.value)} />
						</FormRow>
					</>
				)}
			</div>
			{modalData?.addAction && (
				<div className='card-footer border-light'>
					<Button variant='success' className='w-100' onClick={handleAddFolderAction}>
						Add folder
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

function FolderRow({ folder, action, dashboardId, className }: FolderRowProps) {
	const [isEdit, setIsEdit] = useState(false)
	const [inputValue, setInputValue] = useState(folder.name)
	const { accessToken } = useAuth()

	const handleSave = async () => {
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/folders/${folder._id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify({ name: inputValue }),
		})

		if (res.ok) {
			const data = await res.json()
			action()
		} else {
			console.log('Folder update failed')
		}
	}

	const handleRemove = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/folders/${folder._id}`
		const res = await fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		})

		if (res.ok) {
			const data = await res.json()
			action()
			console.log('Folder removed' + data)
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
					<Edit size={16} /> Edit
				</Button>
				<Button size='sm' variant='danger' onClick={handleRemove}>
					<X size={16} /> Remove
				</Button>
			</div>
		</div>
	)
}
