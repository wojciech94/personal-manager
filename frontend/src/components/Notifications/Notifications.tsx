import { useEffect, useState } from 'react'
import { Check, Eye, X } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useAuth } from '../../contexts/AuthContext'
import { ApiError } from '../../main'
import { Alert } from '../Alert/Alert'
import { Button } from '../Button/Button'
import { Card, CardHeader } from '../Card/Card'

type Notification = {
	_id: string
	content: string
	type: 'invitation' | 'info'
}

export const Notifications = () => {
	const [notifications, setNotifications] = useState<Notification[]>([])
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
				} else {
					console.log(`Invitation accepted`)
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
				} else {
					fetchNotifications()
				}
			} catch (error) {
				console.error(error)
			}
		}
	}

	const header = <CardHeader title='Notifications' />
	return (
		<div className='content-container'>
			<Card headerComponent={header} className='card-p0'>
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
