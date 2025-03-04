import { useEffect, useState } from 'react'
import { Check, Plus, Repeat, Trash2, User, X } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../config'
import { useAuth } from '../contexts/AuthContext'
import { useFetchDashboardsContext } from '../contexts/FetchDashboardsContext'
import { useModalContext } from '../contexts/ModalContext'
import { Button } from '../components/Button/Button'
import { Card, CardHeader } from '../components/Card/Card'
import { FormRow } from '../components/FormRow/FormRow'
import { Logs } from '../components/Logs/Logs'
import { DashboardType } from '../types/dashboard'
import { HeaderDataProps } from '../components/Card/types'

export const Dashboard: React.FC = () => {
	const [editMode, setEditMode] = useState(false)
	const navigate = useNavigate()
	const { setActiveModal } = useModalContext()
	const { fetchUserDashboards } = useFetchDashboardsContext()
	const [nameValue, setNameValue] = useState('')
	const [selectedOwner, setSelectedOwner] = useState('')
	const { dashboardId } = useParams()
	const { accessToken } = useAuth()
	const [dashboard, setDashboard] = useState<DashboardType | null>(null)

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
		const res = await fetch(`${API_URL}dashboards/${dashboardId}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})

		if (!res.ok) {
			const error: { message: string } = await res.json()
			console.error(error.message)
		} else {
			const data = await res.json()
			setDashboard(data)
			setEditMode(false)
		}
	}

	const updateDashboard = async () => {
		const res = await fetch(`${API_URL}dashboards/${dashboard?._id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name: nameValue, creatorId: selectedOwner }),
		})
		if (res.ok) {
			const data = await res.json()
			if (data?.creatorId) {
				setSelectedOwner(data.creatorId)
			}
			getDetails()
			fetchUserDashboards()
		} else {
			const error = await res.json()
			console.error(error.message)
		}
	}

	const handleInviteUser = async (userName: string) => {
		const res = await fetch(`${API_URL}notifications`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				content: `You have been invited to the dashboard (${dashboard?.name}) by ${dashboard?.creatorId.name}`,
				type: 'invitation',
				target: userName,
				dashboardId: dashboardId,
			}),
		})

		if (!res.ok) {
			const errorJson: { message: string } = await res.json()
			console.error(errorJson.message)
		} else {
			getDetails()
		}
	}

	const removeUser = async (id: string | null) => {
		if (accessToken) {
			const res = await fetch(`${API_URL}dashboards/${dashboardId}/remove`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id: id }),
			})
			if (!res.ok) {
				const errorJson: { message: string } = await res.json()
				console.error(errorJson?.message)
			} else {
				setEditMode(false)
				if (!id || id === dashboard?.creatorId?._id) {
					navigate('/')
				}
				if (dashboard && Array.isArray(dashboard.userIds) && dashboard.userIds.length > 1) {
					getDetails()
				}
			}
		}
	}

	const deleteDashboard = async () => {
		if (!accessToken) {
			return
		}
		const res = await fetch(`${API_URL}dashboards/${dashboardId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})
		if (!res.ok) {
			const errorJson: { message: string } = await res.json()
			if (errorJson) {
				console.error(errorJson.message)
			} else {
				console.error('Unknown error')
			}
		} else {
			setEditMode(false)
			navigate('/')
		}
	}

	const addUserModalData = {
		name: 'addUser',
		data: {
			action: handleInviteUser,
		},
		title: 'Invite user',
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
				label: editMode ? 'Details mode' : 'Edit mode',
				btnVariant: 'light',
			},
		]
		if (dashboard?.isOwner) {
			const deleteAction: HeaderDataProps = {
				action: deleteDashboard,
				icon: <Trash2 size={16} />,
				label: 'Delete dashboard',
				btnVariant: 'danger',
			}
			actionsArray.push(deleteAction)
		} else {
			const removeAction: HeaderDataProps = {
				action: () => removeUser(null),
				icon: <Trash2 size={16} />,
				label: 'Drop dashboard',
				btnVariant: 'danger',
			}
			actionsArray.push(removeAction)
		}

		return actionsArray
	}

	return (
		<>
			{dashboard && (
				<Card className='card-p0' headerComponent={<CardHeader title='Dashboard details' data={headerActions()} />}>
					<div className='d-flex flex-column gap-2 pt-4'>
						<FormRow label={'Name'} content={nameContent} />
						<FormRow label={'Owner'} content={ownerContent} />
						<FormRow className='mb-2' label={'Creation date'} content={dashboard?.created_at?.split('T')[0]} />
						{dashboard.userIds && dashboard.userIds.length > 0 && (
							<div className='d-flex flex-column gap-2'>
								<div className='card-subtitle'>
									Users
									<div className='d-flex gap-2'>
										{dashboard.isOwner && (
											<Button onClick={() => setActiveModal(addUserModalData)}>
												<Plus size={16} /> Invite user
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
									<Check size={16} /> Save dashboard
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
