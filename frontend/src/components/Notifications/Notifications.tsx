import { useEffect, useState } from 'react'
import { Check, Eye, X } from 'react-feather'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useFetchDashboardsContext } from '../../contexts/FetchDashboardsContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { ApiError } from '../../types/global'
import { Alert } from '../Alert/Alert'
import { Button } from '../Button/Button'
import { Card, CardHeader } from '../Card/Card'
import { Notification } from './types'

export const Notifications = () => {
	const [notifications, setNotifications] = useState<Notification[]>([])
	const { fetchUserDashboards } = useFetchDashboardsContext()
	const { fetchData } = useApi()
	const { t } = useTranslation()

	useEffect(() => {
		fetchNotifications()
	}, [])

	const fetchNotifications = async () => {
		const url = `${API_URL}notifications`

		const response = await fetchData<Notification[]>(url)

		if (response.error) {
			console.error('Failed to fetch notifications:', response.status, response.error)
			return
		}

		if (response.data) {
			const data = response.data
			setNotifications(data)
		}
	}

	const acceptInvitation = async (id: string) => {
		const url = `${API_URL}notifications/accept`
		const options = {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify({ id }),
		}

		const response = await fetchData<Notification[]>(url, options)

		if (response.error) {
			console.error('Failed to accept invitation:', response.status, response.error)
			return
		}

		if (response.data) {
			const data = response.data
			setNotifications(data)
			await fetchUserDashboards()
		}
	}

	const deleteInvitation = async (id: string) => {
		const url = `${API_URL}notifications`
		const options = {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'DELETE',
			body: JSON.stringify({ id: id }),
		}

		const response = await fetchData<Notification>(url, options)
		if (response.error) {
			console.error('Failed to delete notification:', response.status, response.error)
			return
		}

		fetchNotifications()
	}

	return (
		<div className='content-container'>
			<Card headerComponent={<CardHeader title={t('notifications')} />} contentClass='!p-0'>
				{notifications && notifications.length > 0 ? (
					<ul className='zebra rounded-lg overflow-hidden'>
						{notifications.map(n => (
							<li key={n._id} className='flex justify-between items-center px-4 py-2'>
								<div>{n.content}</div>
								<div>
									{n.type === 'info' ? (
										<div>
											<Button onlyIcon={true} variant='secondary'>
												<Eye size={16} />
											</Button>
										</div>
									) : (
										<div className='flex gap-2'>
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
					<Alert variant='primary'>{t('you_dont_have_notifications')}</Alert>
				)}
			</Card>
		</div>
	)
}
