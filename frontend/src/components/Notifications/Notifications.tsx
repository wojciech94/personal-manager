import { useEffect, useState } from 'react'
import { Check, Eye, X } from 'react-feather'
import { API_URL } from '../../config'
import { useAuth } from '../../contexts/AuthContext'
import { useFetchDashboardsContext } from '../../contexts/FetchDashboardsContext'
import { ApiError } from '../../types/global'
import { Alert } from '../Alert/Alert'
import { Button } from '../Button/Button'
import { Card, CardHeader } from '../Card/Card'
import { Notification } from './types'

export const Notifications = () => {
	const [notifications, setNotifications] = useState<Notification[]>([])
	const { fetchUserDashboards } = useFetchDashboardsContext()
	const { accessToken } = useAuth()

	useEffect(() => {
		fetchNotifications()
	}, [])

	const fetchNotifications = async () => {
		if (accessToken) {
			const res = await fetch(`${API_URL}notifications`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})

			if (!res.ok) {
				const error: ApiError = await res.json()
				console.error(error.message)
			} else {
				const data: Notification[] = await res.json()
				setNotifications(data)
			}
		}
	}

	const acceptInvitation = async (id: string) => {
		if (accessToken) {
			try {
				const res = await fetch(`${API_URL}notifications/accept`, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
					method: 'POST',
					body: JSON.stringify({ id }),
				})

				if (!res.ok) {
					const errorData: ApiError = await res.json()
					console.error(errorData.message)
					return
				}
				const data: Notification[] = await res.json()
				if (data) {
					await fetchUserDashboards()
					setNotifications(data)
				}
			} catch (error) {
				console.error(error)
			}
		}
	}

	const deleteInvitation = async (id: string) => {
		if (accessToken) {
			try {
				const res = await fetch(`${API_URL}notifications`, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
					method: 'DELETE',
					body: JSON.stringify({ id: id }),
				})
				if (!res.ok) {
					const errorData: ApiError = await res.json()
					console.error(errorData.message)
					return
				}
				fetchNotifications()
			} catch (error) {
				console.error(error)
			}
		}
	}

	return (
		<div className='content-container'>
			<Card headerComponent={<CardHeader title='Notifications' />} className='card-p0'>
				{notifications && notifications.length > 0 ? (
					<ul className='zebra rounded-3 overflow-hidden'>
						{notifications.map(n => (
							<li key={n._id} className='d-flex justify-between align-center px-4 py-2'>
								<div>{n.content}</div>
								<div>
									{n.type === 'info' ? (
										<div>
											<Button onlyIcon={true} variant='secondary'>
												<Eye size={16} />
											</Button>
										</div>
									) : (
										<div className='d-flex gap-2'>
											<Button onlyIcon={true} variant='success' onClick={() => acceptInvitation(n._id)}>
												<Check size={16} />
											</Button>
											<Button onlyIcon={true} variant='danger' onClick={() => deleteInvitation(n._id)}>
												<X size={16} />
											</Button>
										</div>
									)}
								</div>
							</li>
						))}
					</ul>
				) : (
					<Alert variant='primary'>You don't have any notifications.</Alert>
				)}
			</Card>
		</div>
	)
}
