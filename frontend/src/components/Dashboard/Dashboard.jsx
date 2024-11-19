import { Menu } from '../Menu/Menu'
import { Outlet, useMatch, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../Card/Card'
import { useEffect, useState } from 'react'
import { FormRow } from '../FormRow/FormRow'
import { Edit, Plus, User, X } from 'react-feather'
import { useContext } from 'react'
import { ModalContext } from '../../contexts/ModalContext'

export const Dashboard = () => {
	const isExactMatch = useMatch('/dashboards/:dashboardId')
	return (
		<div className='d-flex justify-between align-start gap-5'>
			<Menu />
			<div className='flex-1 max-w-1200px mx-auto p-5'>
				{isExactMatch ? (
					<Card title='Dashboard details'>
						<DashboardDetails />
					</Card>
				) : (
					<Outlet />
				)}
			</div>
		</div>
	)
}

const DashboardDetails = () => {
	const { dashboardId } = useParams()
	const [dashboard, setDashboard] = useState(null)
	const [, setActiveModal] = useContext(ModalContext)
	const [editMode, setEditMode] = useState(false)
	const navigate = useNavigate()

	const getDetails = async () => {
		const token = localStorage.getItem('token')
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
		}
	}

	useEffect(() => {
		getDetails()
	}, [dashboardId])

	const handleRemoveUser = async id => {
		const token = localStorage.getItem('token')
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

	return (
		<>
			{dashboard && (
				<div className='d-flex flex-column gap-2'>
					<FormRow label={'Name'} content={dashboard.name} />
					<FormRow label={'Owner'} content={dashboard.creatorId.name} />
					<FormRow className='mb-2' label={'Creation date'} content={dashboard.created_at?.split('T')[0]} />
					{dashboard.userIds && dashboard.userIds.length > 0 && (
						<div className='d-flex flex-column gap-2'>
							<div className='d-flex justify-between align-center text-bold gap-2 card-subtitle mb-2'>
								Users
								<div className='d-flex gap-2'>
									{dashboard.isOwner ? (
										<>
											<button
												className='btn btn-primary d-flex align-center gap-2'
												onClick={() => setActiveModal(addUserModalData)}>
												<Plus size={16} /> Add user
											</button>
											<button
												className='btn btn-primary d-flex align-center gap-2'
												onClick={() => setEditMode(prevState => !prevState)}>
												<Edit size={16} />
												{editMode ? 'Details mode' : 'Edit mode'}
											</button>
										</>
									) : (
										<button className='btn btn-danger' onClick={() => handleRemoveUser(null)}>
											Drop dashboard
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
												<button className='btn btn-icon p-0' onClick={() => handleRemoveUser(u._id)}>
													<X size={16} />
												</button>
											)}
										</div>
									</Card>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</>
	)
}
