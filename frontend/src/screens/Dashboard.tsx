import React, { useEffect, useState } from 'react'
import { Check, Plus, Repeat, Trash2, User, X } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../config'
import { useApi } from '../contexts/ApiContext'
import { useFetchDashboardsContext } from '../contexts/FetchDashboardsContext'
import { useModalContext } from '../contexts/ModalContext'
import { Button } from '../components/Button/Button'
import { Card, CardHeader } from '../components/Card/Card'
import { FormRow } from '../components/FormRow/FormRow'
import { Logs } from './Logs/Logs'
import { DashboardType } from '../types/dashboard'
import { HeaderDataProps } from '../components/Card/types'
import { useTranslation } from '../contexts/TranslationContext'

export const Dashboard: React.FC = () => {
	const [dashboard, setDashboard] = useState<DashboardType | null>(null)
	const [editMode, setEditMode] = useState(false)
	const [nameValue, setNameValue] = useState('')
	const [selectedOwner, setSelectedOwner] = useState('')
	const { setActiveModal } = useModalContext()
	const { fetchUserDashboards } = useFetchDashboardsContext()
	const { dashboardId } = useParams()
	const navigate = useNavigate()
	const { fetchData } = useApi()
	const { t } = useTranslation()

	useEffect(() => {
		getDetails()
	}, [dashboardId])

	useEffect(() => {
		if (editMode) {
			setNameValue(dashboard?.name || '')
		}
	}, [editMode])

	useEffect(() => {
		if (dashboard) {
			setNameValue(dashboard.name || '')
			setSelectedOwner(dashboard.creatorId._id || '')
		}
	}, [dashboard])

	const getDetails = async () => {
		const url = `${API_URL}dashboards/${dashboardId}`
		const response = await fetchData<DashboardType>(url)

		if (response.error) {
			console.error('Failed to fetch dashboard:', response.status, response.error)
			return
		}

		const dashboardDetails = response.data
		setDashboard(dashboardDetails)
		setEditMode(false)
	}

	const updateDashboard = async () => {
		const url = `${API_URL}dashboards/${dashboard?._id}`
		const options = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name: nameValue, creatorId: selectedOwner }),
		}
		const response = await fetchData<DashboardType>(url, options)

		if (response.error) {
			console.error('Failed to update dashboard:', response.status, response.error)
			return
		}

		if (response.data) {
			const updatedDashboard = response.data
			if (updatedDashboard?.creatorId) {
				setSelectedOwner(updatedDashboard.creatorId._id)
			}
			getDetails()
			fetchUserDashboards()
		}
	}

	const handleInviteUser = async (userName: string) => {
		const url = `${API_URL}notifications`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				content: `You have been invited to the dashboard (${dashboard?.name}) by ${dashboard?.creatorId.name}`,
				type: 'invitation',
				target: userName,
				dashboardId: dashboardId,
			}),
		}
		const response = await fetchData<Notification>(url, options)

		if (response.error) {
			console.error('Failed to invite User:', response.status, response.error)
			return
		}

		if (response.data) {
			getDetails()
		}
	}

	const removeUser = async (id: string | null) => {
		const url = `${API_URL}dashboards/${dashboardId}/remove`
		const options = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id: id }),
		}
		const response = await fetchData<void>(url, options)

		if (response.error) {
			console.error('Failed to remove user.', response.status, response.error)
			return
		}

		if (response.status === 204) {
			setEditMode(false)
			if (!id || id === dashboard?.creatorId?._id) {
				navigate('/')
				fetchUserDashboards()
			}
			if (dashboard && Array.isArray(dashboard.userIds) && dashboard.userIds.length > 1) {
				getDetails()
			}
		}
	}

	const deleteDashboard = async () => {
		const url = `${API_URL}dashboards/${dashboardId}`
		const options = {
			method: 'DELETE',
		}
		const response = await fetchData<void>(url, options)

		if (response.error) {
			console.error('Failed to delete dashboard', response.status, response.error)
			return
		}

		if (response.status === 204) {
			setEditMode(false)
			navigate('/')
		}
	}

	const addUserModalData = {
		name: 'addUser',
		data: {
			action: handleInviteUser,
		},
		title: t('invite_user'),
	}

	const nameInput = <input type='text' value={nameValue} onChange={e => setNameValue(e.target.value)} />
	const ownerSelect = dashboard?.userIds ? (
		<select
			name='ownerSelect'
			id='ownerSelectId'
			className='p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
			value={selectedOwner}
			onChange={e => setSelectedOwner(e.target.value)}>
			{dashboard.userIds.map(u => (
				<option key={u._id} value={u._id}>
					{u.name}
				</option>
			))}
		</select>
	) : (
		''
	)
	const nameContent = editMode ? nameInput : dashboard?.name
	const ownerContent = editMode && dashboard?.isOwner ? ownerSelect : dashboard?.creatorId.name

	const headerActions = () => {
		const actionsArray: HeaderDataProps[] = [
			{
				action: () => setEditMode(prevVal => !prevVal),
				icon: <Repeat size={16} />,
				label: editMode ? t('details_mode') : t('edit_mode'),
				btnVariant: 'light',
			},
		]
		if (dashboard?.isOwner) {
			const deleteAction: HeaderDataProps = {
				action: deleteDashboard,
				icon: <Trash2 size={16} />,
				label: t('delete_dashboard'),
				btnVariant: 'danger',
			}
			actionsArray.push(deleteAction)
		} else {
			const removeAction: HeaderDataProps = {
				action: () => removeUser(null),
				icon: <Trash2 size={16} />,
				label: t('drop_dashboard'),
				btnVariant: 'danger',
			}
			actionsArray.push(removeAction)
		}

		return actionsArray
	}

	return (
		<>
			{dashboard && (
				<Card
					contentClass='!pb-0'
					headerComponent={<CardHeader title={t('dashboard_details')} data={headerActions()} />}>
					<div className='flex flex-col gap-2 pt-4'>
						<FormRow label={t('name')} content={nameContent} />
						<FormRow label={t('owner')} content={ownerContent} />
						<FormRow className='mb-2' label={t('creation_date')} content={dashboard?.created_at?.split('T')[0]} />
						{dashboard.userIds && dashboard.userIds.length > 0 && (
							<div className='flex flex-col gap-2'>
								<div className='-mx-4 min-h-[60px] flex items-center justify-between gap-4 font-semibold bg-zinc-200 py-2 px-4 border-zinc-300 border-y'>
									{t('users')}
									<div className='flex gap-2 font-normal'>
										{dashboard.isOwner && (
											<Button onClick={() => setActiveModal(addUserModalData)}>
												<Plus size={16} /> {t('invite_user')}
											</Button>
										)}
									</div>
								</div>
								<div className='flex gap-2 py-2 px-4'>
									{dashboard.userIds.map(u => (
										<Card key={u._id} contentClass='border-none !py-3'>
											<div className='flex items-center gap-2'>
												<User size={16} /> {u.name}
												{dashboard.isOwner && editMode && (
													<Button variant='text' onClick={() => removeUser(u._id)}>
														<X size={16} />
													</Button>
												)}
											</div>
										</Card>
									))}
								</div>
							</div>
						)}
						{editMode && (
							<div className='-mx-4 flex justify-center border-t border-light pt-4 pb-2'>
								<Button variant='success' onClick={updateDashboard}>
									<Check size={16} /> {t('save_dashboard')}
								</Button>
							</div>
						)}
						{dashboard.logsId && dashboard.logsId.logs.length > 0 && <Logs logs={dashboard.logsId.logs}></Logs>}
					</div>
				</Card>
			)}
		</>
	)
}
