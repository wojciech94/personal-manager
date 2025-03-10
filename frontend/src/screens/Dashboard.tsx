import { useEffect, useState } from 'react'
import { Check, Plus, Repeat, Trash2, User, X } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../config'
import { useApi } from '../contexts/ApiContext'
import { useFetchDashboardsContext } from '../contexts/FetchDashboardsContext'
import { useModalContext } from '../contexts/ModalContext'
import { Button } from '../components/Button/Button'
import { Card, CardHeader } from '../components/Card/Card'
import { FormRow } from '../components/FormRow/FormRow'
import { Logs } from '../components/Logs/Logs'
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
					className='card-p0'
					headerComponent={<CardHeader title={t('dashboard_details')} data={headerActions()} />}>
					<div className='d-flex flex-column gap-2 pt-4'>
						<FormRow label={t('name')} content={nameContent} />
						<FormRow label={t('owner')} content={ownerContent} />
						<FormRow className='mb-2' label={t('creation_date')} content={dashboard?.created_at?.split('T')[0]} />
						{dashboard.userIds && dashboard.userIds.length > 0 && (
							<div className='d-flex flex-column gap-2'>
								<div className='card-subtitle'>
									{t('users')}
									<div className='d-flex gap-2'>
										{dashboard.isOwner && (
											<Button onClick={() => setActiveModal(addUserModalData)}>
												<Plus size={16} /> {t('invite_user')}
											</Button>
										)}
									</div>
								</div>
								<div className='d-flex gap-2 py-2 px-4'>
									{dashboard.userIds.map(u => (
										<Card key={u._id} contentClass='border-none'>
											<div className='d-flex align-center gap-2'>
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
							<div className='d-flex justify-center border-top border-light pt-4 pb-2'>
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
