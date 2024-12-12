import { useContext } from 'react'
import { useEffect, useState } from 'react'
import { Check, Edit, X } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { ModalContext } from '../../contexts/ModalContext'
import { FormRow } from '../FormRow/FormRow'

export function ModalFolderContent({ modalData }) {
	const [folders, setFolders] = useState([])
	const [addInputValue, setAddInputValue] = useState('')
	const { dashboardId } = useParams()
	const [, setActiveModal] = useContext(ModalContext)

	useEffect(() => {
		fetchFolders()
	}, [])

	const fetchFolders = async () => {
		const token = localStorage.getItem('token')
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/folders`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (res.ok) {
			const data = await res.json()
			setFolders(data)
		}
	}

	const action = () => {
		setActiveModal(null)
		modalData.action()
	}

	return (
		<>
			<div className='card-content pt-0 d-flex flex-column gap-3'>
				{folders && folders.length > 0 && (
					<>
						<div className='card-subtitle border-top-none'>Modify folders</div>
						{folders.map(f => (
							<FolderRow key={f.name} folder={f} action={action} dashboardId={dashboardId} />
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
					<button className='btn btn-success d-block w-100' onClick={() => modalData.addAction(addInputValue)}>
						Add folder
					</button>
				</div>
			)}
		</>
	)
}

function FolderRow({ folder, action, dashboardId }) {
	const [isEdit, setIsEdit] = useState(false)
	const [inputValue, setInputValue] = useState(folder.name)
	const token = localStorage.getItem('token')

	const handleSave = async () => {
		const res = await fetch(`${API_URL}folders/${folder._id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ name: inputValue }),
		})

		if (res.ok) {
			const data = await res.json()
			action()
			console.log(`Folder updated: ${data}`)
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
				Authorization: `Bearer ${token}`,
			},
		})

		if (res.ok) {
			const data = await res.json()
			action()
			console.log('Folder removed' + data)
		}
	}

	return (
		<div className='d-flex justify-between align-center gap-2 px-2'>
			{isEdit ? (
				<div className='d-flex gap-2'>
					<input type={'text'} value={inputValue} onChange={e => setInputValue(e.target.value)} />
					<button className='btn btn-icon btn-success' onClick={handleSave}>
						<Check size={16} />
					</button>
				</div>
			) : (
				<div>{folder.name}</div>
			)}
			<div className='d-flex gap-2'>
				<button className='btn btn-icon btn-primary d-flex gap-1' onClick={() => setIsEdit(prevEdit => !prevEdit)}>
					<Edit size={16} /> Edit
				</button>
				<button className='btn btn-icon btn-danger d-flex gap-1' onClick={handleRemove}>
					<X size={16} /> Remove
				</button>
			</div>
		</div>
	)
}
