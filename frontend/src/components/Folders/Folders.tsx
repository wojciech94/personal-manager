import { useEffect, useState } from 'react'
import { Settings } from 'react-feather'
import { NavLink, Outlet, useLoaderData, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useModalContext } from '../../contexts/ModalContext'

export type Folder = {
	name: string
	_id: string
}
type LoaderData = Folder[]

export const Folders = () => {
	const loaderData = useLoaderData() as LoaderData
	const [data, setData] = useState<LoaderData | null>(loaderData)
	const { setActiveModal } = useModalContext()
	const { dashboardId } = useParams()

	const handleAddFolder = async (val: string) => {
		const token = localStorage.getItem('token')
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/add-folder`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ name: val }),
		})

		if (res.ok) {
			const data = await res.json()
			console.log('Folder created:' + data.folderId)
		} else {
			console.log(`Couldn't create folder`)
		}
		fetchFolders()
		setActiveModal(null)
	}

	const fetchFolders = async () => {
		const token = localStorage.getItem('token')
		if (!token) {
			return
		}
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/folders`, {
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
				<button
					className='btn btn-light d-flex align-center gap-2'
					onClick={() =>
						setActiveModal({
							name: 'editFolder',
							title: 'Update folders',
							data: {
								action: fetchFolders,
								addAction: handleAddFolder,
							},
						})
					}>
					<Settings size={16} />
					Modify folders
				</button>
			</div>
			<Outlet />
		</div>
	)
}
