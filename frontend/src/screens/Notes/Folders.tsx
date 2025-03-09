import { useState } from 'react'
import { MoreVertical } from 'react-feather'
import { NavLink, Outlet, useLoaderData, useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { Button } from '../../components/Button/Button'
import { Folder } from './types'
import { useTranslation } from '../../contexts/TranslationContext'

export const Folders = () => {
	const loaderData = useLoaderData() as Folder[]
	const [folders, setFolders] = useState<Folder[] | null>(loaderData)
	const { setActiveModal } = useModalContext()
	const { dashboardId } = useParams()
	const { fetchData } = useApi()
	const { t } = useTranslation()

	const handleAddFolder = async (val: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/add-folder`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name: val }),
		}

		const response = await fetchData<Folder>(url, options)

		if (response.error) {
			console.error('Failed to add folder', response.status, response.error)
			return
		}

		if (response.data) {
			const newFolder: Folder = response.data
			setFolders(prev => (prev ? [...prev, newFolder] : [newFolder]))
			setActiveModal(null)
		}
	}

	const fetchFolders = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/folders`
		const response = await fetchData<Folder[]>(url)

		if (response.error) {
			console.error('Failed to fetch folders', response.status, response.error)
			return
		}

		setFolders(response.data)
	}

	return (
		<div className='d-flex flex-column gap-5'>
			<div className='d-flex justify-between align-center gap-3'>
				<div className='d-flex gap-2 align-center scroll-x-auto'>
					<NavLink className='btn link' to={`/dashboards/${dashboardId}/folders/notes`} end>
						{t('all_notes')}
					</NavLink>
					{folders &&
						folders.length > 0 &&
						folders.map(d => (
							<NavLink key={d._id} to={`/dashboards/${dashboardId}/folders/notes/${d._id}`} className='btn link'>
								{d.name}
							</NavLink>
						))}
				</div>
				<Button
					variant='light'
					className='btn-mobile-icon'
					onClick={() =>
						setActiveModal({
							name: 'editFolder',
							title: t('update_folders'),
							data: {
								action: fetchFolders,
								addAction: handleAddFolder,
							},
						})
					}>
					<MoreVertical className='d-none-sm' size={16} />
					<span className='d-mobile-none text-nowrap'>{t('modify_folders')}</span>
				</Button>
			</div>
			<Outlet />
		</div>
	)
}
