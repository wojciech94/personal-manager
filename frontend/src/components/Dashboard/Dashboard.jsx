import { Menu } from '../Menu/Menu'
import { Outlet, useMatch, useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader } from '../Card/Card'
import { useEffect, useState } from 'react'
import { FormRow } from '../FormRow/FormRow'
import { Check, Plus, Repeat, Trash, User, X } from 'react-feather'
import { useContext } from 'react'
import { ModalContext } from '../../contexts/ModalContext'
import { FetchDashboardsContext } from '../../contexts/FetchDashboardsContext'

export const Dashboard = () => {
	const { dashboardId } = useParams()
	const [dashboard, setDashboard] = useState(null)
	const [editMode, setEditMode] = useState(false)
	const navigate = useNavigate()
	const isExactMatch = useMatch('/dashboards/:dashboardId')
	const token = localStorage.getItem('token')

	const getDetails = async () => {
		const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (!res.ok) {
			const error = await res.json()
			console.error('Server error', error)
		} else {
			const data = await res.json()
			setDashboard(data)
			setEditMode(false)
		}
	}

	useEffect(() => {
		getDetails()
	}, [dashboardId])

	const removeUser = async id => {
		if (token) {
			const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}/remove`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id: id }),
			})
			if (!res.ok) {
				const errorData = await res.json().message
				console.error(errorData)
			} else {
				const data = await res.json()
				setEditMode(false)
				if (!id || id === dashboard?.creatorId?._id) {
					navigate('/')
				}
				if (dashboard.userIds.length > 1) {
					getDetails()
				}
			}
		}
	}

	const headerActions = () => {
		const actionsArray = [
			{
				action: () => setEditMode(prevVal => !prevVal),
				icon: <Repeat size={16} />,
				label: editMode ? 'Details mode' : 'Edit mode',
				btnClass: 'btn-light',
			},
		]
		if (dashboard && !dashboard.isOwner) {
			const removeAction = {
				action: () => removeUser(null),
				icon: <Trash size={16} />,
				label: 'Drop dashboard',
				btnClass: 'btn-danger',
			}
			actionsArray.push(removeAction)
		}

		return actionsArray
	}

	const cardHeader = <CardHeader title='Dashboard details' data={headerActions()} />

	return (
		<div className='d-flex justify-between align-start gap-5'>
			<Menu />
			<div className='flex-1 max-w-1200px mx-auto p-5'>
				{isExactMatch ? (
					<Card headerComponent={cardHeader}>
						<DashboardDetails
							dashboard={dashboard}
							dashboardId={dashboardId}
							editMode={editMode}
							getDetails={getDetails}
							removeUser={removeUser}
						/>
					</Card>
				) : (
					<Outlet />
				)}
			</div>
		</div>
	)
}

const DashboardDetails = ({ dashboardId, dashboard, editMode, getDetails, removeUser }) => {
	const [, setActiveModal] = useContext(ModalContext)
	const [fetchUserDashboards] = useContext(FetchDashboardsContext)
	const [nameValue, setNameValue] = useState('')
	const [selectedOwner, setSelectedOwner] = useState('')

	useEffect(() => {
		if (editMode) {
			setNameValue(dashboard.name)
		}
	}, [editMode])

	useEffect(() => {
		if (dashboard) {
			setNameValue(dashboard.name || '')
			setSelectedOwner(dashboard.creatorId || '')
		}
	}, [dashboard])

	const updateDashboard = async () => {
		const token = localStorage.getItem('token')
		const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name: nameValue, creatorId: selectedOwner }),
		})
		if (res.ok) {
			const data = await res.json()
			console.log(data)
			if (data?.creatorId) {
				setSelectedOwner(data.creatorId)
			}
			getDetails()
			fetchUserDashboards()
		} else {
			const error = await res.json()
			console.log(error.message)
		}
	}

	const handleAddUser = async userName => {
		const token = localStorage.getItem('token')
		const res = await fetch(`http://localhost:5000/dashboards/${dashboardId}/add-user`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name: userName }),
		})

		if (!res.ok) {
			const error = await res.json().message
			console.error('Server error:', error)
		} else {
			const data = await res.json()
			getDetails()
		}
	}

	const addUserModalData = {
		name: 'addUser',
		data: {
			action: handleAddUser,
		},
		title: 'Add user',
	}

	const nameInput = <input type='text' value={nameValue} onChange={e => setNameValue(e.target.value)} />
	const ownerSelect = dashboard?.userIds ? (
		<select
			name='ownerSelect'
			id='ownerSelectId'
			value={selectedOwner}
			onChange={e => setSelectedOwner(e.target.value)}>
			{dashboard.userIds.map(u => (
				<option value={u._id}>{u.name}</option>
			))}
		</select>
	) : (
		''
	)
	const nameContent = editMode ? nameInput : dashboard?.name
	const ownerContent = editMode && dashboard.isOwner ? ownerSelect : dashboard?.creatorId.name
	return (
		<>
			{dashboard && (
				<div className='d-flex flex-column gap-2'>
					<FormRow label={'Name'} content={nameContent} />
					<FormRow label={'Owner'} content={ownerContent} />
					<FormRow className='mb-2' label={'Creation date'} content={dashboard.created_at?.split('T')[0]} />
					{dashboard.userIds && dashboard.userIds.length > 0 && (
						<div className='d-flex flex-column gap-2'>
							<div className='d-flex justify-between align-center text-bold gap-2 card-subtitle mb-2'>
								Users
								<div className='d-flex gap-2'>
									{dashboard.isOwner && (
										<button
											className='btn btn-primary d-flex align-center gap-2'
											onClick={() => setActiveModal(addUserModalData)}>
											<Plus size={16} /> Add user
										</button>
									)}
								</div>
							</div>
							<div className='d-flex gap-2'>
								{dashboard.userIds.map(u => (
									<Card key={u._id}>
										<div className='d-flex align-center gap-2'>
											<User size={16} /> {u.name}
											{dashboard.isOwner && editMode && (
												<button className='btn btn-icon p-0' onClick={() => removeUser(u._id)}>
													<X size={16} />
												</button>
											)}
										</div>
									</Card>
								))}
							</div>
						</div>
					)}
					{editMode && (
						<div className='d-flex justify-center border-top border-light pt-4 mt-2 mx-n4'>
							<button className='btn btn-success d-flex gap-2' onClick={updateDashboard}>
								<Check size={16} /> Save dashboard
							</button>
						</div>
					)}
				</div>
			)}
		</>
	)
}
