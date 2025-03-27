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
		<div className='flex flex-col gap-5'>
			<div className='flex justify-between items-center gap-3'>
				<div className='flex gap-2 items-center scroll-x-auto'>
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
					className='sm:inline-flex p-2'
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
					<MoreVertical className='sm:hidden' size={16} />
					<span className='sm:hidden text-nowrap'>{t('edit_folders')}</span>
				</Button>
			</div>
			<Outlet />
		</div>
	)
}
