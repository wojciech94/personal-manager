import { useContext, useState } from 'react'
import { Check, Plus, MoreVertical, X } from 'react-feather'
import { NavLink, Outlet, useLoaderData, useParams } from 'react-router-dom'
import { ModalContext } from '../../contexts/ModalContext'

export const Folders = () => {
	const [, setActiveModal] = useContext(ModalContext)
	const [showAddFolder, setShowAddFolder] = useState(false)
	const [folderName, setFolderName] = useState('')
	const [data, setData] = useState(useLoaderData())
	const { dashboardId, folderId } = useParams()

	const handleAddFolder = async () => {
		const token = localStorage.getItem('token')
		const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}/add-folder`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ name: folderName }),
		})

		if (res.ok) {
			const data = await res.json()
			console.log('Folder created:' + data.folderId)
		} else {
			console.log(`Couldn't create folder`)
		}
		setShowAddFolder(false)
		setFolderName('')
		fetchFolders()
	}

	const handleCloseAddFolder = () => {
		setFolderName('')
		setShowAddFolder(false)
	}

	const fetchFolders = async () => {
		const token = localStorage.getItem('token')
		const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}/folders`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (res.ok) {
			const data = await res.json()
			setData(data)
		}
	}

	return (
		<div className='d-flex flex-column gap-5'>
			<div className='d-flex justify-between gap-3'>
				<div className='d-flex gap-2'>
					<NavLink className='btn btn-light' to={`/dashboards/${dashboardId}/folders/notes`} end>
						All notes
					</NavLink>
					{data &&
						data.length > 0 &&
						data.map(d => (
							<NavLink key={d._id} to={`/dashboards/${dashboardId}/folders/notes/${d._id}`} className='btn btn-light'>
								{d.name}
							</NavLink>
						))}
				</div>
				<div className='d-flex gap-2 align-center'>
					{!showAddFolder ? (
						<button
							className='btn btn-primary btn-icon d-flex align-center gap-2'
							onClick={() => setShowAddFolder(true)}>
							<Plus size={16} />
							<span>Add folder</span>
						</button>
					) : (
						<div className='d-flex gap-2'>
							<input type='text' value={folderName} onChange={e => setFolderName(e.target.value)} />
							<button className='btn btn-icon btn-success' onClick={handleAddFolder}>
								<Check size={16} />
							</button>
							<button className='btn btn-icon btn-danger' onClick={handleCloseAddFolder}>
								<X size={16} />
							</button>
						</div>
					)}
					<button
						className='btn btn-icon btn-light'
						onClick={() =>
							setActiveModal({
								name: 'editFolder',
								title: 'Update folders',
								data: {
									action: fetchFolders,
								},
							})
						}>
						<MoreVertical size={16} />
					</button>
				</div>
			</div>
			<Outlet />
		</div>
	)
}
